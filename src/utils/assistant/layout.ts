import type { Block, BlockType, PageTheme } from '../../types/page';
import type { AssistantAction, AssistantAnswers, AssistantFeel, AssistantImage, AssistantItem, AssistantOffer, AssistantPlan, PlanUnit } from '../../types/assistant';
import type { ExampleGoal, ExamplePage } from '../../data/examples/build';
import { examplePages } from '../../data/examples';
import { sectionPresets } from '../../data/sectionPresets';
import { signatureTheme, signatureThemes } from '../../data/signatureThemes';
import { pageThemePresets } from '../../data/pageThemes';
import { actionLabels, feelLabels } from '../../data/assistantQuestions';
import { analyzeBrief, aboutFrom, pitchFrom, type AiAction } from '../ai/brief';
import { buildDraft, hasPlaceholder, placeholder } from '../ai/draft';
import { blockName, createBlock } from '../blocks';
import { validateBlock } from '../validation';
import { uid } from '../id';

/**
 * Layout for the AI page assistant (D211): score the starters against the answers and use a strong match,
 * otherwise compose a new page from ready-made sections and blocks. Words only ever come from the owner —
 * anything else is an "[Add …]" placeholder that blocks publishing.
 */

/** A starter needs at least this score to be used as-is; below it the assistant composes a new layout. */
export const STRONG_MATCH = 9;

const actionGoals: Record<AssistantAction, ExampleGoal[]> = {
  order: ['sell'],
  buy: ['sell'],
  book: ['book'],
  enquire: ['book', 'showcase'],
  follow: ['audience', 'showcase'],
  donate: ['support']
};

const offerGoals: Record<AssistantOffer, ExampleGoal[]> = {
  products: ['sell'],
  menu: ['sell'],
  services: ['book'],
  events: ['events'],
  content: ['showcase', 'audience'],
  cause: ['support']
};

const feelStyle: Partial<Record<AssistantFeel, ExamplePage['styles'][number]>> = { light: 'light', dark: 'dark', editorial: 'editorial', bold: 'bold' };

export interface StarterScore {
  example: ExamplePage;
  score: number;
  reasons: string[];
}

/** Starters the workspace can use right now: the free ones, plus premium ones it owns. */
export function starterPool(owns: (id: string) => boolean): ExamplePage[] {
  return examplePages.filter((e) => !e.artwork && (!e.elite || owns(e.id)));
}

export function scoreStarters(answers: AssistantAnswers, owns: (id: string) => boolean): StarterScore[] {
  const fromBrief = analyzeBrief(answers.brief);
  return starterPool(owns).
  map((example) => {
    let score = 0;
    const reasons: string[] = [];
    if (answers.business && answers.business === example.id) {
      score += 8;
      reasons.push(`you said you’re closest to ${example.category.toLowerCase()}`);
    } else if (fromBrief.exampleId === example.id) {
      score += 5;
      reasons.push(`you mentioned ${fromBrief.matched.slice(0, 2).map((w) => `“${w}”`).join(' and ')}`);
    }
    if (answers.action && actionGoals[answers.action].some((g) => example.goals.includes(g))) {
      score += 3;
      reasons.push(`it’s built for “${actionLabels[answers.action].toLowerCase()}”`);
    }
    if (answers.offer && offerGoals[answers.offer].some((g) => example.goals.includes(g))) score += 2;
    const style = answers.feel ? feelStyle[answers.feel] : undefined;
    if (style && example.styles.includes(style)) score += 1;
    return { example, score, reasons };
  }).
  sort((a, b) => b.score - a.score);
}

