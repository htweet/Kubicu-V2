import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { VisualDirection } from '../types/direction';
import { visualDirections } from '../data/visualDirections';
import { useAppearancePolicy } from './AppearancePolicyContext';

import { useWorkspace } from './WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';

/** Appearance is a workspace setting: everyone in the workspace sees the same look. */
const storageKey = (workspaceId: string) => `kubicu.appearance.${workspaceId}`;
const LEGACY_KEY = 'kubicu.direction';
const DARK: VisualDirection = 'darkStudio';

/** A fixed appearance, or "system": follow each person's device light/dark setting (D205). */
export type AppearancePreference = VisualDirection | 'system';

interface DirectionContextValue {
  /** The appearance actually applied (always one the platform allows). */
  direction: VisualDirection;
  /** What the workspace chose — `system` when it follows the device. */
  preference: AppearancePreference;
  /** True when System mode is available (the platform allows both a dark and a light appearance). */
  systemAvailable: boolean;
  setDirection: (direction: AppearancePreference) => void;
}

const DirectionContext = createContext<DirectionContextValue>({ direction: DARK, preference: DARK, systemAvailable: false, setDirection: () => undefined });

function readStored(workspaceId: string): AppearancePreference | null {
  try {
    const raw =
    window.localStorage.getItem(storageKey(workspaceId)) ?? (
    workspaceId === DEMO_WORKSPACE_ID ? window.localStorage.getItem(LEGACY_KEY) : null);
    if (raw === 'system') return 'system';
    return visualDirections.some((d) => d.id === raw) ? raw as VisualDirection : null;
  } catch {
    return null;
  }
}

function usePrefersDark(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    setDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return dark;
}

/**
 * The current workspace's appearance. Starts from the workspace's saved choice, falling back
 * to the platform default. If super admin withdraws it, the default applies until it returns.
 * In System mode, dark devices get Dark studio and light devices get the light appearance —
 * the platform default when it's light, otherwise the first light one allowed.
 */
export function DirectionProvider({ direction: controlDefault, children }: {direction: VisualDirection;children: React.ReactNode;}) {
  const policy = useAppearancePolicy();
  const workspaceId = useWorkspace().current.id;
  const [preference, setPreference] = useState<AppearancePreference | null>(() => readStored(workspaceId));
  const firstRun = useRef(true);
  const prefersDark = usePrefersDark();

  // The Controls panel prop acts as a direct override when changed.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPreference(controlDefault);
  }, [controlDefault]);

  const lightOption = policy.defaultDirection !== DARK && policy.enabled.includes(policy.defaultDirection) ? policy.defaultDirection : policy.enabled.find((d) => d !== DARK);
  const systemAvailable = policy.enabled.includes(DARK) && !!lightOption;

  const direction: VisualDirection =
  preference === 'system' ?
  systemAvailable ?
  prefersDark ?
  DARK :
  lightOption as VisualDirection :
  policy.defaultDirection :
  preference && policy.enabled.includes(preference) ?
  preference :
  policy.defaultDirection;

  useEffect(() => {
    document.documentElement.dataset.direction = direction;
    document.documentElement.style.colorScheme = direction === DARK ? 'dark' : 'light';
  }, [direction]);

  useEffect(() => {
    if (!preference) return;
    try {
      window.localStorage.setItem(storageKey(workspaceId), preference);
    } catch {

      // Storage unavailable — the choice still applies for this session.
    }}, [preference, workspaceId]);

  return (
    <DirectionContext.Provider value={{ direction, preference: preference ?? direction, systemAvailable, setDirection: setPreference }}>
      <div data-direction={direction} className="h-full">
        {children}
      </div>
    </DirectionContext.Provider>);

}

export function useDirection(): VisualDirection {
  return useContext(DirectionContext).direction;
}

export function useDirectionControl(): DirectionContextValue {
  return useContext(DirectionContext);
}