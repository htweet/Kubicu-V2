import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { OpsData } from '../types/ops';
import { useWorkspace } from './WorkspaceContext';
import { seedsSample } from '../utils/workspaceStorage';
import { emptyOps, opsKey, readOps, writeOps } from '../utils/ops/storage';
import { clearOpsSample } from '../utils/ops/ops';
import { withOpsClassSample, withOpsSample } from '../data/opsSeed';
import { useOptionalTeam } from './TeamContext';
import type { Permission } from '../types/team';

const OPS_WRITE: Permission[] = ['bookings.manage', 'contacts.manage', 'automations.manage'];

interface OpsValue {
  data: OpsData;
  apply: (fn: (d: OpsData) => OpsData) => boolean;
  /** Not tied to the signed-in member: visitors' bookings, forms and order syncing. */
  applySystem: (fn: (d: OpsData) => OpsData) => boolean;
  loadSample: () => void;
  clearSample: () => void;
  hasSample: boolean;
}

const OpsContext = createContext<OpsValue | null>(null);

function initial(workspaceId: string): OpsData {
  const stored = readOps(workspaceId);
  if (stored) return seedsSample(workspaceId) && !stored.sampleClassSeeded && stored.services.some((s) => s.sample) ? withOpsClassSample(stored) : stored;
  return seedsSample(workspaceId) ? withOpsSample(emptyOps()) : emptyOps();
}

/** Bookings, contacts and automations for the current workspace, saved in this browser. */
export function OpsProvider({ children }: { children: React.ReactNode }) {
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
    }
  }, [workspaceId]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== opsKey(workspaceId)) return;
      const next = readOps(workspaceId);
      if (next) setData(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [workspaceId]);

  const applySystem = useCallback(
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
    [workspaceId],
  );

  // Team members' changes follow their role (D57); visitors' bookings and sign-ups use applySystem.
  const team = useOptionalTeam();
  const writer = team ? OPS_WRITE.find((p) => team.can(p).allowed) : 'bookings.manage';
  const apply = useCallback(
    (fn: (d: OpsData) => OpsData) => {
      if (!writer) {
        toast.error('Your role can’t change this', { description: team?.can('contacts.manage').reason });
        return false;
      }
      return applySystem(fn);
    },
    [applySystem, writer, team],
  );

  const loadSample = useCallback(() => {
    if (apply((d) => withOpsSample(clearOpsSample(d)))) toast('Sample data added', { description: 'Sample records are labelled and can be cleared.' });
  }, [apply]);
  const clearSample = useCallback(() => {
    if (apply((d) => ({ ...clearOpsSample(d), sampleSeeded: true }))) toast('Sample data cleared');
  }, [apply]);

  const hasSample = useMemo(() => data.services.some((s) => s.sample) || data.bookings.some((b) => b.sample) || data.contacts.some((c) => c.sample) || data.automations.some((a) => a.sample), [data]);
  const value = useMemo(() => ({ data, apply, applySystem, loadSample, clearSample, hasSample }), [data, apply, applySystem, loadSample, clearSample, hasSample]);
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
