import { useCallback, useEffect, useRef, useState } from 'react';

/* Minimal typing for the browser's speech recognition (not in TypeScript's DOM library). */
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** English messages; the screen translates them. */
const errorMessages: Record<string, string> = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser, or type instead.',
  'service-not-allowed': 'Microphone access was blocked. Allow it in your browser, or type instead.',
  'no-speech': 'Didn’t catch anything. Try again a little closer to the microphone.',
  network: 'Listening needs an internet connection in this browser. You can type instead.',
  'language-not-supported': 'This browser can’t listen in that language yet. Try English, or type instead.',
};

/**
 * Voice to content (D342): the browser turns speech into text. Final words are handed to `onFinal`;
 * words still being heard are in `interim`. Nothing is recorded or sent by KUBICU.
 */
export function useSpeechToText(lang: string, onFinal: (text: string) => void) {
  const supported = recognitionCtor() !== null;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  const stop = useCallback(() => {
    rec.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    rec.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let pending = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current(res[0].transcript.trim());
        else pending += res[0].transcript;
      }
      setInterim(pending.trim());
    };
    r.onerror = (e) => {
      if (e.error === 'aborted') return;
      setError(errorMessages[e.error] ?? 'Listening stopped. Try again, or type instead.');
    };
    r.onend = () => {
      setListening(false);
      setInterim('');
    };
    setError(null);
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setError('Listening stopped. Try again, or type instead.');
    }
  }, [lang]);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, interim, error, start, stop };
}