/** The look for a chosen feel: a Signature theme on Creator and above, a Classic theme on Free. */
export function themeForFeel(feel: AssistantFeel, signatureAllowed: boolean): {theme: PageTheme;name: string;} {
  if (signatureAllowed) {
    const preferred: Record<AssistantFeel, string> = { warm: 'Soft Clay', light: 'Arctic Prism', bold: 'Neo-Gloss Pop', dark: 'Obsidian Chrome', editorial: 'Monochrome Editorial', glass: 'Aurora Glass' };
    const t = signatureThemes.find((s) => s.name === preferred[feel]) ?? signatureThemes.find((s) => s.mood === feel) ?? signatureThemes[0];
    return { theme: signatureTheme(t), name: t.name };
  }
  const classic: Record<AssistantFeel, string> = { warm: 'Sand', light: 'Studio white', bold: 'Expressive', dark: 'Midnight', editorial: 'Noir & cream', glass: 'Blush' };
  const p = pageThemePresets.find((x) => x.name === classic[feel]) ?? pageThemePresets[0];
  return { theme: { ...p.theme }, name: p.name };
}

function mk<K extends BlockType>(type: K, content: Record<string, unknown> = {}, extra: Partial<Pick<Block, 'layout' | 'style'>> = {}): Block {
  const b = createBlock(type);
  return { ...b, content: { ...b.content, ...content }, layout: { ...b.layout, ...extra.layout }, style: { ...b.style, ...extra.style } } as Block;
}

function preset(id: string, name: string): Block[] {
  return sectionPresets.find((p) => p.id === id)?.build({ name }) ?? [];
}

function draftAction(a: AssistantAction | undefined): AiAction {
  if (a === 'book') return 'booking';
  if (a === 'buy') return 'shop';
  if (a === 'follow' || a === 'donate') return 'link';
  return 'whatsapp';
}

const heroVariant = (answers: AssistantAnswers) => {
  if (answers.offer === 'events') return 'poster';
  if (answers.offer === 'content') return answers.feel === 'editorial' ? 'masthead' : 'portrait';
  if (answers.offer === 'menu' || answers.feel === 'bold' || answers.feel === 'dark') return 'cover';
  return 'split';
};

