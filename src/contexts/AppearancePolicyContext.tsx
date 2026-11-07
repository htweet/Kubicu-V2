import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { VisualDirection } from '../types/direction';
import { visualDirections } from '../data/visualDirections';
import { uid } from '../utils/id';

const STORAGE_KEY = 'kubicu.appearancePolicy';
/** Illustrative signed-in staff member for the prototype. */
export const ADMIN_ACTOR = 'Tolu Bakare · Platform design admin';

export interface PolicyChange {
  id: string;
  at: string;
  actor: string;
  summary: string;
}

interface AppearancePolicy {
  enabled: VisualDirection[];
  defaultDirection: VisualDirection;
  changes: PolicyChange[];
}

interface AppearancePolicyValue extends AppearancePolicy {
  setEnabled: (id: VisualDirection, enabled: boolean) => void;
  setDefault: (id: VisualDirection) => void;
}

const allIds = visualDirections.map((d) => d.id);
const nameOf = (id: VisualDirection) => visualDirections.find((d) => d.id === id)?.name ?? id;

const AppearancePolicyContext = createContext<AppearancePolicyValue | null>(null);

function readStored(fallbackDefault: VisualDirection): AppearancePolicy {
  const base: AppearancePolicy = { enabled: allIds, defaultDirection: fallbackDefault, changes: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AppearancePolicy>;
    const enabled = (parsed.enabled ?? allIds).filter((id) => allIds.includes(id));
    const def = parsed.defaultDirection && enabled.includes(parsed.defaultDirection) ? parsed.defaultDirection : enabled[0];
    if (!def) return base;
    return { enabled, defaultDirection: def, changes: Array.isArray(parsed.changes) ? parsed.changes.slice(0, 20) : [] };
  } catch {
    return base;
  }
}

/**
 * Platform-wide appearance policy, controlled from the super-admin Design system.
 * Decides which of the directions workspace users may choose and which one is the default.
 */
export function AppearancePolicyProvider({ initialDefault, children }: { initialDefault: VisualDirection; children: React.ReactNode }) {
  const [policy, setPolicy] = useState<AppearancePolicy>(() => readStored(initialDefault));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
    } catch {
      // Storage unavailable — policy applies for this session only.
    }
  }, [policy]);

  const log = (prev: AppearancePolicy, summary: string): PolicyChange[] =>
    [{ id: uid('chg'), at: new Date().toISOString(), actor: ADMIN_ACTOR, summary }, ...prev.changes].slice(0, 20);

  const setEnabled = useCallback((id: VisualDirection, on: boolean) => {
    setPolicy((prev) => {
      if (on === prev.enabled.includes(id)) return prev;
      // The default must stay available, and at least one direction must remain.
      if (!on && (id === prev.defaultDirection || prev.enabled.length <= 1)) return prev;
      const enabled = on ? allIds.filter((x) => x === id || prev.enabled.includes(x)) : prev.enabled.filter((x) => x !== id);
      return { ...prev, enabled, changes: log(prev, `${on ? 'Made available' : 'Withdrew'} “${nameOf(id)}” for workspaces`) };
    });
  }, []);

  const setDefault = useCallback((id: VisualDirection) => {
    setPolicy((prev) => {
      if (prev.defaultDirection === id) return prev;
      const enabled = prev.enabled.includes(id) ? prev.enabled : allIds.filter((x) => x === id || prev.enabled.includes(x));
      return { ...prev, enabled, defaultDirection: id, changes: log(prev, `Set “${nameOf(id)}” as the default appearance`) };
    });
  }, []);

  const value = useMemo(() => ({ ...policy, setEnabled, setDefault }), [policy, setEnabled, setDefault]);
  return <AppearancePolicyContext.Provider value={value}>{children}</AppearancePolicyContext.Provider>;
}

export function useAppearancePolicy(): AppearancePolicyValue {
  const ctx = useContext(AppearancePolicyContext);
  if (!ctx) throw new Error('useAppearancePolicy must be used inside AppearancePolicyProvider');
  return ctx;
}
