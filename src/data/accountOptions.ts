import type { DateFormatId, LanguageId, StartPageId } from '../types/account';
import { figure, onOpsSettings } from '../utils/opsSettings';

/** `draft`: selectable, with drafted translations that still need a native speaker's check (D133). */
export const languageOptions: { value: LanguageId; label: string; ready: boolean; draft?: boolean }[] = [
  { value: 'en-NG', label: 'English (Nigeria)', ready: true },
  { value: 'pcm', label: 'Naijá (Nigerian Pidgin)', ready: false, draft: true },
  { value: 'yo', label: 'Yorùbá', ready: false, draft: true },
  { value: 'ha', label: 'Hausa', ready: false, draft: true },
  { value: 'ig', label: 'Igbo', ready: false, draft: true },
  { value: 'sw', label: 'Kiswahili', ready: false, draft: true },
  { value: 'tw', label: 'Twi', ready: false, draft: true },
  { value: 'zu', label: 'isiZulu', ready: false, draft: true },
  // Listed last so the picker's country groups stay together (D356).
  { value: 'en-GB', label: 'English (UK)', ready: true },
  { value: 'fr', label: 'Français', ready: false },
];

export const dateFormatOptions: { value: DateFormatId; label: string }[] = [
  { value: 'dmy', label: 'Day first — 22/10/2026' },
  { value: 'mdy', label: 'Month first — 10/22/2026' },
  { value: 'iso', label: 'Year first — 2026-10-22' },
];

export const startPageOptions: { value: StartPageId; label: string; to: string }[] = [
  { value: 'overview', label: 'Overview', to: '/app' },
  { value: 'spaces', label: 'My Spaces', to: '/app/spaces' },
  { value: 'commerce', label: 'Commerce', to: '/app/commerce' },
  { value: 'canvas', label: 'The canvas', to: '/app/canvas' },
];

export const accountTabs = [
  { id: 'profile', label: 'Profile', to: '/app/account', end: true },
  { id: 'security', label: 'Sign-in & security', to: '/app/account/security' },
  { id: 'preferences', label: 'Preferences', to: '/app/account/preferences' },
  { id: 'workspaces', label: 'Workspaces', to: '/app/account/workspaces' },
  { id: 'privacy', label: 'Data & privacy', to: '/app/account/privacy' },
] as const;

/** Days between asking to delete an account and it happening (example figure). */
export let DELETION_GRACE_DAYS = 14;
onOpsSettings(() => {
  DELETION_GRACE_DAYS = figure('account.deletionGraceDays');
});
