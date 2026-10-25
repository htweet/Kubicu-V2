import { blockDefinitions } from '../data/blockRegistry';
import type { Block, BlockOf, BlockType, PageDocument } from '../types/page';
import { uid } from './id';
import { formatNgn } from './format';
import { parseEmbed } from './embeds';

export function createBlock<K extends BlockType>(type: K): BlockOf<K> {
  const def = blockDefinitions[type];
  const now = new Date().toISOString();
  const block = {
    id: uid('blk'),
    type,
    schemaVersion: 1,
    content: def.defaults(),
    style: { align: def.defaultAlign, emphasis: 'default' },
    layout: { spacing: 'normal' },
    behaviour: { trackClicks: true, openInNewTab: true },
    visibility: { hidden: false },
    accessibility: { label: '' },
    createdAt: now,
    updatedAt: now
  };
  return block as unknown as BlockOf<K>;
}

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneBlock(block: Block): Block {
  const copy = deepCopy(block);
  copy.id = uid('blk');
  const now = new Date().toISOString();
  copy.createdAt = now;
  copy.updatedAt = now;
  copy.locked = false;
  if (copy.type === 'faq') {
    copy.content.items = copy.content.items.map((item) => ({ ...item, id: uid('faq') }));
  }
  if (copy.type === 'social') {
    copy.content.items = copy.content.items.map((item) => ({ ...item, id: uid('soc') }));
  }
  if (copy.type === 'gallery') copy.content.images = copy.content.images.map((i) => ({ ...i, id: uid('img') }));
  if (copy.type === 'productGrid') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('gp') }));
  if (copy.type === 'pricing') copy.content.packages = copy.content.packages.map((p) => ({ ...p, id: uid('pk') }));
  if (copy.type === 'event') copy.content.tiers = copy.content.tiers.map((t) => ({ ...t, id: uid('tier') }));
  if (copy.type === 'playlist') copy.content.tracks = copy.content.tracks.map((t) => ({ ...t, id: uid('tr') }));
  if (copy.type === 'portfolio') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('pf') }));
  if (copy.type === 'featureGrid') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('ft') }));
  if (copy.type === 'steps') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('st') }));
  if (copy.type === 'logoStrip') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('lg') }));
  if (copy.type === 'figures') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('fg') }));
  if (copy.type === 'listings') copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('ls') }));
  if (copy.type === 'mediaList') {
    copy.content.items = copy.content.items.map((i) => ({ ...i, id: uid('md') }));
    copy.content.links = copy.content.links.map((l) => ({ ...l, id: uid('pl') }));
  }
  if (copy.type === 'menu')
  copy.content.categories = copy.content.categories.map((cat) => ({
    ...cat,
    id: uid('mc'),
    items: cat.items.map((i) => ({ ...i, id: uid('mi') }))
  }));
  return copy;
}

export function cloneDocument(doc: PageDocument, overrides: Partial<PageDocument> = {}): PageDocument {
  const copy = deepCopy(doc);
  const blocks = copy.blocks.map(cloneBlock);
  // The sticky action bar points at a block (D153): follow it to its new id.
  const barIndex = copy.layout?.actionBar?.blockId ? copy.blocks.findIndex((b) => b.id === copy.layout?.actionBar?.blockId) : -1;
  const layout = copy.layout?.actionBar && barIndex >= 0 ? { ...copy.layout, actionBar: { ...copy.layout.actionBar, blockId: blocks[barIndex].id } } : copy.layout;
  return {
    ...copy,
    layout,
    ...overrides,
    blocks,
    pages: copy.pages?.map((p) => ({ ...p, blocks: p.blocks.map((b) => ({ ...cloneBlock(b), groupId: null })), groups: undefined })),
    updatedAt: new Date().toISOString()
  };
}

export function blockName(block: Block): string {
  return blockDefinitions[block.type].name;
}

