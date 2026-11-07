import type { PhraseReview } from '../types/admin';
import type { UiLang } from '../data/translations';

/**
 * Wording corrected by a native reviewer in Super admin → Localisation (D135).
 * Read straight from the staff store and cached, so every translate call stays cheap.
 */
let cache: Record<string, PhraseReview> | null = null;

function load(): Record<string, PhraseReview> {
  try {
    const raw = localStorage.getItem('kubicu.admin');
    cache = raw ? ((JSON.parse(raw) as { phraseReviews?: Record<string, PhraseReview> }).phraseReviews ?? {}) : {};
  } catch {
    cache = {};
  }
  return cache;
}

if (typeof window !== 'undefined') {
  const reset = () => {
    cache = null;
  };
  window.addEventListener('kubicu:admin', reset);
  window.addEventListener('storage', reset);
}

export const phraseKey = (lang: UiLang, english: string) => `${lang}::${english}`;

export function phraseOverride(lang: UiLang, english: string): string | undefined {
  const r = (cache ?? load())[phraseKey(lang, english)];
  return r?.status === 'edited' ? r.text : undefined;
}
