import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CampaignLink, CheckOutcome, CustomDomain, CustomRedirect, DomainsData, QrDesign } from '../types/domains';
import { useWorkspace } from './WorkspaceContext';
import { seedsSample } from '../utils/workspaceStorage';
import { domainsKey, emptyDomains, readDomains, writeDomains } from '../utils/domains/storage';
import { sampleDomains } from '../data/domainsSeed';
import { uid } from '../utils/id';

interface DomainsValue {
  data: DomainsData;
  /** Applies a pure update and saves it. Returns false if saving failed. */
  apply: (fn: (d: DomainsData) => DomainsData) => boolean;
  addDomain: (d: Pick<CustomDomain, 'host' | 'kind' | 'spaceId' | 'token'>) => string;
  /** Simulated check (D62): verifying → certificate → live, or a problem. */
  checkDomain: (id: string, outcome: CheckOutcome) => void;
  removeDomain: (id: string) => void;
  saveLink: (link: CampaignLink) => boolean;
  /** Only for links no QR code uses (D230). */
  deleteLink: (id: string) => boolean;
  saveQr: (qr: QrDesign, link: CampaignLink) => boolean;
  deleteQr: (id: string) => void;
  saveRedirect: (r: CustomRedirect) => boolean;
  deleteRedirect: (id: string) => void;
}

const DomainsContext = createContext<DomainsValue | null>(null);

function initial(workspaceId: string): DomainsData {
  const stored = readDomains(workspaceId);
  if (stored) return stored;
  return seedsSample(workspaceId) ? { ...emptyDomains(), ...sampleDomains(), sampleSeeded: true } : emptyDomains();
}

/** A check interrupted by closing the app resumes sensibly: certificates finish, verification asks to check again. */
function settleInterrupted(d: DomainsData): DomainsData {
  if (!d.domains.some((x) => x.status === 'verifying' || x.status === 'issuing')) return d;
  return {
    ...d,
    domains: d.domains.map((x) =>
      x.status === 'issuing' ? { ...x, status: 'live', liveAt: x.liveAt ?? new Date().toISOString() } : x.status === 'verifying' ? { ...x, status: 'waiting_dns' } : x,
    ),
  };
}

/** Custom domains, short links, QR codes and redirects for the current workspace (D62). */
export function DomainsProvider({ children }: { children: React.ReactNode }) {
  const workspaceId = useWorkspace().current.id;
  const [data, setData] = useState<DomainsData>(() => settleInterrupted(initial(workspaceId)));
  const ref = useRef(data);
  ref.current = data;
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      writeDomains(workspaceId, ref.current);
    } catch {
      // Storage unavailable — changes last until the tab closes.
    }
    const refresh = () => {
      const next = readDomains(workspaceId);
      if (next) setData(next);
    };
    const onStorage = (e: StorageEvent) => e.key === domainsKey(workspaceId) && refresh();
    window.addEventListener('storage', onStorage);
    const pending = timers.current;
    return () => {
      window.removeEventListener('storage', onStorage);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, [workspaceId]);

  const apply = useCallback(
    (fn: (d: DomainsData) => DomainsData) => {
      const next = fn(ref.current);
      try {
        writeDomains(workspaceId, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Browser storage is full.' });
        return false;
      }
      ref.current = next;
      setData(next);
      return true;
    },
    [workspaceId],
  );

  const patchDomain = useCallback((id: string, patch: Partial<CustomDomain>) => apply((d) => ({ ...d, domains: d.domains.map((x) => (x.id === id ? { ...x, ...patch } : x)) })), [apply]);

  const value = useMemo<DomainsValue>(
    () => ({
      data,
      apply,
      addDomain: (input) => {
        const id = uid('dom');
        apply((d) => ({ ...d, domains: [...d.domains, { ...input, id, status: 'waiting_dns', createdAt: new Date().toISOString(), primary: false, redirectKubicu: false }] }));
        return id;
      },
      checkDomain: (id, outcome) => {
        patchDomain(id, { status: 'verifying', problem: undefined, checkedAt: new Date().toISOString() });
        timers.current.push(
          window.setTimeout(() => {
            if (outcome === 'wrong_record') return patchDomain(id, { status: 'problem', problem: 'wrong_record' });
            if (outcome === 'timeout') return patchDomain(id, { status: 'waiting_dns', problem: 'timeout' });
            patchDomain(id, { status: 'issuing' });
            timers.current.push(
              window.setTimeout(() => {
                apply((d) => {
                  const dom = d.domains.find((x) => x.id === id);
                  if (!dom) return d;
                  const hasPrimary = d.domains.some((x) => x.id !== id && x.spaceId === dom.spaceId && x.status === 'live' && x.primary);
                  return { ...d, domains: d.domains.map((x) => (x.id === id ? { ...x, status: 'live', liveAt: new Date().toISOString(), primary: !hasPrimary } : x)) };
                });
                const host = ref.current.domains.find((x) => x.id === id)?.host;
                toast.success(`${host ?? 'Your domain'} is live`, { description: 'Secure (https) and showing your page.' });
              }, 1700),
            );
          }, 1500),
        );
      },
      removeDomain: (id) => apply((d) => ({ ...d, domains: d.domains.filter((x) => x.id !== id) })),
      saveLink: (link) => apply((d) => ({ ...d, links: d.links.some((l) => l.id === link.id) ? d.links.map((l) => (l.id === link.id ? link : l)) : [...d.links, link] })),
      deleteLink: (id) => (ref.current.qrs.some((q) => q.linkId === id) ? false : apply((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) }))),
      saveQr: (qr, link) =>
        apply((d) => ({
          ...d,
          links: d.links.some((l) => l.id === link.id) ? d.links.map((l) => (l.id === link.id ? link : l)) : [...d.links, link],
          qrs: d.qrs.some((q) => q.id === qr.id) ? d.qrs.map((q) => (q.id === qr.id ? qr : q)) : [...d.qrs, qr],
        })),
      deleteQr: (id) => apply((d) => ({ ...d, qrs: d.qrs.filter((q) => q.id !== id) })),
      saveRedirect: (r) => apply((d) => ({ ...d, redirects: d.redirects.some((x) => x.id === r.id) ? d.redirects.map((x) => (x.id === r.id ? r : x)) : [...d.redirects, r] })),
      deleteRedirect: (id) => apply((d) => ({ ...d, redirects: d.redirects.filter((x) => x.id !== id) })),
    }),
    [data, apply, patchDomain],
  );
  return <DomainsContext.Provider value={value}>{children}</DomainsContext.Provider>;
}

export function useDomains(): DomainsValue {
  const ctx = useContext(DomainsContext);
  if (!ctx) throw new Error('useDomains must be used inside DomainsProvider');
  return ctx;
}
