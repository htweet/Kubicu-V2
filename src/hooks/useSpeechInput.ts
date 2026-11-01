import { useCallback, useEffect, useRef, useState } from 'react';

/** The browser's speech recognition, where it exists (Chrome, Edge, Safari). Firefox has none, so the mic is hidden. */
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: {results: ArrayLike<ArrayLike<{transcript: string;}>>;}) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {SpeechRecognition?: RecognitionCtor;webkitSpeechRecognition?: RecognitionCtor;};
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const speechLang: Record<string, string> = { en: 'en-NG', pcm: 'en-NG', yo: 'yo-NG', ha: 'ha-NG', ig: 'ig-NG', sw: 'sw-KE', tw: 'ak-GH', zu: 'zu-ZA' };

/** Dictation for a single text field: the transcript replaces the text while listening. */
export function useSpeechInput(lang: string, onText: (text: string) => void) {
  const supported = recognitionCtor() !== null;
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);

  const stop = useCallback(() => {
    rec.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = speechLang[lang] ?? 'en-NG';
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((res) => res[0]?.transcript ?? '').join('');
      onText(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang, onText]);

  useEffect(() => () => rec.current?.stop(), []);

  return { supported, listening, toggle: listening ? stop : start, stop };
}