import React, { createContext, useContext, useEffect, useMemo } from 'react';

/**
 * Keeps <html lang> in step with the screen language (D429), so screen readers pick the right voice. Used by the
 * website and workspace frames; published seller pages set their own language and aren't affected.
 */
export function useDocumentLang(): void {
  const { lang } = useContext(LocaleContext);
  useEffect(() => {
    document.documentElement.lang = htmlLang[lang] ?? 'en';
  }, [lang]);
}
import { translations, type UiLang } from '../data/translations';
import { phraseOverride } from '../utils/phraseOverrides';
import { translateBuilt } from '../utils/builtPhrases';
import { setActiveLang } from '../utils/localeFormat';

interface LocaleValue {
  lang: UiLang;
  /** Translate English text; falls back to English when there's no draft yet. `{name}` placeholders are filled from vars. */
  t: (text: string, vars?: Record<string, string | number>) => string;
  /** Only on public pages: lets a visitor pick their language. */
  setLang?: (lang: UiLang) => void;
}

const fill = (s: string, vars?: Record<string, string | number>) => vars ? s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? String(vars[k]) : m) : s;

/** English wording staff changed in Super admin → Localisation → English (D465): any text, label, placeholder or name. */
const englishT: LocaleValue['t'] = (text, vars) => fill(phraseOverride('en', text) ?? text, vars);

const english: LocaleValue = { lang: 'en', t: englishT };

/** BCP-47 tags for the <html lang> attribute. Twi is "ak" (Akan); Pidgin is "pcm". */
const htmlLang: Record<UiLang, string> = { en: 'en', pcm: 'pcm', yo: 'yo', ha: 'ha', ig: 'ig', sw: 'sw', tw: 'ak', zu: 'zu' };

const LocaleContext = createContext<LocaleValue>(english);

/** Maps any stored language code (account 'en-NG', page 'en', 'pcm'…) to an interface language. */
export function toUiLang(code?: string | null): UiLang {
  if (code === 'pcm' || code === 'yo' || code === 'ha' || code === 'ig' || code === 'sw' || code === 'tw' || code === 'zu') return code;
  return 'en';
}

/**
 * The translate function for a non-English language. A native reviewer's correction wins over the draft (D135).
 * With no draft, sentences built from names and amounts are tried against the patterns in builtPhrases (D341).
 */
function makeTranslator(lang: Exclude<UiLang, 'en'>): LocaleValue['t'] {
  const dict = translations[lang];
  const lookup = (key: string): string | undefined => phraseOverride(lang, key) ?? dict[key];
  return (text, vars) => {
    const hit = lookup(text);
    if (hit !== undefined) return fill(hit, vars);
    if (!vars) {
      const built = translateBuilt(text, lookup);
      if (built !== undefined) return built;
    }
    // No draft in this language: show staff's English wording if they changed it (D465).
    return fill(phraseOverride('en', text) ?? text, vars);
  };
}

/** A plain translate function for a language — for code that runs before a provider is in place. */
export function translatorFor(lang: UiLang): LocaleValue['t'] {
  if (lang === 'en') return englishT;
  return makeTranslator(lang);
}

export function LocaleProvider({ lang, setLang, children }: {lang: UiLang;setLang?: (lang: UiLang) => void;children: React.ReactNode;}) {
  const value = useMemo<LocaleValue>(() => {
    if (lang === 'en') return { ...english, setLang };
    return { lang, setLang, t: makeTranslator(lang) };
  }, [lang, setLang]);
  // Plain date helpers (formatRelative, formatDate) read this while the subtree renders (D513, D514).
  setActiveLang(lang, value.t);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleValue {
  return useContext(LocaleContext);
}