/** A new page assembled from sections and blocks: who you are → main action → the offer → about → practical → ending. */
function composeBlocks(a: AssistantAnswers, images: AssistantImage[]): {blocks: Block[];notes: string[];} {
  const name = a.name?.trim() || placeholder('your business name');
  const pitch = pitchFrom(a.brief);
  const about = aboutFrom(a.brief);
  const phone = a.phone?.trim() ?? '';
  const action = a.action ?? 'enquire';
  const logo = images.find((i) => i.role === 'logo');
  const hero = images.find((i) => i.role === 'hero');
  const notes: string[] = [];
  const blocks: Block[] = [];

  if (logo) blocks.push(mk('brandHeader', { logoUrl: logo.src, logoAlt: `${a.name || 'Business'} logo`, name, tagline: '', ctaLabel: '', url: '', align: 'left' }));
  blocks.push(
    mk(
      'hero',
      { variant: heroVariant(a), eyebrow: a.city ?? '', title: name, subtitle: pitch, imageUrl: hero?.src ?? '', imageAlt: hero ? `${a.name || 'Our'} work` : '', focal: 'center', primaryLabel: actionLabels[action], primaryUrl: '', secondaryLabel: '', secondaryUrl: '', meta: a.offer === 'events' ? placeholder('date and venue') : '' },
      { layout: { width: 'full' } }
    )
  );
  notes.push(`Opened with a ${heroVariant(a)} hero carrying your name and your own first sentence.`);

  // The one action, straight under the opening.
  if (action === 'order') blocks.push(mk('whatsapp', { label: 'Order on WhatsApp', phone, message: `Hi ${a.name || 'there'}, I’d like to order.` }, { style: { emphasis: 'featured' } }));
  if (action === 'enquire') blocks.push(mk('contactActions', { title: '', phone, whatsapp: phone, email: '', website: '', layout: 'row' }));
  if (action === 'book') blocks.push(mk('booking'));
  if (action === 'follow') blocks.push(mk('social'));
  if (action === 'donate') blocks.push(mk('support'));

  // The offer.
  const offer = a.offer ?? 'content';
  if (offer === 'products') blocks.push(...preset('collection-shop', name));
  if (offer === 'menu') blocks.push(mk('menu', { whatsappPhone: phone }));
  if (offer === 'services') blocks.push(mk('featureGrid', { title: 'What I offer', intro: '', columns: 3, items: [1, 2, 3].map(() => ({ id: uid('ft'), title: placeholder('a service'), text: '', imageUrl: '', imageAlt: '', label: '', url: '' })) }));
  if (offer === 'events') blocks.push(mk('event'));
  if (offer === 'cause') blocks.push(mk('featureGrid', { title: 'Where your support goes', intro: '', columns: 3, items: [1, 2, 3].map(() => ({ id: uid('ft'), title: placeholder('one thing support pays for'), text: '', imageUrl: '', imageAlt: '', label: '', url: '' })) }));
  const gallery = images.filter((i) => i.role === 'gallery');
  if (offer === 'content' && gallery.length < 2) blocks.push(mk('portfolio', { title: 'Selected work' }));
  if (gallery.length >= 2) {
    blocks.push(mk('gallery', { title: offer === 'content' ? 'Selected work' : '', layout: gallery.length >= 4 ? 'masonry' : 'grid', images: gallery.map((g) => ({ id: uid('gi'), url: g.src, alt: '' })) }, { layout: { width: 'wide' } }));
    notes.push(`Put ${gallery.length} of your photos in a ${gallery.length >= 4 ? 'masonry' : 'grid'} gallery.`);
  }

  // About, in their words.
  blocks.push(mk('text', { variant: 'editorial', body: about ? `About ${a.name || 'us'}\n${about}` : `About ${a.name || 'us'}\n${placeholder('a few lines about who you are and who you help')}` }));

  // Practical details when people need to find or reach you.
  if (a.city || offer === 'menu' || action === 'book' || action === 'order') blocks.push(...preset('location-hours', name).map((b) => b.type === 'location' && a.city ? { ...b, content: { ...b.content, address: `${placeholder('street address')}, ${a.city}` } } as Block : b));

  // Questions, answered by the owner only.
  const faq = mk('faq');
  blocks.push(faq.type === 'faq' ? { ...faq, content: { ...faq.content, items: faq.content.items.map((i) => ({ ...i, answer: placeholder('your answer') })) } } as Block : faq);

  // A clear ending.
  if (action !== 'enquire') blocks.push(mk('contactActions', { title: 'Get in touch', phone, whatsapp: phone, email: '', website: '', layout: 'row' }));
  notes.push('Ended with ways to reach you, so the page never stops without a next step.');
  return { blocks, notes };
}

/** Puts the owner's photos into a starter's layout. */
function placeImages(blocks: Block[], images: AssistantImage[], name: string): Block[] {
  const logo = images.find((i) => i.role === 'logo');
  const hero = images.find((i) => i.role === 'hero');
  const gallery = images.filter((i) => i.role === 'gallery');
  let heroUsed = false;
  let galleryUsed = false;
  let out = blocks.map((b) => {
    if (logo && b.type === 'profile') return { ...b, content: { ...b.content, avatarUrl: logo.src, avatarAlt: `${name} logo` } } as Block;
    if (logo && b.type === 'brandHeader') return { ...b, content: { ...b.content, logoUrl: logo.src, logoAlt: `${name} logo` } } as Block;
    if (hero && !heroUsed && b.type === 'hero') {
      heroUsed = true;
      return { ...b, content: { ...b.content, imageUrl: hero.src, imageAlt: `${name}` } } as Block;
    }
    if (hero && !heroUsed && b.type === 'image') {
      heroUsed = true;
      return { ...b, content: { ...b.content, url: hero.src, alt: name } } as Block;
    }
    if (gallery.length && !galleryUsed && b.type === 'gallery') {
      galleryUsed = true;
      return { ...b, visibility: { ...b.visibility, hidden: false }, content: { ...b.content, images: gallery.map((g) => ({ id: uid('gi'), url: g.src, alt: '' })) } } as Block;
    }
    return b;
  });
  const top = Math.max(0, out.findIndex((b) => b.type === 'profile' || b.type === 'hero' || b.type === 'brandHeader'));
  if (hero && !heroUsed) out.splice(top + 1, 0, mk('image', { url: hero.src, alt: name, caption: '', aspect: hero.width >= hero.height ? '16:9' : '4:5' }));
  if (gallery.length >= 2 && !galleryUsed) {
    const end = out.findIndex((b) => b.type === 'faq' || b.type === 'contact' || b.type === 'contactActions');
    out = [...out.slice(0, end < 0 ? out.length : end), mk('gallery', { title: '', layout: 'grid', images: gallery.map((g) => ({ id: uid('gi'), url: g.src, alt: '' })) }, { layout: { width: 'wide' } }), ...out.slice(end < 0 ? out.length : end)];
  }
  return out;
}

