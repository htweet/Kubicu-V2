import type { UiLang } from '../data/translations';
import { searchGlossaryRows } from '../data/searchGlossary';
import { searchGlossaryRowsKeGhZa } from '../data/searchGlossaryKeGhZa';

/** Which table and column holds each language's words (D344; Kiswahili, Twi and isiZulu D356). */
const source: Record<Exclude<UiLang, 'en'>, { rows: string[][]; col: number }> = {
  pcm: { rows: searchGlossaryRows, col: 1 },
  yo: { rows: searchGlossaryRows, col: 2 },
  ha: { rows: searchGlossaryRows, col: 3 },
  ig: { rows: searchGlossaryRows, col: 4 },
  sw: { rows: searchGlossaryRowsKeGhZa, col: 1 },
  tw: { rows: searchGlossaryRowsKeGhZa, col: 2 },
  zu: { rows: searchGlossaryRowsKeGhZa, col: 3 },
};

/** Lower-case, without tone marks or special letters, so people can type the way their keyboard lets them. */
export function foldSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ɗ/g, 'd')
    .replace(/ƙ/g, 'k')
    .replace(/ɓ/g, 'b')
    // Twi's open vowels (D356).
    .replace(/ɛ/g, 'e')
    .replace(/ɔ/g, 'o')
    .replace(/ŋ/g, 'n')
    .replace(/[’']/g, '');
}

interface Entry {
  english: string[];
  englishRes: RegExp[];
  local: string[];
}

const cache = new Map<UiLang, Entry[]>();

function entries(lang: UiLang): Entry[] {
  if (lang === 'en') return [];
  const hit = cache.get(lang);
  if (hit) return hit;
  const { rows, col } = source[lang];
  const built = rows.map((row) => {
    const english = row[0].split('|');
    return {
      english,
      englishRes: english.map((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')),
      local: row[col].split('|').map(foldSearch),
    };
  });
  cache.set(lang, built);
  return built;
}

/**
 * Local words for whatever English words appear in `englishText` (D344). Appended to a block's search text so a
 * search in the screen language can find it.
 */
export function localSearchWords(englishText: string, lang: UiLang): string {
  return entries(lang)
    .filter((e) => e.englishRes.some((re) => re.test(englishText)))
    .flatMap((e) => e.local)
    .join(' ');
}

/**
 * English words for local words that appear whole in a typed sentence (D518), for Copilot's typed answers.
 * Stricter than search: a word must match exactly, so a sentence doesn't pull in unrelated meanings.
 */
export function englishForSentence(text: string, lang: UiLang): string[] {
  if (lang === 'en') return [];
  const padded = ` ${foldSearch(text).replace(/[^\p{L}\p{N}]+/gu, ' ')} `;
  const out = new Set<string>();
  entries(lang).forEach((e) => {
    if (e.local.some((w) => w.length >= 2 && padded.includes(` ${w} `))) e.english.forEach((w) => out.add(w));
  });
  return [...out];
}

/**
 * The search as typed plus the English words it stands for (D344): "oúnjẹ" in Yorùbá also searches "menu", "food"…
 * Short queries only match the start of a word so a single letter doesn't pull in everything.
 */
export function expandSearch(query: string, lang: UiLang): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const folded = foldSearch(q);
  const terms = new Set([q]);
  entries(lang).forEach((e) => {
    const hit = e.local.some((w) => w.startsWith(folded) || (folded.length >= 4 && (w.includes(folded) || folded.includes(w))));
    if (hit) e.english.forEach((w) => terms.add(w));
  });
  return [...terms];
}
