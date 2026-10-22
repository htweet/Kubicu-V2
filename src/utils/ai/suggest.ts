import type { Block, PageDocument } from '../../types/page';
import type { Collection, Product } from '../../types/commerce';
import { placeholder } from './draft';

/**
 * Rule-based suggestions for single blocks (D63). They only rephrase what the owner wrote or
 * restate facts already in KUBICU — never new claims.
 */

const FILLER = new Set(['the', 'a', 'an', 'our', 'my', 'very', 'really', 'all', 'just', 'here', 'please', 'of', 'to', 'for', 'and']);

function tidy(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '');
  if (!t) return t;
  // Sentence case only when the owner typed in all caps or all lower case.
  if (t === t.toUpperCase() || t === t.toLowerCase()) return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function shorter(text: string, max: number): string {
  const words = tidy(text).split(' ');
  const kept = words.filter((w, i) => i === 0 || !FILLER.has(w.toLowerCase()));
  const out = kept.slice(0, max).join(' ');
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function unique(original: string, list: string[]): string[] {
  const seen = new Set([original.trim().toLowerCase()]);
  return list.filter((s) => {
    const k = s.trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function headingOptions(text: string, name: string): string[] {
  const base = tidy(text);
  const opts = [base, shorter(text, 4)];
  if (name && name !== 'Your name' && base.length + name.length < 40 && !base.toLowerCase().includes(name.toLowerCase())) opts.push(`${base} at ${name}`);
  return unique(text, opts).slice(0, 3);
}

export function buttonOptions(label: string, url: string): string[] {
  const lower = url.toLowerCase();
  const fromUrl: string[] = [];
  if (/wa\.me|whatsapp/.test(lower)) fromUrl.push('Chat on WhatsApp', 'Order on WhatsApp');else
  if (/instagram/.test(lower)) fromUrl.push('See us on Instagram');else
  if (/tiktok/.test(lower)) fromUrl.push('Watch on TikTok');else
  if (/youtube|youtu\.be/.test(lower)) fromUrl.push('Watch on YouTube');else
  if (/calendly|book/.test(lower)) fromUrl.push('Book a time');else
  if (/maps|goo\.gl/.test(lower)) fromUrl.push('Get directions');
  const stripped = tidy(label.replace(/^(click|tap)\s+(here\s+)?(to\s+)?/i, ''));
  const opts = [stripped, shorter(stripped, 3), ...fromUrl].map((s) => s.length > 28 ? shorter(s, 3) : s);
  return unique(label, opts).slice(0, 3);
}

/** A description built only from the product's own details in Commerce. */
export function productDescription(product: Product | undefined, collections: Collection[], fallbackName: string): string {
  if (!product) return `${fallbackName || 'This product'}. ${placeholder('what it is, what it’s made of and who it’s for')}`;
  const parts: string[] = [];
  parts.push(`${product.name}.`);
  product.options.forEach((o) => {
    if (o.values.length > 1) parts.push(`Comes in ${o.values.length} ${o.name.toLowerCase()} options: ${listOf(o.values)}.`);else
    if (o.values.length === 1) parts.push(`${o.name}: ${o.values[0]}.`);
  });
  if (product.kind === 'digital') {
    parts.push('A digital download — you get the file after paying.');
    if (product.digital?.expiryDays) parts.push(`The download link works for ${product.digital.expiryDays} days.`);
    if (product.digital?.downloadLimit) parts.push(`You can download it up to ${product.digital.downloadLimit} times.`);
  }
  const cols = collections.filter((c) => product.collectionIds.includes(c.id));
  if (cols.length) parts.push(`Part of the ${listOf(cols.map((c) => c.name))} collection${cols.length > 1 ? 's' : ''}.`);
  parts.push(placeholder(product.kind === 'digital' ? 'what’s inside and who it helps' : 'what it’s made of and how it fits or works'));
  return parts.join(' ');
}

function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export interface PageFacts {
  location: string;
  whatsapp: string;
  name: string;
}

export function pageFacts(doc: PageDocument): PageFacts {
  const profile = doc.blocks.find((b): b is Extract<Block, {type: 'profile';}> => b.type === 'profile');
  const wa = doc.blocks.find((b): b is Extract<Block, {type: 'whatsapp';}> => b.type === 'whatsapp' && !!b.content.phone);
  return { location: profile?.content.location ?? '', whatsapp: wa?.content.phone ?? '', name: profile?.content.name ?? doc.title };
}

/** Drafts an answer only from facts on the page. Anything else stays a placeholder. */
export function faqAnswer(question: string, facts: PageFacts): {answer: string;fromFacts: boolean;} {
  const q = question.toLowerCase();
  if (/where|locat|address|find you|based/.test(q) && facts.location) return { answer: `We’re in ${facts.location}.`, fromFacts: true };
  if (/contact|reach|whatsapp|call|talk|message|order/.test(q) && facts.whatsapp)
  return { answer: `Message us on WhatsApp at ${facts.whatsapp} and we’ll reply as soon as we can.`, fromFacts: true };
  if (/deliver|ship|refund|return|exchange|cancel|guarantee|warrant/.test(q)) return { answer: placeholder('your policy — in your own words'), fromFacts: false };
  return { answer: placeholder('your answer'), fromFacts: false };
}