/** Hides (never deletes) anything that can't publish yet, and lists what the owner still needs to fill. */
function settle(blocks: Block[]): {blocks: Block[];gaps: string[];} {
  const gaps: string[] = [];
  const settled = blocks.map((b) => {
    if (b.type === 'profile' || b.type === 'hero') {
      if (hasPlaceholder(b)) gaps.push(`${blockName(b)} — replace the [Add …] text`);
      return b;
    }
    if (!b.visibility.hidden && validateBlock(b).some((i) => i.severity === 'error')) {
      gaps.push(`${blockName(b)} — hidden until you add its details`);
      return { ...b, visibility: { ...b.visibility, hidden: true } } as Block;
    }
    if (hasPlaceholder(b)) gaps.push(`${blockName(b)} — replace the [Add …] text`);
    return b;
  });
  return { blocks: settled, gaps: [...new Set(gaps)] };
}

/** Groups blocks into build steps: a top-level block plus anything inside it. */
export function unitsFrom(blocks: Block[]): PlanUnit[] {
  return blocks.
  filter((b) => !b.parentId).
  map((b) => ({ id: b.id, label: blockName(b), blocks: [b, ...blocks.filter((c) => c.parentId === b.id)] }));
}

interface PlanContext {
  owns: (id: string) => boolean;
  signatureAllowed: boolean;
  currentTheme: PageTheme;
  /** Bookings is installed, so services can be created there. */
  bookingsReady: boolean;
  /** Owner picked "Prefer something else?" → this starter. */
  forceExampleId?: string;
}

/** Where the owner's list goes: Commerce products (products and menus) or Bookings services. */
export function itemsAsFor(offer: AssistantOffer | undefined): 'products' | 'services' | null {
  if (offer === 'products' || offer === 'menu') return 'products';
  if (offer === 'services') return 'services';
  return null;
}

/** Suggests where each photo goes: the first is the main image; for products, the next ones go to items in order. */
export function placePhotos(items: AssistantItem[], images: AssistantImage[], itemsAs: 'products' | 'services' | null): {items: AssistantItem[];images: AssistantImage[];matched: number;} {
  if (itemsAs !== 'products' || !items.length) return { items, images, matched: 0 };
  const spare = images.filter((i) => i.role === 'gallery');
  let n = 0;
  const withPhotos = items.map((item) => item.imageSrc || n >= spare.length ? item : { ...item, imageSrc: spare[n++].src });
  const used = new Set(spare.slice(0, n).map((i) => i.src));
  return { items: withPhotos, images: images.filter((i) => !used.has(i.src)), matched: n };
}

