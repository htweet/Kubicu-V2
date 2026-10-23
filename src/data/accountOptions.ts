import type { DateFormatId, LanguageId, StartPageId } from '../types/account';

export const languageOptions: {value: LanguageId;label: string;ready: boolean;}[] = [
{ value: 'en-NG', label: 'English (Nigeria)', ready: true },
{ value: 'en-GB', label: 'English (UK)', ready: true },
{ value: 'pcm', label: 'Naijá (Nigerian Pidgin)', ready: false },
{ value: 'yo', label: 'Yorùbá', ready: false },
{ value: 'ha', label: 'Hausa', ready: false },
{ value: 'ig', label: 'Igbo', ready: false },
{ value: 'fr', label: 'Français', ready: false }];


export const dateFormatOptions: {value: DateFormatId;label: string;}[] = [
{ value: 'dmy', label: 'Day first — 22/10/2026' },
{ value: 'mdy', label: 'Month first — 10/22/2026' },
{ value: 'iso', label: 'Year first — 2026-10-22' }];


export const startPageOptions: {value: StartPageId;label: string;to: string;}[] = [
{ value: 'overview', label: 'Overview', to: '/app' },
{ value: 'spaces', label: 'My Spaces', to: '/app/spaces' },
{ value: 'commerce', label: 'Commerce', to: '/app/commerce' },
{ value: 'canvas', label: 'The canvas', to: '/app/canvas' }];


export const accountTabs = [
{ id: 'profile', label: 'Profile', to: '/app/account', end: true },
{ id: 'security', label: 'Sign-in & security', to: '/app/account/security' },
{ id: 'preferences', label: 'Preferences', to: '/app/account/preferences' },
{ id: 'workspaces', label: 'Workspaces', to: '/app/account/workspaces' },
{ id: 'privacy', label: 'Data & privacy', to: '/app/account/privacy' }] as
const;

/** Days between asking to delete an account and it happening (example figure). */
export const DELETION_GRACE_DAYS = 14;