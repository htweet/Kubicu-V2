import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import type { InstalledExtension, MarketplaceData } from '../types/marketplace';
import { useWorkspace } from './WorkspaceContext';
import { useTeam } from './TeamContext';
import { useOps } from './OpsContext';
import { useCommerce } from './CommerceContext';
import { extensionById, partnerZones } from '../data/extensions';
import { emptyMarketplace, extensionActive, marketplaceKey, readMarketplace, writeMarketplace } from '../utils/marketplace';
import { newAutomation } from '../components/automations/AutomationBuilder';
import { uid } from '../utils/id';
import { useAdminStore } from '../utils/admin/store';
import { readSubmissions } from '../utils/extensionSubmissions';

// Listed developer extensions join the catalogue lookup before anything reads installed records (D132).
if (typeof window !== 'undefined') readSubmissions();

interface MarketplaceValue {
  data: MarketplaceData;
  isActive: (id: string) => boolean;
  install: (id: string, settings: Record<string, string>) => void;
  uninstall: (id: string) => void;
  setPaused: (id: string, paused: boolean) => void;
  updateSettings: (id: string, settings: Record<string, string>) => void;
  rollback: (id: string) => void;
  /** Retired extension → its new home: installs that app if needed, then removes the old record (D231). */
  moveRetired: (id: string) => void;
  hasLicence: (templateId: string) => boolean;
  addLicence: (templateId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceValue | null>(null);

/** Installed extensions and template licences for the current workspace (D67). */
export function MarketplaceProvider({ children }: {children: React.ReactNode;}) {
  const { current } = useWorkspace();
  const team = useTeam();
  const ops = useOps();
  const commerce = useCommerce();
  const [data, setData] = useState<MarketplaceData>(() => readMarketplace(current.id));
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === marketplaceKey(current.id)) setData(readMarketplace(current.id));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [current.id]);

  const apply = useCallback(
    (fn: (d: MarketplaceData) => MarketplaceData) => {
      const next = fn(ref.current ?? emptyMarketplace());
      ref.current = next;
      setData(next);
      try {
        writeMarketplace(current.id, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Browser storage is full.' });
      }
    },
    [current.id]
  );

  const patch = useCallback((id: string, p: Partial<InstalledExtension>) => apply((d) => d.installed[id] ? { ...d, installed: { ...d.installed, [id]: { ...d.installed[id], ...p } } } : d), [apply]);

  // KUBICU pulled a version platform-wide (D130): move this workspace off it and say why.
  const [adminStore] = useAdminStore();
  const pulls = adminStore.extensionPulls;
  useEffect(() => {
    Object.values(data.installed).forEach((rec) => {
      const pull = pulls[rec.id];
      if (pull && rec.version === pull.pulledVersion) {
        patch(rec.id, { version: pull.to });
        toast(`${extensionById[rec.id]?.name ?? 'An extension'} moved to ${pull.to}`, { description: `KUBICU withdrew ${pull.pulledVersion}: ${pull.reason}` });
      }
    });
  }, [pulls, data.installed, patch]);

  // One-time "this is now part of…" notice for retired extensions (D231), only inside the app.
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inApp = pathname.startsWith('/app');
  useEffect(() => {
    if (!inApp) return;
    const noticed = new Set(data.retiredNoticed ?? []);
    const fresh = Object.keys(data.installed).filter((id) => extensionById[id]?.retired && !noticed.has(id));
    if (!fresh.length) return;
    fresh.forEach((id) => {
      const info = extensionById[id];
      const r = info.retired!;
      toast(`${info.name} is now part of ${r.movedTo}`, {
        description: 'Nothing stops working. Open Extensions to move it when you’re ready.',
        duration: 10000,
        action: { label: 'See where', onClick: () => navigate(`/app/extensions?ext=${id}`) }
      });
    });
    apply((d) => ({ ...d, retiredNoticed: Array.from(new Set([...(d.retiredNoticed ?? []), ...fresh])) }));
  }, [inApp, data.installed, data.retiredNoticed, apply, navigate]);

  const value = useMemo<MarketplaceValue>(
    () => ({
      data,
      isActive: (id) => extensionActive(data, id),
      install: (id, settings) => {
        const info = extensionById[id];
        const pull = pulls[id];
        const record: InstalledExtension = { id, version: pull && pull.pulledVersion === info.version ? pull.to : info.version, installedAt: new Date().toISOString(), paused: false, settings };
        // What installing genuinely changes in the workspace.
        if (id === 'abandoned-cart') {
          const automation = { ...newAutomation('abandoned'), status: 'draft' as const };
          ops.applySystem((d) => ({ ...d, automations: [...d.automations, automation] }));
          record.automationId = automation.id;
        }
        if (id === 'delivery-partners') {
          const zones = partnerZones.map((z) => ({ ...z, id: uid('zone') }));
          commerce.applySystem((d) => ({ ...d, fulfilment: { ...d.fulfilment, deliveryEnabled: true, zones: [...d.fulfilment.zones, ...zones] } }));
          record.addedZoneIds = zones.map((z) => z.id);
        }
        apply((d) => ({ ...d, installed: { ...d.installed, [id]: record } }));
        team.log('settings', `installed the ${info.name} extension`, `/app/extensions?ext=${id}`);
      },
      uninstall: (id) => {
        const rec = ref.current.installed[id];
        if (!rec) return;
        if (rec.addedZoneIds?.length) {
          const ids = new Set(rec.addedZoneIds);
          commerce.applySystem((d) => ({ ...d, fulfilment: { ...d.fulfilment, zones: d.fulfilment.zones.filter((z) => !ids.has(z.id)) } }));
        }
        apply((d) => {
          const installed = { ...d.installed };
          delete installed[id];
          return { ...d, installed };
        });
        team.log('settings', `uninstalled the ${extensionById[id]?.name ?? 'an'} extension`, '/app/extensions');
      },
      setPaused: (id, paused) => {
        patch(id, { paused });
        team.log('settings', `${paused ? 'paused' : 'resumed'} the ${extensionById[id]?.name ?? 'an'} extension`, `/app/extensions?ext=${id}`);
      },
      updateSettings: (id, settings) => {
        patch(id, { settings });
        team.log('settings', `changed settings for ${extensionById[id]?.name ?? 'an extension'}`, `/app/extensions?ext=${id}`);
      },
      rollback: (id) => {
        const info = extensionById[id];
        const prev = info?.versions[1]?.version;
        if (!prev) return;
        patch(id, { version: prev });
        team.log('settings', `rolled ${info.name} back to ${prev}`, `/app/extensions?ext=${id}`);
      },
      moveRetired: (id) => {
        const info = extensionById[id];
        const r = info?.retired;
        if (!r) return;
        const target = r.installs ? extensionById[r.installs] : undefined;
        apply((d) => {
          const installed = { ...d.installed };
          delete installed[id];
          if (target && !installed[target.id]) installed[target.id] = { id: target.id, version: target.version, installedAt: new Date().toISOString(), paused: false, settings: {} };
          return { ...d, installed };
        });
        team.log('settings', `moved ${info.name} to ${r.movedTo}`, r.href);
      },
      hasLicence: (templateId) => data.templateLicences.includes(templateId),
      addLicence: (templateId) => apply((d) => ({ ...d, templateLicences: Array.from(new Set([...d.templateLicences, templateId])) }))
    }),
    [data, apply, patch, ops, commerce, team, pulls]
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace(): MarketplaceValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return ctx;
}