import type { MarketplaceData, SharedLibraryItem } from '../types/marketplace';

export const marketplaceKey = (workspaceId: string) => `kubicu.marketplace.${workspaceId}`;
const sharedKey = (code: string) => `kubicu.shared.${code.toUpperCase()}`;

export const emptyMarketplace = (): MarketplaceData => ({ installed: {}, templateLicences: [] });

export function readMarketplace(workspaceId: string): MarketplaceData {
  try {
    const raw = window.localStorage.getItem(marketplaceKey(workspaceId));
    return raw ? { ...emptyMarketplace(), ...(JSON.parse(raw) as Partial<MarketplaceData>) } : emptyMarketplace();
  } catch {
    return emptyMarketplace();
  }
}

export function writeMarketplace(workspaceId: string, data: MarketplaceData): void {
  window.localStorage.setItem(marketplaceKey(workspaceId), JSON.stringify(data));
}

/** True when an installed, unpaused extension is on — readable from public pages too. */
export function extensionActive(data: MarketplaceData, id: string): boolean {
  const x = data.installed[id];
  return !!x && !x.paused;
}

function newCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KUB-${s}`;
}

/** Private share code (works between workspaces on this device in the prototype). */
export function shareLibraryItem(item: Omit<SharedLibraryItem, 'code' | 'createdAt'>): string {
  const code = newCode();
  window.localStorage.setItem(sharedKey(code), JSON.stringify({ ...item, code, createdAt: new Date().toISOString() } satisfies SharedLibraryItem));
  return code;
}

export function readShared(code: string): SharedLibraryItem | null {
  try {
    const raw = window.localStorage.getItem(sharedKey(code.trim()));
    return raw ? (JSON.parse(raw) as SharedLibraryItem) : null;
  } catch {
    return null;
  }
}
