import type { UiLang } from '../../data/translations';
import { copilotEditRows, copilotIntentRows, copilotRenameRows, copilotWordRows, type UnderstandRow } from '../../data/copilotUnderstanding';
import { englishForSentence, foldSearch } from '../searchGlossary';

/**
 * Reading typed Copilot answers in the screen language (D518). The engine still matches English; this turns
 * what was typed into English hints the engine can read, and says whether the reply meant skip, "you decide"
 * or "what do you mean?". The person's own words (names, lists, numbers, places) are always kept as typed.
 */
export interface Understood {
  /** English words for the meanings found, one line, to add after the typed text when matching. */
  hints: string;
  skip: boolean;
  decide: boolean;
  confused: boolean;
  /** "Call it X" in their language, rewritten as English so the rename rule catches it. */
  rename: string | null;
}

const column: Record<Exclude<UiLang, 'en'>, number> = { pcm: 1, yo: 2, ha: 3, ig: 4, sw: 5, tw: 6, zu: 7 };

const none: Understood = { hints: '', skip: false, decide: false, confused: false, rename: null };

const phrasesOf = (row: UnderstandRow, lang: Exclude<UiLang, 'en'>) =>
row[column[lang]].
split('|').
map((p) => foldSearch(p).replace(/[^\p{L}\p{N}]+/gu, ' ').trim()).
filter(Boolean);

/** Whole-phrase match on a folded, space-padded sentence. */
const hasPhrase = (padded: string, phrases: string[]) => phrases.some((p) => padded.includes(` ${p} `));

export function understand(text: string, lang: UiLang): Understood {
  if (lang === 'en' || !text.trim()) return none;
  const folded = foldSearch(text).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const padded = ` ${folded} `;

  // Skip only counts when the reply starts with it ("rara", "hapana, baadaye") — not when it's mid-sentence.
  const skip = phrasesOf(copilotIntentRows.skip, lang).some((p) => folded === p || folded.startsWith(`${p} `));
  const decide = hasPhrase(padded, phrasesOf(copilotIntentRows.decide, lang));
  // Confusion only when the reply is short — a long answer that happens to contain "explain" is still an answer.
  const confused = folded.split(' ').length <= 6 && hasPhrase(padded, phrasesOf(copilotIntentRows.confused, lang));

  const words = new Set<string>();
  [...copilotWordRows, ...copilotEditRows].forEach((row) => {
    if (hasPhrase(padded, phrasesOf(row, lang))) words.add(row[0]);
  });
  englishForSentence(text, lang).forEach((w) => words.add(w));

  let rename: string | null = null;
  for (const p of phrasesOf(copilotRenameRows, lang)) {
    const at = padded.indexOf(` ${p} `);
    if (at < 0) continue;
    // Keep the name as typed: take the same number of words from the original text.
    const before = folded.slice(0, Math.max(0, at)).split(' ').filter(Boolean).length + p.split(' ').length;
    const original = text.trim().split(/\s+/).slice(before).join(' ').replace(/^["“]|["”.!?]+$/g, '').trim();
    if (original.length >= 2) rename = `call it ${original.slice(0, 60)}`;
    break;
  }

  return { hints: [...words].join(' '), skip, decide, confused, rename };
}