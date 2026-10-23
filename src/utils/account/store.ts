import { useSyncExternalStore } from 'react';
import type { AccountData, DateFormatId } from '../../types/account';
import { uid } from '../id';

/** Device-wide: the account isn't tied to a workspace (D80). */
export const ACCOUNT_KEY = 'kubicu.account';
const EVENT = 'kubicu:account';

const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

export function emptyAccount(): AccountData {
  return {
    profile: { name: 'Adaeze Okafor', displayName: 'Adaeze', email: 'adaeze@example.com', phone: '', photo: null, jobTitle: 'Founder', bio: '' },
    emailVerified: true,
    pendingEmail: null,
    phoneVerified: false,
    prefs: { language: 'en-NG', timeZone: 'Africa/Lagos', dateFormat: 'dmy', startPage: 'overview', textSize: 'default', motion: 'device' },
    security: { passwordSetAt: ago(60 * 24 * 94), twoStep: 'none', twoStepSince: null, backupCodes: [], signInAlerts: true },
    sessions: [
    { id: 'ses_this', device: 'This device', browser: browserName(), place: 'Lagos, Nigeria', lastActiveAt: new Date().toISOString(), current: true },
    { id: 'ses_phone', device: 'Tecno Camon 20 (Android)', browser: 'Chrome', place: 'Lagos, Nigeria', lastActiveAt: ago(95), current: false },
    { id: 'ses_laptop', device: 'Windows laptop', browser: 'Edge', place: 'Abuja, Nigeria', lastActiveAt: ago(60 * 24 * 6), current: false }],

    signIns: [
    { id: 'si_1', at: ago(12), device: `${browserName()} · This device`, place: 'Lagos, Nigeria', outcome: 'ok' },
    { id: 'si_2', at: ago(95), device: 'Chrome · Android', place: 'Lagos, Nigeria', outcome: 'ok' },
    { id: 'si_3', at: ago(60 * 26), device: 'Unknown · Linux', place: 'Kano, Nigeria', outcome: 'wrong_password' },
    { id: 'si_4', at: ago(60 * 24 * 6), device: 'Edge · Windows', place: 'Abuja, Nigeria', outcome: 'ok' }],

    connected: [{ provider: 'google', email: 'adaeze@example.com', connectedAt: ago(60 * 24 * 120) }],
    comms: { productNews: true, tips: true, research: false },
    exports: [],
    deletion: null,
    createdAt: ago(60 * 24 * 120)
  };
}

function browserName(): string {
  if (typeof navigator === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Browser';
}

let cache: AccountData | null = null;

export function readAccount(): AccountData {
  if (cache) return cache;
  const base = emptyAccount();
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<AccountData>;
      cache = { ...base, ...p, profile: { ...base.profile, ...p.profile }, prefs: { ...base.prefs, ...p.prefs }, security: { ...base.security, ...p.security }, comms: { ...base.comms, ...p.comms } };
      return cache;
    }
  } catch {

    // Fall through to defaults.
  }cache = base;
  return cache;
}

/** Returns false when browser storage is full. */
export function updateAccount(fn: (a: AccountData) => AccountData): boolean {
  const next = fn(readAccount());
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  cache = next;
  window.dispatchEvent(new Event(EVENT));
  return true;
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== ACCOUNT_KEY) return;
    cache = null;
    cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useAccount(): AccountData {
  return useSyncExternalStore(subscribe, readAccount, readAccount);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Formats a date in the person's chosen time zone and date order. */
export function formatAccountDate(iso: string, prefs: {timeZone: string;dateFormat: DateFormatId;}, withTime = true): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: prefs.timeZone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const date = prefs.dateFormat === 'iso' ? `${get('year')}-${get('month')}-${get('day')}` : prefs.dateFormat === 'mdy' ? `${get('month')}/${get('day')}/${get('year')}` : `${get('day')}/${get('month')}/${get('year')}`;
  return withTime ? `${date}, ${get('hour')}:${get('minute')}` : date;
}

export function newBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    const s = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, '7');
    return `${s.slice(0, 4)}-${s.slice(4, 8)}`;
  });
}

export function fakeSecret(): string {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  return Array.from({ length: 16 }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
}

export function newExport() {
  const now = Date.now();
  return { id: uid('exp'), requestedAt: new Date(now).toISOString(), readyAt: new Date(now + 8000).toISOString() };
}

/** 0–4, with a plain reason. */
export function passwordStrength(pw: string): {score: number;label: string;} {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  if (/^(password|12345678|qwerty)/i.test(pw)) score = 0;
  return { score, label: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}