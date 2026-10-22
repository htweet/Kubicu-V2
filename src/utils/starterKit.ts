import type { Block, PageDocument } from '../types/page';
import { cloneDocument, blockName } from './blocks';
import { validateBlock } from './validation';

/** Fields holding contact details or links that belong to the fictional example business. */
const CLEAR_TO_EMPTY = new Set(['url', 'ticketUrl', 'phone', 'whatsappPhone', 'email', 'address']);

export interface StarterIdentity {
  name?: string;
  tagline?: string;
  avatarUrl?: string;
  location?: string;
  /** If provided, every WhatsApp/phone field is filled with this number. */
  whatsapp?: string;
}

export interface HiddenStarterBlock {
  id: string;
  name: string;
  reason: string;
}

export interface PreparedStarter {
  doc: PageDocument;
  /** Blocks kept on the page but hidden until the owner adds the missing details. */
  hidden: HiddenStarterBlock[];
}

function scrub(value: unknown, keepUrl: boolean, phone: string): unknown {
  if (Array.isArray(value)) return value.map((v) => scrub(v, keepUrl, phone));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, v]) => {
    if (key === 'priceNgn' || key === 'startsAt' || key === 'endsAt' || key === 'target') out[key] = null;else
    if (key === 'permission') out[key] = false;else
    if ((key === 'phone' || key === 'whatsappPhone') && phone) out[key] = phone;else
    if (key === 'url' && keepUrl) out[key] = v;else
    if (CLEAR_TO_EMPTY.has(key) && typeof v === 'string') out[key] = '';else
    out[key] = scrub(v, keepUrl, phone);
  });
  return out;
}

function scrubBlock(block: Block, phone: string): Block {
  // Image and gallery `url` fields are the photos themselves, not the example's links.
  if (block.type === 'image') return { ...block, content: { ...block.content } } as Block;
  if (block.type === 'gallery') return block;
  if (block.type === 'testimonial') {
    // Never carry someone else's words onto a new page.
    return { ...block, content: { quote: '', name: '', role: '', source: '', avatarUrl: '', avatarAlt: '', permission: false } };
  }
  if (block.type === 'social') return { ...block, content: { items: block.content.items.map((i) => ({ ...i, url: '' })) } };
  return { ...block, content: scrub(block.content, false, phone) } as Block;
}

/**
 * Turns an example page into a starter: prices, links, contact details and testimonials from
 * the fictional business are removed so they can never be published as the owner's own.
 * Blocks that then need details are hidden (not deleted) so the page can still publish.
 */
export function prepareStarter(example: PageDocument, identity: StarterIdentity = {}): PreparedStarter {
  const phone = identity.whatsapp?.trim() ?? '';
  const base = cloneDocument(example);
  const hidden: HiddenStarterBlock[] = [];

  const blocks = base.blocks.map((raw) => {
    let block = scrubBlock(raw, phone);
    if (block.type === 'profile') {
      block = {
        ...block,
        content: {
          ...block.content,
          name: identity.name?.trim() || 'Your name',
          tagline: identity.tagline?.trim() ?? '',
          avatarUrl: identity.avatarUrl ?? '',
          avatarAlt: identity.avatarUrl ? `${identity.name?.trim() || 'Profile'} photo` : '',
          location: identity.location?.trim() ?? ''
        }
      };
    }
    const errors = validateBlock(block).filter((i) => i.severity === 'error');
    if (errors.length > 0 && block.type !== 'profile') {
      hidden.push({ id: block.id, name: blockName(block), reason: errors[0].message });
      block = { ...block, visibility: { ...block.visibility, hidden: true } };
    }
    return block;
  });

  return {
    doc: {
      ...base,
      blocks,
      groups: [],
      title: identity.name?.trim() || base.title,
      seo: { title: identity.name?.trim() || base.title, description: identity.tagline?.trim() ?? '' }
    },
    hidden
  };
}