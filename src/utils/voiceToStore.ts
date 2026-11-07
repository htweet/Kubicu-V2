import { uid } from './id';

/**
 * Voice-to-Store (D102): turns a spoken or typed list of products into drafts.
 * Rule-based and fully on this device. It never guesses a price — a missing price is flagged, not invented.
 */

export const VOICE_APP_ID = 'voice-to-store';
export const VOICE_PLAN = 'creator' as const;
export const MAX_DRAFTS = 20;

export interface VoiceDraft {
  id: string;
  include: boolean;
  name: string;
  description: string;
  priceNgn: number | null;
  qty: number | null;
  /** The words this draft came from, shown so the seller can check it. */
  heard: string;
}

export interface VoiceSession {
  id: string;
  at: string;
  language: string;
  transcript: string;
  added: number;
}

export interface VoiceData {
  sessions: VoiceSession[];
}

export const emptyVoice = (): VoiceData => ({ sessions: [] });
export const voiceKey = (workspaceId: string) => `kubicu.voice.${workspaceId}`;

export const voiceLanguages = [
  { value: 'en-NG', label: 'English (Nigeria)', ready: true },
  { value: 'pcm', label: 'Nigerian Pidgin', ready: false },
  { value: 'yo', label: 'Yorùbá', ready: false },
  { value: 'ha', label: 'Hausa', ready: false },
  { value: 'ig', label: 'Igbo', ready: false },
] as const;

export const SAMPLE_TRANSCRIPT =
  'Ankara wrap dress, fully lined with side pockets, 15k, I have 6 pieces. Next, silk gele in wine colour, 8,500 naira, 10 in stock. Next, beaded clutch bag for 12000, 3 pieces. Next, gift wrapping.';

const toNumber = (digits: string, unit?: string) => {
  const n = Number(digits.replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  const scaled = unit && /^(k|thousand)$/i.test(unit) ? n * 1000 : n;
  return Math.round(scaled);
};

const pricePatterns: RegExp[] = [
  /(?:₦|\bngn\s?|\bn(?=\d))\s?(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?\b/i,
  /\b(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?\s*naira\b/i,
  /\b(?:for|at|price(?:\s+is)?|costs?|selling\s+at)\s+(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?\b/i,
  /\b(\d+(?:\.\d+)?)\s?(k)\b/i,
];

const qtyPatterns: RegExp[] = [
  /\b(?:i\s+have|we\s+have|there\s+are)\s+(\d+)\b(?:\s*(?:pieces|pcs|pc|units|of\s+them))?/i,
  /\b(\d+)\s*(?:pieces|pcs|pc|units|in\s+stock|left|available)\b/i,
  /\b(?:qty|quantity|stock(?:\s+of)?)\s*:?\s*(\d+)\b/i,
];

const filler = /\b(i'?m selling|i am selling|selling|i have|we have|the price is|price is|each|naira|and then|also)\b/gi;

const tidy = (s: string) =>
  s
    .replace(filler, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .trim();

const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Splits on “next”, new lines, semicolons and full stops, then reads a name, price, quantity and description from each piece. */
export function parseTranscript(text: string): VoiceDraft[] {
  const chunks = text
    .split(/\n|;|\.(?=\s|$)|\bnext(?:\s+item)?\b[,:]?/i)
    .map((c) => c.trim())
    .filter((c) => /[a-z]{2,}/i.test(c));

  return chunks.slice(0, MAX_DRAFTS).map((heard) => {
    let rest = heard;
    let priceNgn: number | null = null;
    for (const re of pricePatterns) {
      const m = rest.match(re);
      if (m) {
        priceNgn = toNumber(m[1], m[2]);
        rest = rest.replace(m[0], ' ');
        break;
      }
    }
    let qty: number | null = null;
    for (const re of qtyPatterns) {
      const m = rest.match(re);
      if (m) {
        qty = Number(m[1]);
        rest = rest.replace(m[0], ' ');
        break;
      }
    }
    const parts = rest.split(',').map(tidy).filter(Boolean);
    const name = capitalise(parts[0] ?? '').slice(0, 80);
    const description = capitalise(parts.slice(1).join(', ')).slice(0, 500);
    return { id: uid('vd'), include: !!name, name, description, priceNgn: priceNgn && priceNgn > 0 ? priceNgn : null, qty, heard };
  });
}

export function draftIssue(d: VoiceDraft): string | null {
  if (!d.name.trim()) return 'Add a name';
  if (!d.priceNgn) return 'Needs a price';
  return null;
}

// ——— Browser speech recognition (Chrome, Edge, Safari) ———

export interface SpeechResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
export interface SpeechEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}
export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function speechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
