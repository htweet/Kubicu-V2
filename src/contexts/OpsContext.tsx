import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { OpsData } from '../types/ops';
import { useWorkspace } from './WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { emptyOps, opsKey, readOps, writeOps } from '../utils/ops/storage';
import { clearOpsSample } from '../utils/ops/ops';
import { withOpsSample } from '../data/opsSeed';

interface OpsValue {
  data: OpsData;
  apply: (fn: (d: OpsData) => OpsData) => boolean;
  loadSample: () => void;
  clearSample: () => void;
  hasSample: boolean;
}

const OpsContext = createContext<OpsValue | null>(null);

function initial(workspaceId: string): OpsData {
  return readOps(workspaceId) ?? (workspaceId === DEMO_WORKSPACE_ID ? withOpsSample(emptyOps()) : emptyOps());
}

/** Bookings, contacts and automations for the current workspace, saved in this browser. */
export function OpsProvider({ children }: {children: React.ReactNode;}) {
  const workspaceId = useWorkspace().current.id;
  const [data, setData] = useState<OpsData>(() => initial(workspaceId));
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    if (readOps(workspaceId)) return;
    try {
      writeOps(workspaceId, ref.current);
    } catch {

      // Storage unavailable.
    }}, [workspaceId]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== opsKey(workspaceId)) return;
      const next = readOps(workspaceId);
      if (next) setData(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [workspaceId]);

  const apply = useCallback(
    (fn: (d: OpsData) => OpsData) => {
      const next = fn(ref.current);
      if (next === ref.current) return true;
      try {
        writeOps(workspaceId, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Your browser storage is full.' });
        return false;
      }
      ref.current = next;
      setData(next);
      return true;
    },
    [workspaceId]
  );

  const loadSample = useCallback(() => {
    if (apply((d) => withOpsSample(clearOpsSample(d)))) toast('Sample data added', { description: 'Sample records are labelled and can be cleared.' });
  }, [apply]);
  const clearSample = useCallback(() => {
    if (apply((d) => ({ ...clearOpsSample(d), sampleSeeded: true }))) toast('Sample data cleared');
  }, [apply]);

  const hasSample = useMemo(() => data.services.some((s) => s.sample) || data.bookings.some((b) => b.sample) || data.contacts.some((c) => c.sample) || data.automations.some((a) => a.sample), [data]);
  const value = useMemo(() => ({ data, apply, loadSample, clearSample, hasSample }), [data, apply, loadSample, clearSample, hasSample]);
  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps(): OpsValue {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error('useOps must be used inside OpsProvider');
  return ctx;
}

export function useOptionalOps(): OpsValue | null {
  return useContext(OpsContext);
}