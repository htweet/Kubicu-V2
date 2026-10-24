import type { AccountData } from '../../types/account';

type Reason = NonNullable<AccountData['security']['lastSignOut']>['reason'];

/**
 * After a password or two-step change, sign out every other device and remember which ones,
 * so Sign-in & security can confirm it plainly (D125).
 */
export function signOutOthers(a: AccountData, reason: Reason): AccountData {
  const others = a.sessions.filter((s) => !s.current);
  if (!others.length) return a;
  return {
    ...a,
    sessions: a.sessions.filter((s) => s.current),
    security: { ...a.security, lastSignOut: { at: new Date().toISOString(), reason, devices: others.map((s) => `${s.device} · ${s.browser}`) } }
  };
}

export const signOutReasonCopy: Record<Reason, string> = {
  password: 'you changed your password',
  two_step_on: 'you turned on two-step sign-in',
  two_step_off: 'you turned off two-step sign-in'
};