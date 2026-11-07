import type { DomainsData } from '../../types/domains';

export const domainsKey = (workspaceId: string) => `kubicu.domains.${workspaceId}`;

export function emptyDomains(): DomainsData {
  return { version: 1, domains: [], links: [], qrs: [], redirects: [] };
}

export function readDomains(workspaceId: string): DomainsData | null {
  try {
    const raw = window.localStorage.getItem(domainsKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DomainsData;
    return parsed?.version === 1 ? { ...emptyDomains(), ...parsed } : null;
  } catch {
    return null;
  }
}

export function writeDomains(workspaceId: string, data: DomainsData): void {
  window.localStorage.setItem(domainsKey(workspaceId), JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('kubicu:domains', { detail: workspaceId }));
}
