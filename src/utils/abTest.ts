import type { AbTest, Block, BlockVisibility } from '../types/page';
import type { AnalyticsEvent } from '../types/analytics';
import type { ValidationIssue } from './validation';
import { goalTypes, MIN_VISITS } from './intentflow';
import { blockName } from './blocks';

/**
 * A/B tests (D127): a block and a variant share a test id. Each visit is put in A or B by a
 * stable hash of the visit id, so the same visit always sees the same version, and results can
 * be worked out later from the visit id alone — no extra tracking.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function armFor(session: string, testId: string): 'A' | 'B' {
  return hash(`${session}:${testId}`) % 2 === 0 ? 'A' : 'B';
}

/** Whether a block shows for this visit. Blocks outside a test always show. */
export function showsForArm(v: BlockVisibility, session: string): boolean {
  const t = v.abTest;
  if (!t) return true;
  if (t.paused) return t.arm === 'A';
  return armFor(session, t.id) === t.arm;
}

export interface AbPair {
  test: AbTest;
  a: Block;
  b: Block;
}

export function testPair(blocks: Block[], testId: string): AbPair | null {
  const a = blocks.find((x) => x.visibility.abTest?.id === testId && x.visibility.abTest.arm === 'A');
  const b = blocks.find((x) => x.visibility.abTest?.id === testId && x.visibility.abTest.arm === 'B');
  return a && b ? { test: a.visibility.abTest!, a, b } : null;
}

export interface AbResult {
  a: { visits: number; hits: number };
  b: { visits: number; hits: number };
  enough: boolean;
  /** Set only when there's enough data and one side is clearly ahead (≥20% relative lift). */
  leader: 'A' | 'B' | null;
}

export function abResult(events: AnalyticsEvent[], handle: string, pair: AbPair): AbResult {
  const since = Date.parse(pair.test.startedAt);
  const sessions = new Map<string, boolean>();
  for (const e of events) {
    if (e.handle !== handle || Date.parse(e.at) < since) continue;
    const arm = armFor(e.session, pair.test.id);
    const own = arm === 'A' ? pair.a.id : pair.b.id;
    const hit = pair.test.goal === 'tap' ? e.type === 'tap' && e.blockId === own : goalTypes[pair.test.goal].includes(e.type);
    sessions.set(e.session, (sessions.get(e.session) ?? false) || hit);
  }
  const r = { a: { visits: 0, hits: 0 }, b: { visits: 0, hits: 0 } };
  sessions.forEach((hit, s) => {
    const side = armFor(s, pair.test.id) === 'A' ? r.a : r.b;
    side.visits++;
    if (hit) side.hits++;
  });
  const enough = r.a.visits >= MIN_VISITS && r.b.visits >= MIN_VISITS;
  const ra = r.a.visits ? r.a.hits / r.a.visits : 0;
  const rb = r.b.visits ? r.b.hits / r.b.visits : 0;
  const leader = !enough || Math.max(ra, rb) === 0 ? null : rb > ra * 1.2 ? 'B' : ra > rb * 1.2 ? 'A' : null;
  return { ...r, enough, leader };
}

export function rate(side: { visits: number; hits: number }): string {
  return side.visits ? `${Math.round((side.hits / side.visits) * 1000) / 10}%` : '—';
}

/** Publish checks: a version without its partner, or a test on blocks also targeted by source. */
export function abIssues(blocks: Block[]): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  for (const b of blocks) {
    const t = b.visibility.abTest;
    if (!t) continue;
    if (!testPair(blocks, t.id))
      out.push({ id: `ab:${b.id}:pair`, blockId: b.id, severity: 'warning', message: `${blockName(b)} is version ${t.arm} of an A/B test whose other version was deleted, so only half your visitors see it. End the test in Visibility → A/B test.`, field: 'abTest' });
    else if (b.visibility.sources && !b.visibility.sources.paused)
      out.push({ id: `ab:${b.id}:src`, blockId: b.id, severity: 'warning', message: `${blockName(b)} is in an A/B test and has a visitor-source rule. Results will be hard to read — pause one of them in Visibility → Advanced.`, field: 'abTest' });
  }
  return out;
}
