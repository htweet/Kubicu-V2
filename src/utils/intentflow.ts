import type { Block, BlockVisibility, IntentGoal, PageDocument, SourceRule } from '../types/page';
import type { AnalyticsEvent, SourceId } from '../types/analytics';
import type { Workspace } from '../types/workspace';
import type { ValidationIssue } from './validation';
import { sourceLabels } from './analytics/track';
import { sitePages } from './sitePages';
import { blockName } from './blocks';
import { activeExtraSpaces, MAIN_SPACE_ID, readSpacePage, spaceStorageId } from './spaces';
import { writePersistedPage } from './workspaceStorage';

/** Sources an owner can target. Rules only ever use where a visit came from — never who the person is (D64). */
export const intentSources: SourceId[] = ['whatsapp', 'instagram', 'tiktok', 'facebook', 'x', 'google', 'qr', 'nfc', 'campaign', 'direct', 'other'];

export const goalLabels: Record<IntentGoal, string> = {
  tap: 'Taps on this block',
  order: 'Orders',
  lead: 'Enquiries and sign-ups',
  booking: 'Bookings',
};

/** Visits needed on each side before results say anything. */
export const MIN_VISITS = 30;

export function activeRule(v: BlockVisibility): SourceRule | null {
  const r = v.sources;
  return r && !r.paused && r.ids.length > 0 ? r : null;
}

export function showsForSource(v: BlockVisibility, source: SourceId): boolean {
  const r = activeRule(v);
  if (!r) return true;
  return r.mode === 'only' ? r.ids.includes(source) : !r.ids.includes(source);
}

function listOf(ids: SourceId[]): string {
  const names = ids.map((i) => sourceLabels[i]);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

export function ruleText(r: SourceRule): string {
  if (r.ids.length === 0) return 'Everyone (no sources picked)';
  return r.mode === 'only' ? `Only visits from ${listOf(r.ids)}` : `Everyone except visits from ${listOf(r.ids)}`;
}

/** Page-level safeguards: every page keeps something for everyone, and no rule hides a block from all sources. */
export function intentIssues(doc: PageDocument): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const pages = [{ title: doc.title || 'Home', blocks: doc.blocks }, ...sitePages(doc).map((p) => ({ title: p.title, blocks: p.blocks }))];
  pages.forEach((p) => {
    const visible = p.blocks.filter((b) => !b.visibility.hidden);
    p.blocks.forEach((b) => {
      const r = b.visibility.sources;
      if (!r || r.paused) return;
      if (r.ids.length === 0) out.push({ id: `intent:empty:${b.id}`, blockId: b.id, severity: 'warning', message: 'Pick at least one source, or remove the rule — right now everyone sees this block.' });
      else if (r.mode === 'except' && r.ids.length >= intentSources.length)
        out.push({ id: `intent:none:${b.id}`, blockId: b.id, severity: 'error', message: 'This rule hides the block from every visitor. Remove a source or turn the block off instead.' });
    });
    if (visible.length > 0 && visible.every((b) => activeRule(b.visibility)))
      out.push({ id: `intent:fallback:${p.title}`, blockId: visible[0].id, severity: 'error', message: `Every block on ${p.title} has a source rule. Keep at least one block every visitor sees.` });
  });
  return out;
}

/* ---------- Results ---------- */

export interface IntentResult {
  audienceVisits: number;
  audienceHits: number;
  restVisits: number;
  restHits: number;
  enough: boolean;
}

export const goalTypes: Record<Exclude<IntentGoal, 'tap'>, AnalyticsEvent['type'][]> = {
  order: ['order_paid'],
  lead: ['lead', 'signup'],
  booking: ['booking_confirmed'],
};

/**
 * Compares visits the rule targets with everyone else since the rule was created. For "taps",
 * the other side is taps on anything — they may not see this block at all. Not proof of cause.
 */
