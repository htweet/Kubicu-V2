import type { Block, BlockType } from '../types/page';
import { blockName } from './blocks';

/*
 * Page composition assistant (D174). Rule-based only: every finding is a condition the code can actually
 * evaluate on the page's blocks — no AI, no guessing. Findings are suggestions; nothing changes unless the
 * user presses the offered action, and every action is undoable.
 */

export type CompositionFix =
{kind: 'add';type: BlockType;label: string;} |
{kind: 'select';blockId: string;label: string;} |
{kind: 'tighten';blockId: string;label: string;};

export interface CompositionFinding {
  id: string;
  /** English with `{n}` / `{block}` placeholders filled from `vars`, so the Check tab can translate it (D311). */
  title: string;
  vars?: Record<string, string | number>;
  why: string;
  blockId?: string;
  fix?: CompositionFix;
}

const actionTypes = new Set<BlockType>(['cta', 'checkoutButton', 'booking', 'leadForm', 'form', 'newsletter', 'smartButton', 'event', 'product', 'productGrid', 'subscription', 'support', 'whatsapp', 'contactActions']);
const openingTypes = new Set<BlockType>(['profile', 'hero', 'brandHeader', 'heading', 'announcement']);
const endingTypes = new Set<BlockType>(['contact', 'contactActions', 'cta', 'leadForm', 'form', 'whatsapp', 'newsletter', 'location', 'hours', 'social', 'backToTop', 'share', 'community', 'booking']);
/** Big showcase blocks that look samey when repeated back to back. */
const repeatLimit: Partial<Record<BlockType, number>> = { hero: 2, cta: 2, featureGrid: 3, gallery: 2, portfolio: 2, pricing: 2, faq: 2, comparison: 2, steps: 2, figures: 2, carousel: 2 };

const featured = (b: Block) => (b.type === 'link' || b.type === 'whatsapp') && b.style.emphasis === 'featured';

export function compositionFindings(all: Block[]): CompositionFinding[] {
  const blocks = all.filter((b) => !b.visibility.hidden);
  const top = blocks.filter((b) => !b.parentId);
  const out: CompositionFinding[] = [];
  if (top.length === 0) return out;

  // 1. A clear main action
  const hasAction = blocks.some((b) => actionTypes.has(b.type) || featured(b));
  if (!hasAction && top.length >= 3)
  out.push({ id: 'no-action', title: 'No clear main action', why: 'Visitors can read your page but there’s no obvious next step — buy, book, sign up or get in touch.', fix: { kind: 'add', type: 'cta', label: 'Add a call to action' } });

  // 2. Too many competing actions
  const loud = blocks.filter((b) => featured(b) || b.type === 'cta' || b.type === 'smartButton');
  if (loud.length > 3)
  out.push({ id: 'competing', title: 'Blocks competing for attention: {n}', vars: { n: loud.length }, why: 'Featured links and calls to action are strongest when there are one or two. Set the rest to Standard so the main one stands out.', blockId: loud[loud.length - 1].id, fix: { kind: 'select', blockId: loud[loud.length - 1].id, label: 'Review the last one' } });

  // 3. Repeated structure
  for (let i = 0; i < top.length; i++) {
    const t = top[i].type;
    const limit = repeatLimit[t];
    if (!limit) continue;
    let j = i;
    while (j + 1 < top.length && top[j + 1].type === t) j++;
    const run = j - i + 1;
    if (run >= limit) {
      out.push({ id: `repeat:${top[i].id}`, title: '{block} blocks in a row: {n}', vars: { block: blockName(top[i]), n: run }, why: 'Back-to-back sections with the same shape read as one long block. Merge them, or put something different between them.', blockId: top[j].id, fix: { kind: 'select', blockId: top[j].id, label: 'Select the last one' } });
      i = j;
    }
  }

  // 4. Background rhythm: matching bands that touch are now joined into one section on purpose (D216), so no finding.

  // 5. Opening
  if (!openingTypes.has(top[0].type) && top.length >= 3)
  out.push({ id: 'opening', title: 'The page doesn’t start with who you are', why: 'Visitors decide in seconds. A profile, hero or brand header first tells them whose page this is.', fix: { kind: 'add', type: 'hero', label: 'Add a hero (then move it to the top)' } });

  // 6. Ending
  if (top.length >= 8 && !endingTypes.has(top[top.length - 1].type))
  out.push({ id: 'ending', title: 'Long page with no clear ending', why: 'After scrolling this far, visitors look for a way to get in touch or act. End with contact details, a form or a call to action.', fix: { kind: 'add', type: 'contactActions', label: 'Add contact buttons' } });

  // 7. Heading set apart from its text
  for (let i = 0; i < top.length - 1; i++) {
    const h = top[i];
    if (h.type === 'heading' && h.layout.spacing === 'loose' && top[i + 1].type === 'text')
    out.push({ id: `bind:${h.id}`, title: 'Heading floats away from its text', why: 'A heading reads as part of the paragraph below when the space between them is small. Roomy spacing makes them look unrelated.', blockId: h.id, fix: { kind: 'tighten', blockId: h.id, label: 'Use tight spacing' } });
  }

  // Copy and hierarchy (D342) — still rule-based: word counts, capitals and known vague labels.
  // 8. One opening
  const openings = top.filter((b) => b.type === 'hero' || b.type === 'brandHeader' || b.type === 'profile');
  if (openings.length > 1)
  out.push({ id: 'openings', title: 'Openings competing: {n}', vars: { n: openings.length }, why: 'A page reads best with one opening. Extra heroes, profiles or brand headers make visitors wonder where the page starts.', blockId: openings[1].id, fix: { kind: 'select', blockId: openings[1].id, label: 'Review the second one' } });

  // 9. Headings on long pages
  if (top.length >= 8 && !top.some((b) => b.type === 'heading' || b.type === 'section' || b.type === 'hero' || b.type === 'cta'))
  out.push({ id: 'no-headings', title: 'Long page without headings', why: 'Headings let visitors jump to what they need. Add one above each group of blocks.', fix: { kind: 'add', type: 'heading', label: 'Add a heading' } });

  blocks.forEach((b) => {
    // 10. Headlines: length and capitals
    const headline = b.type === 'heading' ? b.content.text : b.type === 'hero' || b.type === 'cta' ? b.content.title : '';
    if (headline.trim()) {
      const n = wordCount(headline);
      if (n > 12) out.push({ id: `long-head:${b.id}`, title: 'Long headline: {n} words', vars: { n }, why: 'Headlines over 12 words get skimmed. Keep the main promise and move the rest into the text below.', blockId: b.id, fix: { kind: 'select', blockId: b.id, label: 'Select the headline' } });
      if (isShouting(headline)) out.push({ id: `caps:${b.id}`, title: 'Headline in capitals', why: 'All-capital text is slower to read, and some screen readers spell it out letter by letter. Type it normally — the theme sets the style.', blockId: b.id, fix: { kind: 'select', blockId: b.id, label: 'Select the headline' } });
    }
    // 11. Walls of text
    if (b.type === 'text') {
      const longest = Math.max(0, ...b.content.body.split(/\n\s*\n/).map(wordCount));
      if (longest > 120) out.push({ id: `wall:${b.id}`, title: 'Long paragraph: {n} words', vars: { n: longest }, why: 'Big blocks of text are hard to read on a phone. Break it into shorter paragraphs with a blank line between them.', blockId: b.id, fix: { kind: 'select', blockId: b.id, label: 'Select the text' } });
    }
    // 12. Vague button words
    const labels = b.type === 'link' || b.type === 'whatsapp' ? [b.content.label] : b.type === 'cta' || b.type === 'hero' ? [b.content.primaryLabel] : [];
    const vague = labels.find((l) => vagueLabels.has(l.trim().toLowerCase().replace(/[.!…]+$/, '')));
    if (vague) out.push({ id: `vague:${b.id}`, title: 'Button says “{label}” — say what happens', vars: { label: vague.trim() }, why: 'People scan buttons. “Book a fitting” or “See the menu” tells them what they get; “Click here” doesn’t.', blockId: b.id, fix: { kind: 'select', blockId: b.id, label: 'Select the button' } });
  });

  return out;
}

