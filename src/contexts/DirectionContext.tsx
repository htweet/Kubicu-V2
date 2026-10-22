import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { VisualDirection } from '../types/direction';
import { visualDirections } from '../data/visualDirections';
import { useAppearancePolicy } from './AppearancePolicyContext';

import { useWorkspace } from './WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';

/** Appearance is a workspace setting: everyone in the workspace sees the same look. */
const storageKey = (workspaceId: string) => `kubicu.appearance.${workspaceId}`;
const LEGACY_KEY = 'kubicu.direction';

interface DirectionContextValue {
  /** The appearance actually applied (always one the platform allows). */
  direction: VisualDirection;
  setDirection: (direction: VisualDirection) => void;
}

const DirectionContext = createContext<DirectionContextValue>({ direction: 'darkStudio', setDirection: () => undefined });

function readStored(workspaceId: string): VisualDirection | null {
  try {
    const raw =
    window.localStorage.getItem(storageKey(workspaceId)) ?? (
    workspaceId === DEMO_WORKSPACE_ID ? window.localStorage.getItem(LEGACY_KEY) : null);
    return visualDirections.some((d) => d.id === raw) ? raw as VisualDirection : null;
  } catch {
    return null;
  }
}

/**
 * The current workspace's appearance. Starts from the workspace's saved choice, falling back
 * to the platform default. If super admin withdraws it, the default applies until it returns.
 */
export function DirectionProvider({ direction: controlDefault, children }: {direction: VisualDirection;children: React.ReactNode;}) {
  const policy = useAppearancePolicy();
  const workspaceId = useWorkspace().current.id;
  const [preference, setPreference] = useState<VisualDirection | null>(() => readStored(workspaceId));
  const firstRun = useRef(true);

  // The Controls panel prop acts as a direct override when changed.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPreference(controlDefault);
  }, [controlDefault]);

  const direction = preference && policy.enabled.includes(preference) ? preference : policy.defaultDirection;

  useEffect(() => {
    document.documentElement.dataset.direction = direction;
  }, [direction]);

  useEffect(() => {
    if (!preference) return;
    try {
      window.localStorage.setItem(storageKey(workspaceId), preference);
    } catch {

      // Storage unavailable — the choice still applies for this session.
    }}, [preference, workspaceId]);

  return (
    <DirectionContext.Provider value={{ direction, setDirection: setPreference }}>
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