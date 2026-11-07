/**
 * Workspaces created while signed in go straight to the account (owner decision, 7 Nov 2026; AI-Engine
 * post-m2-review/17). Creating a workspace records it here; AutoLink (inside the signed-in area) links it with the same
 * upload as "Bring it to my account", without asking. Workspaces that were already in this browser keep the optional
 * offer. Without real sign-in nothing here runs.
 */
const KEY = 'kubicu.autoLink.v1';
const PROMPTED_KEY = 'kubicu.importPrompted';

let signedIn = false;
/** Set by the sign-in context: whether someone is signed in right now. */
export function setSignedInNow(value: boolean): void {
  signedIn = value;
}
export function isSignedInNow(): boolean {
  return signedIn;
}

function read(key: string): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function write(key: string, list: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage unavailable: the optional offer appears instead, which is harmless.
  }
}

/** A workspace was just created while signed in: link it automatically, and never offer the optional link for it. */
export function markForAutoLink(workspaceId: string): void {
  write(KEY, [...new Set([...read(KEY), workspaceId])]);
  write(PROMPTED_KEY, [...new Set([...read(PROMPTED_KEY), workspaceId])]);
}
export const pendingAutoLinks = (): string[] => read(KEY);
export function doneAutoLink(workspaceId: string): void {
  write(KEY, read(KEY).filter((id) => id !== workspaceId));
}