/** Puts the owner's own list into the page: menu items, a catalogue product grid, or service packages. */
function fillItems(blocks: Block[], a: AssistantAnswers, items: AssistantItem[], itemsAs: 'products' | 'services' | null, bookingsReady: boolean): Block[] {
  const phone = a.phone?.trim() ?? '';
  let out = blocks;
  if (itemsAs === 'products' && items.length) {
    const menuItems = items.map((i) => ({ id: uid('mi'), name: i.name, description: '', priceNgn: i.priceNgn, tags: '', available: true, productId: i.id }));
    const gridContent = { source: 'catalog', productIds: items.map((i) => i.id), collectionId: null, items: [], orderAction: a.action === 'buy' ? 'checkout' : 'whatsapp', whatsappPhone: phone, ctaLabel: a.action === 'buy' ? 'Add to cart' : 'Order' };
    let placed = false;
    out = out.
    filter((b) => b.type !== 'shopCategories').
    map((b) => {
      if (b.type === 'menu') {
        placed = true;
        return { ...b, visibility: { ...b.visibility, hidden: false }, content: { ...b.content, whatsappPhone: phone || b.content.whatsappPhone, categories: [{ id: uid('mc'), name: 'Menu', items: menuItems }] } } as Block;
      }
      if (b.type === 'productGrid') {
        placed = true;
        return { ...b, visibility: { ...b.visibility, hidden: false }, content: { ...b.content, ...gridContent } } as Block;
      }
      return b;
    });
    if (!placed) {
      const block = a.offer === 'menu' ? mk('menu', { whatsappPhone: phone, categories: [{ id: uid('mc'), name: 'Menu', items: menuItems }] }) : mk('productGrid', { title: 'Shop', ...gridContent });
      const at = Math.max(0, out.findIndex((b) => b.type === 'whatsapp' || b.type === 'contactActions' || b.type === 'booking')) + 1;
      out = [...out.slice(0, at), block, ...out.slice(at)];
    }
  }
  if (itemsAs === 'services' && items.length) {
    const packages = items.map((i, n) => ({ id: uid('pkg'), name: i.name, priceNgn: i.priceNgn, unit: '', description: '', features: '', ctaLabel: bookingsReady ? 'Book' : 'Enquire', url: '', highlighted: n === 0 && items.length > 2, serviceId: bookingsReady ? i.id : undefined }));
    let placed = false;
    out = out.map((b) => {
      if (b.type === 'pricing' || b.type === 'featureGrid' && b.content.title === 'What I offer') {
        if (placed) return b;
        placed = true;
        return mk('pricing', { title: 'Services', packages });
      }
      return b;
    });
    if (!placed) {
      const at = Math.max(0, out.findIndex((b) => b.type === 'hero' || b.type === 'profile')) + 1;
      out = [...out.slice(0, at), mk('pricing', { title: 'Services', packages }), ...out.slice(at)];
    }
  }
  // Booking blocks point at a real service, or become an enquiry form when Bookings isn't installed.
  return out.map((b) => {
    if (b.type !== 'booking') return b;
    if (bookingsReady && itemsAs === 'services' && items.length) return { ...b, visibility: { ...b.visibility, hidden: false }, content: { ...b.content, source: 'catalog', serviceId: items[0].id, title: `Book ${items[0].name}` } } as Block;
    if (!bookingsReady) return mk('leadForm', { title: 'Ask about booking', submitLabel: 'Send enquiry' });
    return b;
  });
}

