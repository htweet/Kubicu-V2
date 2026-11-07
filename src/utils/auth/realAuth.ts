/**
 * STUB (D529). Engineering's real `utils/auth/realAuth.ts` replaces this file on merge.
 *
 * In this design project, account mode is switched on from the Controls panel (`authMode` on App),
 * which `AccountModeProvider` copies here. Every account-mode state checks
 * `realAuthEnabled() && isAccountWorkspace(ws)`; in browser mode nothing changes.
 */
let enabled = false;

/** Called only by AccountModeProvider. Not part of the real module's API. */
export function setRealAuthStub(on: boolean): void {
  enabled = on;
}

/** True when the app is built with real sign-in. */
export function realAuthEnabled(): boolean {
  return enabled;
}

/**
 * True when the workspace lives on Kubicu's server. The stub treats every workspace as an account
 * workspace while account mode is on; the real module reads it from the workspace record.
 */
export function isAccountWorkspace(_workspace?: { id: string } | null): boolean {
  return enabled;
}
