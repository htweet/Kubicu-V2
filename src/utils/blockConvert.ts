import type { Block, BlockContentMap, BlockType } from '../types/page';
import { createBlock } from './blocks';
import { uid } from './id';

/*
 * Change block type (D171). Only pairs where the content carries across. Each conversion says what,
 * if anything, won't come along, so nothing is lost by surprise — and Undo always restores the original.
 */

interface Conversion<F extends BlockType, T extends BlockType> {
  from: F;
  to: T;
  /** Shown before converting; empty = nothing is lost. */
  loses: (c: BlockContentMap[F]) => string;
  map: (c: BlockContentMap[F], base: BlockContentMap[T]) => BlockContentMap[T];
}

const conv = <F extends BlockType, T extends BlockType>(c: Conversion<F, T>) => c as unknown as Conversion<BlockType, BlockType>;

const conversions: Conversion<BlockType, BlockType>[] = [
  conv({ from: 'text', to: 'quote', loses: (c) => (c.body.length > 280 ? 'Long text reads better as a paragraph than a quote.' : ''), map: (c, b) => ({ ...b, text: c.body }) }),
  conv({ from: 'quote', to: 'text', loses: (c) => (c.name ? 'The attribution becomes a line under the text.' : ''), map: (c, b) => ({ ...b, body: c.name ? `${c.text}\n— ${c.name}${c.role ? `, ${c.role}` : ''}` : c.text }) }),
  conv({ from: 'testimonial', to: 'quote', loses: (c) => (c.avatarUrl ? 'The photo and permission record don’t carry over.' : 'The permission record doesn’t carry over.'), map: (c, b) => ({ ...b, text: c.quote, name: c.name, role: c.role, style: 'marked' }) }),
  conv({ from: 'gallery', to: 'carousel', loses: () => '', map: (c, b) => ({ ...b, title: c.title, slides: c.images.map((i) => ({ id: uid('sl'), imageUrl: i.url, imageAlt: i.alt, title: '', text: '', url: '' })) }) }),
  conv({ from: 'carousel', to: 'gallery', loses: (c) => (c.slides.some((s) => s.title || s.text || s.url) ? 'Slide titles, text and links don’t carry over.' : ''), map: (c, b) => ({ ...b, title: c.title, images: c.slides.filter((s) => s.imageUrl).map((s) => ({ ...b.images[0], id: uid('img'), url: s.imageUrl, alt: s.imageAlt })).slice(0, 12) }) }),
  conv({ from: 'link', to: 'cta', loses: () => '', map: (c, b) => ({ ...b, title: c.description || c.label, text: c.description ? '' : '', primaryLabel: c.label, primaryUrl: c.url }) }),
  conv({ from: 'cta', to: 'link', loses: (c) => (c.secondaryLabel || c.text ? 'The second button and supporting line don’t carry over.' : ''), map: (c, b) => ({ ...b, label: c.primaryLabel || c.title, url: c.primaryUrl, description: c.title !== c.primaryLabel ? c.title : '' }) }),
  conv({ from: 'contact', to: 'contactActions', loses: (c) => (c.address || c.hours ? 'Address and hours don’t carry over — add a Location or Business hours block.' : ''), map: (c, b) => ({ ...b, phone: c.phone, email: c.email }) }),
  conv({ from: 'contactActions', to: 'contact', loses: (c) => (c.whatsapp || c.website ? 'WhatsApp and website don’t carry over.' : ''), map: (c, b) => ({ ...b, phone: c.phone, email: c.email }) }),
  conv({ from: 'location', to: 'hours', loses: (c) => (c.address ? 'The address doesn’t carry over.' : ''), map: (c, b) => ({ ...b, title: c.name ? `${c.name} hours` : b.title, timeZone: c.timeZone, hours: c.hours, note: c.note }) }),
  conv({ from: 'hours', to: 'location', loses: () => 'Add your address after converting.', map: (c, b) => ({ ...b, timeZone: c.timeZone, hours: c.hours, note: c.note }) }),
  conv({ from: 'steps', to: 'timeline', loses: () => 'Add a date to each milestone after converting.', map: (c, b) => ({ ...b, title: c.title, intro: c.intro, items: c.items.map((i) => ({ id: uid('tl'), date: '', title: i.title, text: i.text })) }) }),
  conv({ from: 'timeline', to: 'steps', loses: (c) => (c.items.some((i) => i.date) ? 'Dates don’t carry over — steps are numbered instead.' : ''), map: (c, b) => ({ ...b, title: c.title, intro: c.intro, items: c.items.map((i) => ({ ...b.items[0], id: uid('st'), title: i.title, text: i.text })) }) }),
  conv({ from: 'newsletter', to: 'leadForm', loses: () => 'The new form also asks for a name and message; change its fields after converting.', map: (c, b) => ({ ...b, title: c.title, description: c.description, submitLabel: c.buttonLabel, consentText: c.consentText }) }),
  conv({ from: 'faq', to: 'policies', loses: () => '', map: (c, b) => ({ ...b, title: c.title, items: c.items.map((i) => ({ id: uid('pol'), title: i.question, text: i.answer })) }) }),
  conv({ from: 'policies', to: 'faq', loses: () => '', map: (c, b) => ({ ...b, title: c.title, items: c.items.map((i) => ({ ...b.items[0], id: uid('faq'), question: i.title, answer: i.text })) }) }),
  // Delivery & returns (D181): an older Policies block that held delivery and returns can become one.
  conv({
    from: 'policies',
    to: 'delivery',
    loses: (c) => (c.items.some((i) => !/deliver|ship|pick|collect|return|exchange|refund/i.test(i.title)) ? 'Policies other than delivery, pickup and returns don’t carry over — keep them in a Policies block.' : ''),
    map: (c, b) => {
      const find = (re: RegExp) => c.items.filter((i) => re.test(i.title)).map((i) => i.text.trim()).filter(Boolean).join('\n\n');
      const deliveryText = find(/deliver|ship/i);
      // Delivery written as prose goes in the intro; areas and prices can then be added as rows.
      return { ...b, title: c.title || b.title, source: 'own', intro: [c.intro.trim(), deliveryText].filter(Boolean).join('\n\n'), zones: [], pickup: find(/pick|collect/i), returns: find(/return|exchange|refund/i) };
    },
  }),
  conv({ from: 'smartButton', to: 'link', loses: (c) => (c.rules.length ? 'Versions by visitor source don’t carry over.' : ''), map: (c, b) => ({ ...b, label: c.label, url: c.url }) }),
  conv({ from: 'link', to: 'smartButton', loses: (c) => (c.description ? 'The description doesn’t carry over.' : ''), map: (c, b) => ({ ...b, label: c.label, url: c.url }) }),
];

export function conversionsFor(block: Block): { to: BlockType; loses: string }[] {
  return conversions.filter((c) => c.from === block.type).map((c) => ({ to: c.to, loses: c.loses(block.content as never) }));
}

/** The converted block keeps its id, layout, visibility, schedule and accessibility label. */
export function convertBlock(block: Block, to: BlockType): Block | null {
  const c = conversions.find((x) => x.from === block.type && x.to === to);
  if (!c) return null;
  const fresh = createBlock(to);
  return { ...block, type: to, content: c.map(block.content as never, fresh.content as never), style: { ...block.style, align: fresh.style.align }, updatedAt: new Date().toISOString() } as Block;
}
