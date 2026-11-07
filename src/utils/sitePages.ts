import type { Block, PageDocument, SitePage } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import { validateDocument, type ValidationIssue } from './validation';

/** Pages per space, including home. Example figures (D48) until pricing is set. */
export const pageLimits: Record<WorkspacePlan, number> = { free: 1, creator: 5, pro: 20, business: 50, agency: 50, enterprise: 100 };

/** Single-segment paths already used for order, download and booking pages. */
export const RESERVED_PATHS = new Set(['order', 'download', 'booking', 'checkout', 'cart', 'admin', 'api', 'app', 'trust']);

export interface NavItem {
  id: string | null;
  label: string;
  path: string;
}

export function sitePages(doc: PageDocument): SitePage[] {
  return doc.pages ?? [];
}

export function homeLabel(doc: PageDocument): string {
  return doc.homeLabel?.trim() || 'Home';
}

export function pageCount(doc: PageDocument): number {
  return 1 + sitePages(doc).length;
}

export function findPage(doc: PageDocument, id: string | null | undefined): SitePage | undefined {
  return id ? sitePages(doc).find((p) => p.id === id) : undefined;
}

export function pageTitle(doc: PageDocument, id: string | null): string {
  return findPage(doc, id)?.title || (id ? 'Untitled page' : homeLabel(doc));
}

/** A document whose blocks/groups/SEO are those of one page. Theme, handle and branding stay shared. */
export function pageView(doc: PageDocument, id: string | null | undefined): PageDocument {
  const p = findPage(doc, id);
  if (!p) return doc;
  return { ...doc, blocks: p.blocks, groups: p.groups, seo: p.seo };
}

/** Writes an edited page view back into the site. */
export function writeView(doc: PageDocument, id: string | null | undefined, view: PageDocument): PageDocument {
  const p = findPage(doc, id);
  const shared = { pages: doc.pages, homeLabel: doc.homeLabel, redirects: doc.redirects };
  if (!p) return { ...view, ...shared };
  return {
    ...view,
    blocks: doc.blocks,
    groups: doc.groups,
    seo: doc.seo,
    ...shared,
    pages: sitePages(doc).map((x) => (x.id === p.id ? { ...x, blocks: view.blocks, groups: view.groups, seo: view.seo } : x)),
  };
}

export function allBlocks(doc: PageDocument): Block[] {
  return [...doc.blocks, ...sitePages(doc).flatMap((p) => p.blocks)];
}

/** Which page a block is on (null = home, undefined = nowhere). */
export function pageOfBlock(doc: PageDocument, blockId: string): string | null | undefined {
  if (doc.blocks.some((b) => b.id === blockId)) return null;
  return sitePages(doc).find((p) => p.blocks.some((b) => b.id === blockId))?.id;
}

export function slugifyPath(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function uniquePath(doc: PageDocument, base: string, exceptId?: string): string {
  const root = slugifyPath(base) || 'page';
  const used = new Set(sitePages(doc).filter((p) => p.id !== exceptId).map((p) => p.path));
  let path = RESERVED_PATHS.has(root) ? `${root}-page` : root;
  let n = 2;
  while (used.has(path)) path = `${root}-${n++}`;
  return path;
}

/** Problem with a page address, or null when it's fine. */
export function pathProblem(doc: PageDocument, id: string, path: string): string | null {
  if (!path) return 'Add an address for this page';
  if (!/^[a-z0-9-]{1,40}$/.test(path)) return 'Use lowercase letters, numbers and hyphens';
  if (RESERVED_PATHS.has(path)) return `“${path}” is used by KUBICU. Choose another.`;
  if (sitePages(doc).some((p) => p.id !== id && p.path === path)) return 'Another page already uses this address';
  return null;
}

export function navItems(doc: PageDocument): NavItem[] {
  return [{ id: null, label: homeLabel(doc), path: '' }, ...sitePages(doc).filter((p) => !p.hideFromNav).map((p) => ({ id: p.id, label: p.title || 'Untitled', path: p.path }))];
}

export function showsNav(doc: PageDocument): boolean {
  return navItems(doc).length > 1;
}

export type PathResolution = { pageId: string | null } | { redirect: string } | null;

/** Resolves an address inside a site: a page, a redirect to follow, or nothing. */
export function resolvePath(doc: PageDocument, path: string | undefined): PathResolution {
  if (!path) return { pageId: null };
  const direct = sitePages(doc).find((p) => p.path === path);
  if (direct) return { pageId: direct.id };
  let target = path;
  for (let hop = 0; hop < 6; hop++) {
    const r = (doc.redirects ?? []).find((x) => x.from === target);
    if (!r) break;
    target = r.to;
    if (target === '' || sitePages(doc).some((p) => p.path === target)) return { redirect: target };
  }
  return null;
}

/** Address of a page relative to the public root: '' for home, '/shop' otherwise. */
export function pageHref(handle: string, path: string): string {
  return `/p/${handle}${path ? `/${path}` : ''}`;
}

/** Every pre-publish issue across the site, tagged with the page it's on. */
export function siteIssues(
  doc: PageDocument,
  takenHandles: ReadonlySet<string> | undefined,
  extra: ((view: PageDocument) => ValidationIssue[]) | undefined,
  siteLevel: ValidationIssue[] = [],
): ValidationIssue[] {
  const home = [...validateDocument(doc, takenHandles), ...(extra ? extra(doc) : [])].map((i) => ({ ...i, pageId: null }));
  const seen = new Set(home.filter((i) => !i.blockId).map((i) => i.message));
  const pages = sitePages(doc).flatMap((p) => {
    const view = pageView(doc, p.id);
    const name = p.title || 'Untitled';
    const out: ValidationIssue[] = [];
    if (!p.blocks.some((b) => !b.visibility.hidden)) out.push({ id: `${p.id}:empty`, blockId: null, severity: 'error', message: `The “${name}” page has no visible blocks yet`, pageId: p.id });
    const problem = pathProblem(doc, p.id, p.path);
    if (problem) out.push({ id: `${p.id}:path`, blockId: null, severity: 'error', message: `“${name}” page address: ${problem.toLowerCase()}`, pageId: p.id });
    const own = [...validateDocument(view), ...(extra ? extra(view) : [])].filter((i) => {
      if (i.blockId) return true;
      // Page-wide notes (plan, catalogue) once only; handle/theme checks belong to home.
      if (i.id.startsWith('page:') || i.id.startsWith('theme:') || i.field && !i.blockId && i.fix) return false;
      if (seen.has(i.message)) return false;
      seen.add(i.message);
      return true;
    });
    return [...out, ...own.map((i) => ({ ...i, id: `${p.id}:${i.id}`, pageId: p.id, message: i.blockId ? `${name} · ${i.message}` : i.message }))];
  });
  return [...home, ...pages, ...siteLevel];
}
