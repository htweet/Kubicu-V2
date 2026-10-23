import { useEffect } from 'react';
import { useAccount } from '../utils/account/store';

/** Applies the signed-in person's text size and motion preferences to the whole app (D80). */
export function useAccountEffects(): {reduceMotion: boolean;} {
  const { prefs } = useAccount();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = prefs.textSize;
    root.dataset.motion = prefs.motion;
    root.lang = prefs.language === 'en-GB' ? 'en-GB' : 'en-NG';
  }, [prefs.textSize, prefs.motion, prefs.language]);
  return { reduceMotion: prefs.motion === 'reduce' };
}