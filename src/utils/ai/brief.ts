import { examplePages } from '../../data/examples';
import { findMobileNumber } from '../phone';

/**
 * Rule-based reading of a short business brief (D63). Nothing here calls a model — it matches
 * the owner's own words to a starter and pulls out facts they actually typed.
 */

export type AiAction = 'whatsapp' | 'booking' | 'shop' | 'link';

export interface BriefAnalysis {
  /** Best-matching starter, or null when nothing in the brief points to one. */
  exampleId: string | null;
  /** The words that led to the match, shown to the owner as evidence. */
  matched: string[];
  name: string;
  city: string;
  phone: string;
  suggestedAction: AiAction;
}

export interface BriefAnswers {
  category?: string;
  name?: string;
  action?: AiAction;
  phone?: string;
  link?: string;
  city?: string;
}

export type BriefQuestionId = 'category' | 'name' | 'action' | 'city';

const KEYWORDS: Record<string, string[]> = {
  'adaeze-atelier': ['fashion', 'dress', 'dresses', 'clothes', 'clothing', 'ankara', 'tailor', 'boutique', 'aso ebi', 'fabric', 'fabrics', 'bags', 'shoes', 'thrift'],
  'lagos-bookshelf': ['book', 'books', 'bookshop', 'stationery', 'gadgets', 'phones', 'accessories', 'retail', 'provisions'],
  'mama-put-kitchen': ['food', 'kitchen', 'restaurant', 'chef', 'catering', 'meals', 'jollof', 'small chops', 'cakes', 'bakery', 'baker', 'drinks', 'menu', 'chops'],
  'afrobeats-brunch': ['event', 'events', 'party', 'concert', 'brunch', 'tickets', 'show', 'festival', 'rave'],
  'ikeja-food-bank': ['charity', 'donate', 'donation', 'donations', 'ngo', 'volunteer', 'volunteers', 'foundation', 'nonprofit', 'non-profit'],
  'tolu-makes': ['creator', 'content', 'youtube', 'influencer', 'vlog', 'vlogger', 'blog', 'blogger', 'handmade', 'crafts'],
  'studio-nnamdi': ['design', 'designer', 'freelance', 'freelancer', 'developer', 'photography', 'photographer', 'portfolio', 'branding', 'illustrator'],
  'ife-sounds': ['music', 'musician', 'singer', 'dj', 'producer', 'songs', 'album', 'beats', 'band'],
  'kemi-presets': ['presets', 'ebook', 'e-book', 'course', 'courses', 'templates', 'digital download', 'downloads', 'guide'],
  'glow-by-halima': ['beauty', 'makeup', 'make-up', 'hair', 'salon', 'nails', 'lashes', 'spa', 'skincare', 'barber', 'braids', 'wigs'],
  'fixright-plumbing': ['plumber', 'plumbing', 'repair', 'repairs', 'electrician', 'cleaning', 'cleaner', 'mechanic', 'installation', 'handyman', 'fumigation'],
  'bello-and-co': ['lawyer', 'legal', 'accountant', 'accounting', 'consulting', 'consultant', 'coach', 'coaching', 'therapy', 'therapist', 'tax', 'firm']
};

const CITIES = ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano', 'Enugu', 'Benin City', 'Kaduna', 'Abeokuta', 'Jos', 'Ilorin', 'Owerri', 'Uyo', 'Calabar', 'Warri', 'Akure', 'Lekki', 'Ikeja', 'Yaba', 'Surulere', 'Ajah', 'Wuse', 'Accra', 'Nairobi'];

const NAME_PATTERNS = [/(?:called|named|brand is|business is|name is)\s+["“]?([A-Z][\w'&.-]*(?:\s+[A-Z&][\w'&.-]*){0,3})/, /^([A-Z][\w'&.-]*(?:\s+[A-Z&][\w'&.-]*){0,3})\s+(?:is|sells|makes|offers|helps)\b/];

const BOOK_GOALS = new Set(['book']);

function hasWord(text: string, word: string): boolean {
  return new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}([^a-z]|$)`).test(text);
}

export function analyzeBrief(brief: string): BriefAnalysis {
  const lower = brief.toLowerCase();
  let best: {id: string;words: string[];} | null = null;
  Object.entries(KEYWORDS).forEach(([id, words]) => {
    const hits = words.filter((w) => hasWord(lower, w));
    if (hits.length && (!best || hits.length > best.words.length)) best = { id, words: hits };
  });
  const found = best as {id: string;words: string[];} | null;
  const example = found ? examplePages.find((e) => e.id === found.id) : undefined;

  let name = '';
  for (const p of NAME_PATTERNS) {
    const m = p.exec(brief.trim());
    if (m && !/^(I|We|My|Our|The|A|An)$/.test(m[1])) {
      name = m[1].trim().replace(/[.,]$/, '');
      break;
    }
  }

  const city = CITIES.find((c) => hasWord(lower, c.toLowerCase())) ?? '';
  // Any of our four countries' mobile numbers (D420).
  const phone = findMobileNumber(brief) ?? '';
  const suggestedAction: AiAction = /\bbook|appointment|session/.test(lower) || example?.goals.some((g) => BOOK_GOALS.has(g)) ?
  'booking' :
  /\bwhatsapp|dm|chat\b/.test(lower) || phone ?
  'whatsapp' :
  example?.goals.includes('sell') ?
  'shop' :
  'whatsapp';

  return { exampleId: example?.id ?? null, matched: found?.words ?? [], name, city, phone, suggestedAction };
}

/** Up to four follow-up questions — only for what the brief didn't already say. */
export function questionsFor(a: BriefAnalysis): BriefQuestionId[] {
  const out: BriefQuestionId[] = [];
  if (!a.exampleId) out.push('category');
  if (!a.name) out.push('name');
  out.push('action');
  if (!a.city) out.push('city');
  return out.slice(0, 4);
}

/** The owner's own first sentence, trimmed for a one-line pitch. Never reworded into claims. */
export function pitchFrom(brief: string): string {
  const first = brief.trim().split(/(?<=[.!?])\s+/)[0] ?? '';
  const clean = first.replace(/\s+/g, ' ').replace(PHONE, '').trim();
  if (clean.length <= 100) return clean;
  const cut = clean.slice(0, 100);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Sentences after the first, used for an About text block. */
export function aboutFrom(brief: string): string {
  return brief.trim().split(/(?<=[.!?])\s+/).slice(1).join(' ').replace(PHONE, '').replace(/\s+/g, ' ').trim();
}

export const MIN_BRIEF = 20;