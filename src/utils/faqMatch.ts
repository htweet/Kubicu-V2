import type { FaqItem } from '../types/page';

/*
 * FAQ assistant matching (D342). Rule-based: the visitor's words are compared with the owner's approved
 * questions (and, more lightly, their answers). The result is always one of the owner's own answers, word for
 * word — never a new sentence. A real AI provider could later improve the matching, never the answers.
 */

const STOP = new Set([
'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'am', 'was', 'were', 'be', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should',
'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that', 'there', 'they', 'them', 'he', 'she', 'to', 'of', 'in', 'on', 'at',
'for', 'with', 'from', 'by', 'about', 'as', 'if', 'so', 'what', 'how', 'when', 'where', 'who', 'which', 'why', 'any', 'have', 'has', 'get',
'please', 'pls', 'abeg', 'una', 'wetin', 'dey', 'na', 'no', 'not', 'yes', 'just', 'also', 'much', 'many', 'some']
);

function stem(w: string): string {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}

export function keywords(text: string): Set<string> {
  return new Set(
    text.
    toLowerCase().
    normalize('NFD').
    replace(/[\u0300-\u036f]/g, '').
    split(/[^a-z0-9₦]+/).
    filter((w) => w.length > 1 && !STOP.has(w)).
    map(stem)
  );
}

const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((w) => b.has(w)).length;

export interface FaqMatch {
  best: FaqItem | null;
  related: FaqItem[];
}

/** Approved facts are the ones with both a question and an answer. */
export const approvedFacts = (facts: FaqItem[]) => facts.filter((f) => f.question.trim() && f.answer.trim());

export function matchFaq(query: string, facts: FaqItem[]): FaqMatch {
  const q = keywords(query);
  if (q.size === 0) return { best: null, related: [] };
  const scored = approvedFacts(facts).
  map((f) => ({ f, score: overlap(q, keywords(f.question)) * 2 + overlap(q, keywords(f.answer)) })).
  filter((s) => s.score >= 2).
  sort((a, b) => b.score - a.score);
  return { best: scored[0]?.f ?? null, related: scored.slice(1, 3).map((s) => s.f) };
}