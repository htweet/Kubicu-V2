import { useCallback, useState } from 'react';
import { toUiLang } from '../contexts/LocaleContext';
import type { UiLang } from '../data/translations';

const KEY = 'kubicu.visitorLang';

/** A visitor's chosen language on public pages (D133): their own pick on this device, else the page's language. */
export function useVisitorLang(pageLang?: string | null): [UiLang, (lang: UiLang) => void] {
  const [picked, setPicked] = useState<UiLang | null>(() => {
    try {
      const v = localStorage.getItem(KEY);
      return v ? toUiLang(v) : null;
    } catch {
      return null;
    }
  });
  const set = useCallback((lang: UiLang) => {
    setPicked(lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch {

      /* private mode — keep it for this visit only */}
  }, []);
  return [picked ?? toUiLang(pageLang), set];
}