export function intentResult(events: AnalyticsEvent[], handle: string, blockId: string, rule: SourceRule): IntentResult {
  const since = Date.parse(rule.createdAt);
  const evs = events.filter((e) => e.handle === handle && Date.parse(e.at) >= since);
  const sessions = new Map<string, { source: SourceId; hit: boolean }>();
  evs.forEach((e) => {
    const s = sessions.get(e.session) ?? { source: e.source, hit: false };
    const targeted = rule.mode === 'only' ? rule.ids.includes(s.source) : !rule.ids.includes(s.source);
    const hit = rule.goal === 'tap' ? e.type === 'tap' && (!targeted || e.blockId === blockId) : goalTypes[rule.goal].includes(e.type);
    sessions.set(e.session, { source: s.source, hit: s.hit || hit });
  });
  let audienceVisits = 0;
  let audienceHits = 0;
  let restVisits = 0;
  let restHits = 0;
  sessions.forEach((s) => {
    const targeted = rule.mode === 'only' ? rule.ids.includes(s.source) : !rule.ids.includes(s.source);
    if (targeted) {
      audienceVisits++;
      if (s.hit) audienceHits++;
    } else {
      restVisits++;
      if (s.hit) restHits++;
    }
  });
  return { audienceVisits, audienceHits, restVisits, restHits, enough: audienceVisits >= MIN_VISITS && restVisits >= MIN_VISITS };
}

/* ---------- Rules across the workspace ---------- */

export interface RuleEntry {
  spaceId: string;
  spaceName: string;
  docId: string;
  handle: string;
  pageId: string | null;
  pageTitle: string;
  block: Block;
  rule: SourceRule;
  /** The rule as it is on the live page; null when not published yet. */
  live: SourceRule | null;
}

function findBlock(doc: PageDocument | null, blockId: string): Block | undefined {
  if (!doc) return undefined;
  return [...doc.blocks, ...sitePages(doc).flatMap((p) => p.blocks)].find((b) => b.id === blockId);
}

export function listRules(w: Workspace): RuleEntry[] {
  const spaces = [{ id: MAIN_SPACE_ID, name: 'Main page' }, ...activeExtraSpaces(w).map((s) => ({ id: s.id, name: s.name }))];
  const out: RuleEntry[] = [];
  spaces.forEach((s) => {
    const p = readSpacePage(w.id, s.id);
    if (!p) return;
    const pages: { id: string | null; title: string; blocks: Block[] }[] = [{ id: null, title: p.draft.title || 'Home', blocks: p.draft.blocks }, ...sitePages(p.draft).map((pg) => ({ id: pg.id, title: pg.title, blocks: pg.blocks }))];
    pages.forEach((pg) =>
      pg.blocks.forEach((b) => {
        if (!b.visibility.sources) return;
        out.push({ spaceId: s.id, spaceName: s.name, docId: p.draft.id, handle: p.draft.handle, pageId: pg.id, pageTitle: pg.title, block: b, rule: b.visibility.sources, live: findBlock(p.published ?? null, b.id)?.visibility.sources ?? null });
      }),
    );
  });
  return out;
}

function mapDoc(doc: PageDocument, blockId: string, fn: (r: SourceRule | undefined) => SourceRule | undefined): PageDocument {
  const f = (b: Block): Block => (b.id === blockId ? ({ ...b, visibility: { ...b.visibility, sources: fn(b.visibility.sources) } } as Block) : b);
  const pages = (doc as PageDocument & { pages?: { blocks: Block[] }[] }).pages;
  return { ...doc, blocks: doc.blocks.map(f), ...(pages ? { pages: pages.map((pg) => ({ ...pg, blocks: pg.blocks.map(f) })) } : {}) } as PageDocument;
}

/**
 * Pause, resume or remove a rule on the draft and the live page at once. A safety switch:
 * it takes effect immediately without a publish (D64).
 */
export function changeRuleEverywhere(workspaceId: string, spaceId: string, blockId: string, fn: (r: SourceRule | undefined) => SourceRule | undefined): boolean {
  const p = readSpacePage(workspaceId, spaceId);
  if (!p) return false;
  writePersistedPage(spaceStorageId(workspaceId, spaceId), { ...p, draft: mapDoc(p.draft, blockId, fn), published: p.published ? mapDoc(p.published, blockId, fn) : p.published });
  return true;
}

export function entryName(e: RuleEntry): string {
  return blockName(e.block);
}
