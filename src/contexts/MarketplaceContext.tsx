import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { InstalledExtension, MarketplaceData } from '../types/marketplace';
import { useWorkspace } from './WorkspaceContext';
import { useTeam } from './TeamContext';
import { useOps } from './OpsContext';
import { useCommerce } from './CommerceContext';
import { extensionById, partnerZones } from '../data/extensions';
import { emptyMarketplace, extensionActive, marketplaceKey, readMarketplace, writeMarketplace } from '../utils/marketplace';
import { newAutomation } from '../components/automations/AutomationBuilder';
import { uid } from '../utils/id';

interface MarketplaceValue {
  data: MarketplaceData;
  isActive: (id: string) => boolean;
  install: (id: string, settings: Record<string, string>) => void;
  uninstall: (id: string) => void;
  setPaused: (id: string, paused: boolean) => void;
  updateSettings: (id: string, settings: Record<string, string>) => void;
  rollback: (id: string) => void;
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

  const value = useMemo<MarketplaceValue>(
    () => ({
      data,
      isActive: (id) => extensionActive(data, id),
      install: (id, settings) => {
        const info = extensionById[id];
        const record: InstalledExtension = { id, version: info.version, installedAt: new Date().toISOString(), paused: false, settings };
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
        team.log('settings', `uninstalled the ${extensionById[id].name} extension`, '/app/extensions');
      },
      setPaused: (id, paused) => {
        patch(id, { paused });
        team.log('settings', `${paused ? 'paused' : 'resumed'} the ${extensionById[id].name} extension`, `/app/extensions?ext=${id}`);
      },
      updateSettings: (id, settings) => {
        patch(id, { settings });
        team.log('settings', `changed settings for ${extensionById[id].name}`, `/app/extensions?ext=${id}`);
      },
      rollback: (id) => {
        const info = extensionById[id];
        const prev = info.versions[1]?.version;
        if (!prev) return;
        patch(id, { version: prev });
        team.log('settings', `rolled ${info.name} back to ${prev}`, `/app/extensions?ext=${id}`);
      },
      hasLicence: (templateId) => data.templateLicences.includes(templateId),
      addLicence: (templateId) => apply((d) => ({ ...d, templateLicences: Array.from(new Set([...d.templateLicences, templateId])) }))
    }),
    [data, apply, patch, ops, commerce, team]
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace(): MarketplaceValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return ctx;
}