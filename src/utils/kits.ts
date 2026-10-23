import type { AppliedKit } from '../types/kit';

export const KIT_EVENT = 'kubicu:kit';
const key = (workspaceId: string) => `kubicu.kit.${workspaceId}`;

export function readAppliedKit(workspaceId: string): AppliedKit | null {
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? JSON.parse(raw) as AppliedKit : null;
  } catch {
    return null;
  }
}

export function writeAppliedKit(workspaceId: string, kit: AppliedKit | null) {
  if (kit) localStorage.setItem(key(workspaceId), JSON.stringify(kit));else
  localStorage.removeItem(key(workspaceId));
  window.dispatchEvent(new Event(KIT_EVENT));
}