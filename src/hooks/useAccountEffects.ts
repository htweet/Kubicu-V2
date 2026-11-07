import { useEffect } from 'react';
import { useAccount } from '../utils/account/store';
import { toUiLang } from '../contexts/LocaleContext';
import type { UiLang } from '../data/translations';

/** Applies the signed-in person's text size, motion and language preferences to the whole app (D80, D133). */
export function useAccountEffects(): { reduceMotion: boolean; lang: UiLang } {
  const { prefs } = useAccount();
  const lang = toUiLang(prefs.language);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = prefs.textSize;
    root.dataset.motion = prefs.motion;
    root.lang = lang !== 'en' ? lang : prefs.language === 'en-GB' ? 'en-GB' : 'en-NG';
  }, [prefs.textSize, prefs.motion, prefs.language, lang]);
  return { reduceMotion: prefs.motion === 'reduce', lang };
}