export function makePlan(answers: AssistantAnswers, allImages: AssistantImage[], ctx: PlanContext): AssistantPlan {
  const itemsAs = itemsAsFor(answers.offer);
  const photoPlan = placePhotos(answers.items ?? [], allImages, itemsAs);
  const items = photoPlan.items;
  const images = photoPlan.images;
  const scores = scoreStarters(answers, ctx.owns);
  const forced = ctx.forceExampleId ? scores.find((s) => s.example.id === ctx.forceExampleId) : undefined;
  const best = forced ?? (scores[0] && scores[0].score >= STRONG_MATCH ? scores[0] : undefined);
  const name = answers.name?.trim() || '';
  const assumptions: string[] = [];
  let blocks: Block[];
  let source: AssistantPlan['source'];
  let baseTheme: PageTheme;

  if (best) {
    const analysis = analyzeBrief(answers.brief);
    const draft = buildDraft(answers.brief, { category: best.example.id, name: name || undefined, action: draftAction(answers.action), phone: answers.phone, city: answers.city }, analysis);
    blocks = placeImages(draft.doc.blocks, images, name || 'Your business');
    baseTheme = draft.doc.theme;
    source = { kind: 'template', exampleId: best.example.id, name: best.example.category, reason: forced ? 'You chose it.' : `Picked because ${best.reasons.slice(0, 2).join(' and ') || 'it fits your answers'}.` };
    assumptions.push(...draft.assumptions.slice(1));
  } else {
    const composed = composeBlocks(answers, images);
    blocks = composed.blocks;
    baseTheme = ctx.currentTheme;
    const label = answers.businessText?.trim() || (answers.offer ? `${answers.offer} page` : 'your page');
    source = { kind: 'composed', name: `${label.charAt(0).toUpperCase()}${label.slice(1)} — composed`, reason: 'None of the templates fit your answers closely, so I put together a new layout from ready-made sections.' };
    assumptions.push(...composed.notes);
  }

  const look = answers.feel ? themeForFeel(answers.feel, ctx.signatureAllowed) : { theme: baseTheme, name: best ? `${best.example.category} look` : 'Your current look' };
  if (answers.feel) assumptions.push(`Used the ${look.name} theme for “${feelLabels[answers.feel].toLowerCase()}”.`);
  if (!images.some((i) => i.role === 'logo')) assumptions.push('No logo yet — your initials show until you add one.');
  if (!images.some((i) => i.role !== 'logo')) assumptions.push('No photos yet — image spots stay empty or hidden until you add them.');
  assumptions.push('Prices, reviews, qualifications, delivery times and policies are never written for you.');
  if (photoPlan.matched) assumptions.push(`Matched ${photoPlan.matched} photo${photoPlan.matched === 1 ? '' : 's'} to your first item${photoPlan.matched === 1 ? '' : 's'} by order — change any in Commerce.`);
  if (itemsAs === 'products' && items.length) assumptions.push('Stock counting is off for these products — switch it on in Commerce if you count stock.');
  if (itemsAs === 'services' && items.length && !ctx.bookingsReady) assumptions.push('Bookings isn’t installed, so people send an enquiry instead of booking. Install Bookings from Extensions to take bookings.');

  blocks = fillItems(blocks, answers, items, itemsAs, ctx.bookingsReady);
  const settled = settle(blocks);
  const units = unitsFrom(settled.blocks);
  const creates = [`A page with ${units.length} sections`, `The ${look.name} look`];
  if (answers.action === 'order' || answers.action === 'enquire') creates.push(answers.phone ? `WhatsApp to ${answers.phone}` : 'A WhatsApp button (hidden until you add a number)');
  if (allImages.length) creates.push(`${allImages.length} photo${allImages.length === 1 ? '' : 's'} saved in Media`);
  const unpriced = items.filter((i) => i.priceNgn === null).length;
  if (itemsAs === 'products' && items.length) creates.push(`${items.length} product${items.length === 1 ? '' : 's'} in Commerce${unpriced ? ` (${unpriced} as draft${unpriced === 1 ? '' : 's'} until priced)` : ''}`);
  if (itemsAs === 'services' && items.length) creates.push(ctx.bookingsReady ? `${items.length} Bookings service${items.length === 1 ? '' : 's'} (60 min each — adjust in Bookings)` : `${items.length} service${items.length === 1 ? '' : 's'} on the page, with an enquiry form`);
  if (answers.qr) creates.push('A QR code and campaign link for this page');
  if (source.kind === 'composed') creates.push('This layout saved as your own private template');
  const suggestSpace = answers.offer === 'events' ? 'event' as const : undefined;

  const alternatives = scores.
  filter((s) => s.example.id !== source.exampleId && s.score > 0).
  slice(0, 2).
  map((s) => ({ id: s.example.id, name: s.example.category }));

  const gaps = [...settled.gaps];
  if (unpriced) gaps.push(`${unpriced} item${unpriced === 1 ? '' : 's'} without a price — add ${unpriced === 1 ? 'it' : 'them'} in ${itemsAs === 'services' ? 'Bookings' : 'Commerce'}`);

  return { source, alternatives, units, theme: { ...look.theme }, themeName: look.name, creates, assumptions, gaps, items, itemsAs: items.length ? itemsAs : null, bookingsReady: ctx.bookingsReady, qr: !!answers.qr, suggestSpace };
}