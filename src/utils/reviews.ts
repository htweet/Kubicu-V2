import type { Block, PageDocument } from '../types/page';
import type { PageVersion } from '../types/page';
import { docSignature } from './blocks';
import { allBlocks, pageTitle, sitePages } from './sitePages';
import { blockName } from './blocks';
import { readPersistedPage, writePersistedPage } from './workspaceStorage';
import { uid } from './id';

export interface BlockChange {
  id: string;
  kind: 'added' | 'removed' | 'changed';
  label: string;
  page: string;
}

/** What differs between the live site and the proposed one, block by block (D58). */
export function changedBlocks(live: PageDocument | null, proposed: PageDocument): BlockChange[] {
  const pageOf = (doc: PageDocument, b: Block) => {
    if (doc.blocks.some((x) => x.id === b.id)) return pageTitle(doc, null);
    const p = sitePages(doc).find((x) => x.blocks.some((y) => y.id === b.id));
    return p ? p.title : 'Home';
  };
  const before = new Map((live ? allBlocks(live) : []).map((b) => [b.id, b]));
  const after = new Map(allBlocks(proposed).map((b) => [b.id, b]));
  const out: BlockChange[] = [];
  after.forEach((b, id) => {
    const old = before.get(id);
    if (!old) out.push({ id, kind: 'added', label: blockName(b), page: pageOf(proposed, b) });
    else if (JSON.stringify({ c: old.content, v: old.visibility, s: old.style }) !== JSON.stringify({ c: b.content, v: b.visibility, s: b.style })) out.push({ id, kind: 'changed', label: blockName(b), page: pageOf(proposed, b) });
  });
  before.forEach((b, id) => {
    if (!after.has(id) && live) out.push({ id, kind: 'removed', label: blockName(b), page: pageOf(live, b) });
  });
  return out;
}

export function settingsChanged(live: PageDocument | null, proposed: PageDocument): string[] {
  if (!live) return ['First publish'];
  const out: string[] = [];
  if (JSON.stringify(live.theme) !== JSON.stringify(proposed.theme)) out.push('Theme');
  if (live.handle !== proposed.handle) out.push(`Link changed to /${proposed.handle}`);
  if (live.title !== proposed.title) out.push('Name');
  if (JSON.stringify(live.seo) !== JSON.stringify(proposed.seo)) out.push('Search & sharing');
  if (sitePages(live).length !== sitePages(proposed).length) out.push('Pages added or removed');
  if (JSON.stringify(live.campaign) !== JSON.stringify(proposed.campaign)) out.push('Campaign settings');
  if (JSON.stringify(live.dealRoom) !== JSON.stringify(proposed.dealRoom)) out.push('DealRoom settings');
  return out;
}

export function sameDoc(a: PageDocument | null, b: PageDocument | null): boolean {
  if (!a || !b) return a === b;
  return docSignature(a) === docSignature(b);
}

/**
 * Publishes a reviewed site for a space that isn't open in the editor (campaigns and DealRooms
 * while you're on workspace screens). The main space is published through the editor instead.
 */
export function publishStored(storageId: string, doc: PageDocument, note: string, scheduleAt: string | null): boolean {
  const page = readPersistedPage(storageId);
  if (!page) return false;
  const at = new Date().toISOString();
  try {
    if (scheduleAt && Date.parse(scheduleAt) > Date.now()) {
      writePersistedPage(storageId, { ...page, scheduled: { id: uid('sch'), at: scheduleAt, note, doc, createdAt: at } });
    } else {
      const count = page.versions.filter((v) => v.kind === 'published').length + 1;
      const version: PageVersion = { id: uid('ver'), label: `Version ${count}`, note, createdAt: at, kind: 'published', doc };
      writePersistedPage(storageId, { ...page, published: doc, publishedAt: at, versions: [version, ...page.versions].slice(0, 30), scheduled: null });
    }
    return true;
  } catch {
    return false;
  }
}
