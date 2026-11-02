/**
 * A handle picked on the marketing site before sign-up (D84).
 * Held on this device for 30 minutes (example) and applied to onboarding's Identity step.
 */
import { figure, onOpsSettings } from './opsSettings';

const KEY = 'kubicu.handleClaim.v1';
export let CLAIM_HOLD_MINUTES = 30;
onOpsSettings(() => {
  CLAIM_HOLD_MINUTES = figure('signup.claimHoldMinutes');
});

export interface HandleClaim {
  handle: string;
  claimedAt: string;
}

export function saveHandleClaim(handle: string): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ handle, claimedAt: new Date().toISOString() } satisfies HandleClaim));
    return true;
  } catch {
    return false;
  }
}

/** The claim if it's still within its hold window; expired claims are cleared. */
export function readHandleClaim(): HandleClaim | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const claim = JSON.parse(raw) as HandleClaim;
    if (!claim.handle || Date.now() - Date.parse(claim.claimedAt) > CLAIM_HOLD_MINUTES * 60_000) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return claim;
  } catch {
    return null;
  }
}

export function clearHandleClaim(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {

    // Nothing to clear.
  }}

/** Minutes left on the hold, rounded up. */
export function claimMinutesLeft(claim: HandleClaim): number {
  return Math.max(1, Math.ceil((CLAIM_HOLD_MINUTES * 60_000 - (Date.now() - Date.parse(claim.claimedAt))) / 60_000));
}