import type { PageDocument } from '../../types/page';
import type { Workspace } from '../../types/workspace';
import type { CampaignLink, DomainsData, LinkDestination } from '../../types/domains';
import type { CommerceData } from '../../types/commerce';
import { samplePage } from '../../data/samplePage';
import { DEMO_WORKSPACE_ID } from '../workspaceStorage';
import { MAIN_SPACE_ID, activeExtraSpaces, readSpacePage } from '../spaces';
import { pageHref, sitePages } from '../sitePages';
import { STOREFRONT_PATH, storefrontAvailable } from '../commerce/storefront';

/** The page saved for a space: published first, then the draft. The demo main page counts before its first save. */
export function spaceDoc(workspaceId: string, spaceId: string): PageDocument | null {
  const p = readSpacePage(workspaceId, spaceId);
  if (p) return p.published ?? p.draft;
  return workspaceId === DEMO_WORKSPACE_ID && spaceId === MAIN_SPACE_ID ? samplePage : null;
}

export function spaceHandle(workspaceId: string, spaceId: string): string | null {
  const p = readSpacePage(workspaceId, spaceId);
  if (p) return p.published?.handle ?? p.draft.handle;
  return workspaceId === DEMO_WORKSPACE_ID && spaceId === MAIN_SPACE_ID ? samplePage.handle : null;
}

/** Short links live under the workspace's main link. */
export function shortPath(slug: string): string {
  return `s/${slug}`;
}

export function shortDisplay(mainHandle: string, slug: string, host?: string | null): string {
  return host ? `${host}/s/${slug}` : `kub.icu/${mainHandle}/s/${slug}`;
}

/** What the QR code encodes — the real public address. */
export function shortUrl(mainHandle: string, slug: string, host?: string | null): string {
  return `https://${shortDisplay(mainHandle, slug, host)}`;
}

/** Opens the short link inside the prototype (simulates a scan or tap). */
export function shortHref(mainHandle: string, slug: string): string {
  return `/p/${mainHandle}/s/${slug}`;
}

/** Where a short link lands, with the tags Analytics reads (`src`, `c`). */
export function landingHref(workspaceId: string, link: CampaignLink): string | null {
  const handle = spaceHandle(workspaceId, link.destination.spaceId);
  if (!handle) return null;
  const qs = new URLSearchParams();
  if (link.source !== 'campaign') qs.set('src', link.source);
  qs.set('c', link.slug);
  return `${pageHref(handle, link.destination.path)}?${qs.toString()}`;
}

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export function slugify(text: string): string {
  return text.
  toLowerCase().
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 40).
  replace(/-+$/g, '');
}

export function slugError(slug: string, data: DomainsData, exceptId?: string): string | undefined {
  if (!slug) return 'Add a short name for the link.';
  if (!SLUG_PATTERN.test(slug)) return 'Use lowercase letters, numbers and hyphens (up to 40).';
  if (data.links.some((l) => l.slug === slug && l.id !== exceptId)) return 'Another link already uses this. Pick a different one.';
  return undefined;
}

export interface DestinationOption {
  value: string;
  label: string;
  group: string;
}

export const encodeDestination = (d: LinkDestination) => `${d.spaceId}|${d.path}`;
export function decodeDestination(v: string): LinkDestination {
  const i = v.indexOf('|');
  return { spaceId: v.slice(0, i), path: v.slice(i + 1) };
}

/** Every place a link or QR code can point: each space's home and pages, the shop and its products. */
export function destinationOptions(workspace: Workspace, commerce: CommerceData | null): DestinationOption[] {
  const out: DestinationOption[] = [];
  const spaces = [{ id: MAIN_SPACE_ID, name: 'Main page' }, ...activeExtraSpaces(workspace).map((s) => ({ id: s.id, name: s.name }))];
  spaces.forEach((s) => {
    const doc = spaceDoc(workspace.id, s.id);
    if (!doc) return;
    const group = s.id === MAIN_SPACE_ID ? `Main page · ${doc.handle}` : `${s.name} · ${doc.handle}`;
    out.push({ value: encodeDestination({ spaceId: s.id, path: '' }), label: `${doc.title || 'Home'} (home)`, group });
    sitePages(doc).forEach((p) => out.push({ value: encodeDestination({ spaceId: s.id, path: p.path }), label: p.title || p.path, group }));
    if (s.id === MAIN_SPACE_ID && storefrontAvailable(doc, commerce)) {
      out.push({ value: encodeDestination({ spaceId: s.id, path: STOREFRONT_PATH }), label: 'Shop', group });
      commerce?.products.
      filter((p) => p.status === 'active').
      forEach((p) => out.push({ value: encodeDestination({ spaceId: s.id, path: `${STOREFRONT_PATH}/${p.id}` }), label: `Shop · ${p.name}`, group }));
    }
  });
  return out;
}

export function destinationLabel(workspace: Workspace, commerce: CommerceData | null, d: LinkDestination): string {
  const hit = destinationOptions(workspace, commerce).find((o) => o.value === encodeDestination(d));
  if (hit) return hit.group.startsWith('Main page') ? hit.label : `${hit.group.split(' · ')[0]} · ${hit.label}`;
  return 'Missing page';
}

/** True when the destination still exists — archived spaces, removed pages and products count as missing. */
export function destinationExists(workspace: Workspace, commerce: CommerceData | null, d: LinkDestination): boolean {
  return destinationOptions(workspace, commerce).some((o) => o.value === encodeDestination(d));
}

/** Finds a short link by the main handle it lives under, across workspaces on this device. */
export function findShortLink(
workspaces: Workspace[],
handle: string,
slug: string,
read: (workspaceId: string) => DomainsData | null)
: {workspace: Workspace;link: CampaignLink;} | null {
  for (const w of workspaces) {
    if (spaceHandle(w.id, MAIN_SPACE_ID) !== handle) continue;
    const link = read(w.id)?.links.find((l) => l.slug === slug);
    if (link) return { workspace: w, link };
  }
  return null;
}