export function summarizeBlock(block: Block): string {
  switch (block.type) {
    case 'profile':
      return block.content.name || 'No name yet';
    case 'heading':
      return block.content.text || 'Empty heading';
    case 'text':
      return block.content.body ? block.content.body.slice(0, 48) : 'Empty paragraph';
    case 'link':
      return block.content.label || 'Untitled link';
    case 'social':
      return block.content.items.length ? `${block.content.items.length} profiles` : 'No profiles yet';
    case 'image':
      return block.content.alt || (block.content.url ? 'Image' : 'No image chosen');
    case 'video':
      return block.content.title || (block.content.url ? (() => {const r = parseEmbed(block.content.url);return r.ok ? `${r.name} embed` : 'Link can’t be embedded';})() : 'Nothing embedded yet');
    case 'divider':
      return block.content.label || 'Hairline';
    case 'spacer':
      return { sm: 'Small gap', md: 'Medium gap', lg: 'Large gap' }[block.content.size];
    case 'contact':
      return block.content.phone || block.content.email || 'No details yet';
    case 'faq':
      return `${block.content.items.length} question${block.content.items.length === 1 ? '' : 's'}`;
    case 'leadForm':
      return block.content.title || 'Form';
    case 'product':
      return block.content.name ?
      `${block.content.name}${block.content.priceNgn !== null ? ` · ${formatNgn(block.content.priceNgn)}` : ''}` :
      'No product details';
    case 'booking':
      return block.content.title || 'Booking';
    case 'whatsapp':
      return block.content.label || 'WhatsApp';
    case 'newsletter':
      return block.content.title || 'Newsletter';
    case 'gallery':
      return block.content.images.length ? `${block.content.images.length} photos` : 'No photos yet';
    case 'productGrid':
      return `${block.content.items.filter((i) => i.name).length} products`;
    case 'menu':
      return `${block.content.categories.reduce((n, c) => n + c.items.length, 0)} items`;
    case 'pricing':
      return `${block.content.packages.length} packages`;
    case 'testimonial':
      return block.content.name ? `${block.content.name}${block.content.permission ? '' : ' · needs permission'}` : 'No quote yet';
    case 'event':
      return block.content.title || 'Event';
    case 'countdown':
      return block.content.target ? block.content.title || 'Countdown' : 'No date set';
    case 'download':
      return block.content.title || 'No file yet';
    case 'portfolio':
      return `${block.content.items.filter((i) => i.title).length} projects`;
    case 'location':
      return block.content.name || block.content.address || 'No address yet';
    case 'subscription':
      return `${block.content.planIds.length} plan${block.content.planIds.length === 1 ? '' : 's'}`;
    case 'form':
      return block.content.formId ? 'Form' : 'No form chosen';
    case 'proof':
      return block.content.title || { both: 'Reviews and work', reviews: 'Verified reviews', work: 'Delivered work' }[block.content.show];
    case 'membersOnly':
      return `${block.content.covers === 0 ? 'Hides everything below' : `Hides the next ${block.content.covers}`} · ${block.content.access === 'any' ? 'any subscriber' : `${block.content.planIds.length} plan${block.content.planIds.length === 1 ? '' : 's'}`}`;
    case 'trustBadge':
      return block.content.style === 'compact' ? 'Compact badge' : 'Full badge';
    case 'audio':
      return block.content.title || (block.content.url ? 'Audio track' : 'No track yet');
    case 'playlist':{
        const n = block.content.tracks.filter((t) => t.url).length;
        return `${block.content.title ? `${block.content.title} · ` : ''}${n} track${n === 1 ? '' : 's'}`;
      }
    case 'collection':
      return block.content.collectionId ? block.content.title || 'Collection' : 'No collection chosen';
    case 'support':
      return block.content.amounts.length ? block.content.amounts.map((a) => formatNgn(a)).join(' · ') : 'Any amount';
    case 'hero':
      return block.content.title || 'Empty headline';
    case 'featureGrid':
    case 'steps':
    case 'mediaList':
    case 'listings':
      return `${block.content.title ? `${block.content.title} · ` : ''}${block.content.items.length} item${block.content.items.length === 1 ? '' : 's'}`;
    case 'logoStrip':
      return block.content.items.map((i) => i.name).filter(Boolean).join(', ') || 'No names yet';
    case 'figures':
      return block.content.items.map((i) => i.value).filter(Boolean).join(' · ') || 'No figures yet';
    default:
      return '';
  }
}

export function docSignature(doc: PageDocument | null): string {
  if (!doc) return '';
  // Locks and groups are editor-only organisation; visitors never see them.
  // Co-brand ownership (D121) is editor-only too; the partner strip visitors see is compared below.
  const visible = (blocks: Block[]) => blocks.map(({ createdAt: _c, updatedAt: _u, locked: _l, groupId: _g, owner: _o, ...rest }) => rest);
  return JSON.stringify({
    title: doc.title,
    handle: doc.handle,
    seo: doc.seo,
    theme: doc.theme,
    branding: doc.branding ?? null,
    blocks: visible(doc.blocks),
    homeLabel: doc.homeLabel ?? null,
    pages: (doc.pages ?? []).map((p) => ({ id: p.id, title: p.title, path: p.path, seo: p.seo, hideFromNav: !!p.hideFromNav, membersOnly: p.membersOnly ?? null, blocks: visible(p.blocks) })),
    redirects: doc.redirects ?? [],
    coBrand: doc.coBrand ? { p: doc.coBrand.partnershipId, n: doc.coBrand.partnerName, l: doc.coBrand.leadName } : null
  });
}