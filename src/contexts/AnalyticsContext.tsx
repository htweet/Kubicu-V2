import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { AnalyticsData, AnalyticsSettings } from '../types/analytics';
import { useWorkspace } from './WorkspaceContext';
import { seedsSample } from '../utils/workspaceStorage';
import { analyticsKey, emptyAnalytics, readAnalytics, writeAnalytics } from '../utils/analytics/storage';
import { sampleAnalytics } from '../data/analyticsSeed';

interface AnalyticsValue {
  data: AnalyticsData;
  updateSettings: (patch: Partial<AnalyticsSettings>) => void;
  dismissInsight: (id: string) => void;
  clearSample: () => void;
  loadSample: () => void;
  clearAll: () => void;
}

const AnalyticsContext = createContext<AnalyticsValue | null>(null);

function initial(workspaceId: string): AnalyticsData {
  const stored = readAnalytics(workspaceId);
  if (stored) return stored;
  const base = emptyAnalytics();
  return seedsSample(workspaceId) ? { ...base, events: sampleAnalytics(), sampleSeeded: true } : base;
}

/** The workspace's recorded visits (D61). Public pages write; workspace screens read and refresh. */
export function AnalyticsProvider({ children }: {children: React.ReactNode;}) {
  const workspaceId = useWorkspace().current.id;
  const [data, setData] = useState<AnalyticsData>(() => initial(workspaceId));
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    try {
      if (!readAnalytics(workspaceId)) writeAnalytics(workspaceId, ref.current);
    } catch {

      // Storage unavailable — nothing recorded this visit.
    }const refresh = () => {
      const next = readAnalytics(workspaceId);
      if (next) setData(next);
    };
    const onStorage = (e: StorageEvent) => e.key === analyticsKey(workspaceId) && refresh();
    const onLocal = (e: Event) => (e as CustomEvent).detail === workspaceId && refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('kubicu:analytics', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('kubicu:analytics', onLocal);
    };
  }, [workspaceId]);

  const apply = useCallback(
    (fn: (d: AnalyticsData) => AnalyticsData) => {
      const next = fn(readAnalytics(workspaceId) ?? ref.current);
      try {
        writeAnalytics(workspaceId, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Browser storage is full.' });
        return;
      }
      setData(readAnalytics(workspaceId) ?? next);
    },
    [workspaceId]
  );

  const value = useMemo<AnalyticsValue>(
    () => ({
      data,
      updateSettings: (patch) => apply((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      dismissInsight: (id) => apply((d) => ({ ...d, dismissedInsights: [...d.dismissedInsights, id] })),
      clearSample: () => {
        apply((d) => ({ ...d, events: d.events.filter((e) => !e.sample), sampleSeeded: true }));
        toast('Sample visits cleared');
      },
      loadSample: () => {
        apply((d) => ({ ...d, events: [...d.events.filter((e) => !e.sample), ...sampleAnalytics()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)), sampleSeeded: true }));
        toast('Sample visits added', { description: 'Labelled “Sample” everywhere they appear.' });
      },
      clearAll: () => {
        apply((d) => ({ ...d, events: [] }));
        toast('All visit data deleted');
      }
    }),
    [data, apply]
  );
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used inside AnalyticsProvider');
  return ctx;
}