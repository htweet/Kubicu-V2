import React, { createContext, useContext, useMemo } from 'react';
import { translations, type UiLang } from '../data/translations';
import { phraseOverride } from '../utils/phraseOverrides';

interface LocaleValue {
  lang: UiLang;
  /** Translate English text; falls back to English when there's no draft yet. `{name}` placeholders are filled from vars. */
  t: (text: string, vars?: Record<string, string | number>) => string;
  /** Only on public pages: lets a visitor pick their language. */
  setLang?: (lang: UiLang) => void;
}

const fill = (s: string, vars?: Record<string, string | number>) => vars ? s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? String(vars[k]) : m) : s;

const english: LocaleValue = { lang: 'en', t: fill };

const LocaleContext = createContext<LocaleValue>(english);

/** Maps any stored language code (account 'en-NG', page 'en', 'pcm'…) to an interface language. */
export function toUiLang(code?: string | null): UiLang {
  if (code === 'pcm' || code === 'yo' || code === 'ha' || code === 'ig') return code;
  return 'en';
}

/** A plain translate function for a language — for code that runs before a provider is in place. */
export function translatorFor(lang: UiLang): LocaleValue['t'] {
  if (lang === 'en') return fill;
  const dict = translations[lang];
  return (text, vars) => fill(phraseOverride(lang, text) ?? dict[text] ?? text, vars);
}

export function LocaleProvider({ lang, setLang, children }: {lang: UiLang;setLang?: (lang: UiLang) => void;children: React.ReactNode;}) {
  const value = useMemo<LocaleValue>(() => {
    if (lang === 'en') return { ...english, setLang };
    const dict = translations[lang];
    // A native reviewer's correction wins over the draft (D135).
    return { lang, setLang, t: (text, vars) => fill(phraseOverride(lang, text) ?? dict[text] ?? text, vars) };
  }, [lang, setLang]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleValue {
  return useContext(LocaleContext);
}