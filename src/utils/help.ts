import type { HelpArticle, HelpCategory, HelpShot } from '../types/help';
import { helpTopics } from '../data/helpTopics';
import { helpForPath } from '../data/helpContext';

export interface FoundArticle {
  article: HelpArticle;
  topic: HelpCategory;
  index: number;
}

/** Finds a guide article and the topic it belongs to. */
export function findHelpArticle(id: string | undefined): FoundArticle | null {
  if (!id) return null;
  for (const topic of helpTopics) {
    const index = topic.articles.findIndex((a) => a.id === id);
    if (index >= 0) return { article: topic.articles[index], topic, index };
  }
  return null;
}

export function helpArticleHref(id: string): string {
  return `/about/help/${id}`;
}

/**
 * The picture for an article: its own, or — for task articles with a known place — a simple one drawn
 * from where it lives and its steps, so every step-by-step guide shows where to go.
 */
export function shotFor(a: HelpArticle): HelpShot | null {
  if (a.shot) return a.shot;
  if (!a.where || !a.steps?.length || a.where.startsWith('kub.icu')) return null;
  const parts = a.where.split('→').map((p) => p.trim());
  const canvas = parts[0] === 'Canvas';
  return {
    frame: canvas ? 'canvas' : 'app',
    nav: canvas ? undefined : parts[0] === 'Growth' ? parts[1] : parts[0],
    path: canvas ? undefined : parts.length > 1 ? a.where : undefined,
    title: parts[parts.length - 1],
    items: a.steps.slice(0, 5).map((s, i) => ({ kind: 'row' as const, label: shorten(s), marker: i + 1 }))
  };
}

function shorten(s: string): string {
  const first = s.split(/[.;]/)[0];
  return first.length > 64 ? `${first.slice(0, 61)}…` : first;
}

/** The guide for the workspace screen at this address — longest matching prefix wins. */
export function helpForPathname(pathname: string) {
  return helpForPath.filter((h) => pathname.startsWith(h.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0] ?? null;
}

export function matchesHelp(a: HelpArticle, topic: HelpCategory, q: string): boolean {
  if (!q) return true;
  return `${a.q} ${a.a} ${a.where ?? ''} ${(a.steps ?? []).join(' ')} ${(a.tips ?? []).join(' ')} ${topic.title}`.toLowerCase().includes(q);
}