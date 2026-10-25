import type { Block, BlockType } from '../types/page';

export interface BlockSuggestion {
  id: string;
  type: BlockType;
  /** Plain reason shown with the suggestion — every suggestion is a simple rule, never AI (D166). */
  reason: string;
}

interface Context {
  bookingsActive: boolean;
}

const has = (blocks: Block[], ...types: BlockType[]) => blocks.some((b) => types.includes(b.type));

/** Up to `max` rule-based next-block suggestions for the current page, skipping dismissed ones. */
export function suggestBlocks(blocks: Block[], ctx: Context, dismissed: string[], max = 3): BlockSuggestion[] {
  const rules: (BlockSuggestion & {when: boolean;})[] = [
  { id: 'start-profile', type: 'profile', reason: 'Most pages start by saying who you are.', when: blocks.length === 0 },
  {
    id: 'reach-you',
    type: 'contact',
    reason: 'Your page introduces you but has no way to reach you.',
    when: has(blocks, 'profile', 'hero') && !has(blocks, 'contact', 'whatsapp', 'leadForm', 'form', 'booking')
  },
  { id: 'bookings-installed', type: 'booking', reason: 'Bookings is installed but not on this page.', when: ctx.bookingsActive && !has(blocks, 'booking') },
  {
    id: 'pricing-next-step',
    type: 'link',
    reason: 'Pricing reads best with a clear next step after it.',
    when: has(blocks, 'pricing') && !blocks.some((b) => (b.type === 'link' || b.type === 'whatsapp') && b.style.emphasis === 'featured')
  },
  { id: 'media-signup', type: 'newsletter', reason: 'Pages with videos or episodes grow faster with a sign-up.', when: has(blocks, 'video', 'audio', 'mediaList', 'playlist') && !has(blocks, 'newsletter') },
  { id: 'work-proof', type: 'testimonial', reason: 'Your work is on show — a client quote backs it up.', when: has(blocks, 'gallery', 'portfolio') && !has(blocks, 'testimonial', 'proof') },
  { id: 'long-page-faq', type: 'faq', reason: 'Long pages answer common questions before visitors ask.', when: blocks.length >= 8 && !has(blocks, 'faq') },
  // Canvas ecosystem rules (D172) — each one a visible, simple condition.
  { id: 'pricing-compare', type: 'cta', reason: 'Pricing reads best with one clear ask after it.', when: has(blocks, 'pricing', 'comparison') && !has(blocks, 'cta', 'checkoutButton', 'booking') },
  { id: 'products-categories', type: 'shopCategories', reason: 'You show products but no way to browse by category.', when: has(blocks, 'productGrid', 'collection') && !has(blocks, 'shopCategories') },
  { id: 'event-agenda', type: 'agenda', reason: 'Your event has no running order yet.', when: has(blocks, 'event') && !has(blocks, 'agenda') },
  { id: 'place-hours', type: 'hours', reason: 'You have an address — visitors will want your hours.', when: has(blocks, 'location') && !has(blocks, 'hours') && !blocks.some((b) => b.type === 'location' && b.content.hours.length > 0) },
  { id: 'long-page-jump', type: 'anchorNav', reason: 'A long page is easier to use with jump links near the top.', when: blocks.filter((b) => !b.parentId).length >= 10 && !has(blocks, 'anchorNav') },
  { id: 'long-page-top', type: 'backToTop', reason: 'Long pages benefit from a way back to the top at the end.', when: blocks.filter((b) => !b.parentId).length >= 12 && !has(blocks, 'backToTop') }];

  return rules.filter((r) => r.when && !dismissed.includes(r.id)).slice(0, max).map(({ id, type, reason }) => ({ id, type, reason }));
}