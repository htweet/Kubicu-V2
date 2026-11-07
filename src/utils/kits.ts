import type { AppliedKit } from '../types/kit';

export const KIT_EVENT = 'kubicu:kit';
const key = (workspaceId: string) => `kubicu.kit.${workspaceId}`;

export function readAppliedKit(workspaceId: string): AppliedKit | null {
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? (JSON.parse(raw) as AppliedKit) : null;
  } catch {
    return null;
  }
}

/** A kit chosen during onboarding whose business parts haven't been added yet (D126). */
const pendingKey = (workspaceId: string) => `kubicu.kit.pending.${workspaceId}`;

export function readPendingKit(workspaceId: string): string | null {
  try {
    return localStorage.getItem(pendingKey(workspaceId));
  } catch {
    return null;
  }
}

export function writePendingKit(workspaceId: string, kitId: string | null) {
  try {
    if (kitId) localStorage.setItem(pendingKey(workspaceId), kitId);
    else localStorage.removeItem(pendingKey(workspaceId));
  } catch {
    // Storage unavailable — the seller can still use the kit from Templates → Business kits.
  }
  window.dispatchEvent(new Event(KIT_EVENT));
}

export function writeAppliedKit(workspaceId: string, kit: AppliedKit | null) {
  if (kit) localStorage.setItem(key(workspaceId), JSON.stringify(kit));
  else localStorage.removeItem(key(workspaceId));
  window.dispatchEvent(new Event(KIT_EVENT));
}
