import { providerById, type ProviderCategory, type ProviderDef } from '../../data/providers';
import type { ProvidersData } from '../../hooks/useProviders';
import { uid } from '../id';

/*
 * Plain (non-hook) access to a workspace's provider connections, for code that runs outside the
 * app shell — e.g. a visitor sending a form on the live page (D195). Same storage as useProviders.
 */

const key = (workspaceId: string) => `kubicu.providers.${workspaceId}`;

export function readProviders(workspaceId: string): ProvidersData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) return { connections: {}, defaults: {}, log: [], ...(JSON.parse(raw) as Partial<ProvidersData>) };
  } catch {

    /* nothing saved */}
  return { connections: {}, defaults: {}, log: [] };
}

/** The provider a category uses: the chosen default if connected, else the first connected. */
export function activeProvider(data: ProvidersData, category: ProviderCategory): ProviderDef | undefined {
  const chosen = data.defaults[category];
  if (chosen && data.connections[chosen]) return providerById(chosen);
  return Object.keys(data.connections).
  map(providerById).
  find((p) => p?.category === category);
}

/** Adds an entry to Settings → Integrations → Activity and tells open screens to refresh. */
export function appendProviderLog(workspaceId: string, providerId: string, action: string, ok: boolean, detail: string): void {
  const data = readProviders(workspaceId);
  const next: ProvidersData = { ...data, log: [{ id: uid('plog'), at: new Date().toISOString(), providerId, action, ok, detail }, ...data.log].slice(0, 40) };
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(next));
    window.dispatchEvent(new Event(`kubicu:store:${key(workspaceId)}`));
  } catch {

    /* storage full — the send still counts for this visit */}
}

/** "a•••@gmail.com" — enough to recognise, not enough to copy. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '•••';
  return `${user.slice(0, 1)}•••@${domain}`;
}