const vagueLabels = new Set(['click here', 'click', 'here', 'learn more', 'read more', 'more', 'submit', 'go', 'link', 'tap here', 'click me', 'button', 'continue']);
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
/** Shouting: at least 12 letters, all capitals (acronyms in normal text don't trigger it). */
const isShouting = (s: string) => {
  const letters = s.replace(/[^A-Za-z]/g, '');
  return letters.length >= 12 && letters === letters.toUpperCase();
};

/** What usually comes next after a block — simple, visible rules (D174), offered in the block's settings. */
export const nextFor: Partial<Record<BlockType, BlockType[]>> = {
  profile: ['social', 'cta', 'contactActions'],
  hero: ['featureGrid', 'cta', 'social'],
  brandHeader: ['featureGrid', 'productGrid', 'contactActions'],
  portfolio: ['testimonial', 'cta', 'credentials'],
  gallery: ['cta', 'testimonial', 'booking'],
  featureGrid: ['cta', 'pricing', 'testimonial'],
  pricing: ['cta', 'faq', 'comparison'],
  comparison: ['cta', 'faq'],
  product: ['delivery', 'reviewSummary', 'checkoutButton'],
  productGrid: ['shopCategories', 'delivery', 'faq'],
  shopCategories: ['productGrid', 'delivery'],
  delivery: ['faq', 'contactActions'],
  event: ['agenda', 'countdown', 'team'],
  newsletter: ['recommendations', 'community'],
  video: ['newsletter', 'community', 'mediaList'],
  audio: ['mediaList', 'newsletter'],
  mediaList: ['newsletter', 'community'],
  menu: ['hours', 'location', 'whatsapp'],
  location: ['hours', 'contactActions'],
  booking: ['pricing', 'faq', 'hours'],
  team: ['cta', 'credentials'],
  faq: ['contactActions', 'cta'],
  testimonial: ['reviewSummary', 'cta'],
  timeline: ['team', 'cta'],
  steps: ['cta', 'booking'],
  leadForm: ['faq', 'policies']
};