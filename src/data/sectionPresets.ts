import type { Block, BlockType } from '../types/page';
import { createBlock } from '../utils/blocks';
import { uid } from '../utils/id';

/** Same marker as AI drafts (utils/ai/draft PLACEHOLDER): publishing is blocked until replaced. */
const placeholder = (what: string) => `[Add ${what}]`;

/*
 * Ready-made sections (D172): 24 combinations of real blocks, inserted as editable blocks (often inside a
 * Section, Columns or Tabs). Owner-specific facts are "[Add …]" placeholders, which block publishing until
 * replaced — so a preset can never go live claiming something untrue. Compositions vary on purpose.
 */

export type SectionGroup = 'Creators & media' | 'Professionals' | 'Shops & offers' | 'Services & events';

export interface SectionPreset {
  id: string;
  name: string;
  group: SectionGroup;
  description: string;
  /** Plain-words shape, e.g. "Hero · Portfolio grid". */
  shape: string;
  build: (ctx: { name: string }) => Block[];
}

export const sectionGroups: SectionGroup[] = ['Creators & media', 'Professionals', 'Shops & offers', 'Services & events'];

function mk(type: BlockType, content: Record<string, unknown> = {}, extra: Partial<Pick<Block, 'layout' | 'style' | 'slotLabel'>> = {}): Block {
  const b = createBlock(type);
  return { ...b, content: { ...b.content, ...content }, layout: { ...b.layout, ...extra.layout }, style: { ...b.style, ...extra.style }, slotLabel: extra.slotLabel } as Block;
}

/** A container followed by its blocks, linked by parentId. */
function inside(container: Block, ...kids: Block[]): Block[] {
  return [container, ...kids.map((k) => ({ ...k, parentId: container.id }) as Block)];
}

const P = placeholder;

export const sectionPresets: SectionPreset[] = [
  // Creators & media
  {
    id: 'intro-socials',
    name: 'Creator intro + socials',
    group: 'Creators & media',
    description: 'Your photo, name and one line, with your social profiles underneath.',
    shape: 'Profile · Social row',
    build: ({ name }) => [mk('profile', { name: name || P('your name'), tagline: P('one line about what you make') }), mk('social')],
  },
  {
    id: 'hero-video',
    name: 'Hero + featured video',
    group: 'Creators & media',
    description: 'A full-width cover with your headline, then your main video, wide.',
    shape: 'Cover hero · Wide video',
    build: () => [mk('hero', { variant: 'cover', title: P('your headline'), subtitle: '', primaryLabel: 'Watch now' }, { layout: { width: 'full' } }), mk('video', {}, { layout: { width: 'wide' } })],
  },
  {
    id: 'podcast-episodes',
    name: 'Podcast + recent episodes',
    group: 'Creators & media',
    description: 'The latest episode beside a list of earlier ones.',
    shape: 'Columns: Audio | Episode list',
    build: () => inside(mk('columns', { ratio: 'narrow-first' }, { layout: { width: 'wide' } }), mk('audio', { title: P('latest episode title') }), mk('mediaList', { kind: 'episodes', title: 'Earlier episodes' })),
  },
  {
    id: 'artist-release',
    name: 'Artist + featured release',
    group: 'Creators & media',
    description: 'A poster-style opening for your new release, then the tracklist with listening links.',
    shape: 'Poster hero · Tracklist',
    build: () => [mk('hero', { variant: 'poster', title: P('release title'), meta: P('release date'), primaryLabel: 'Listen now' }), mk('mediaList', { kind: 'tracks', title: 'Tracklist' })],
  },
  {
    id: 'newsletter-posts',
    name: 'Newsletter + selected posts',
    group: 'Creators & media',
    description: 'Why subscribe on one side, a few of your best posts on the other.',
    shape: 'Columns: Newsletter | Link collection',
    build: () =>
      inside(
        mk('columns', { ratio: 'equal' }, { layout: { width: 'wide', background: 'tint' } }),
        mk('newsletter', { title: 'Get the next one in your inbox', description: P('what subscribers get and how often') }),
        mk('linkCollection', { title: 'Start with these', layout: 'list', groups: [{ id: uid('lgp'), name: '', links: [{ id: uid('cl'), label: P('a post title'), url: '', description: '' }] }] }),
      ),
  },
  {
    id: 'community-join',
    name: 'Community + join',
    group: 'Creators & media',
    description: 'An inverted band that says who the group is for, with one join button.',
    shape: 'Inverted section: Text · Community join',
    build: () => inside(mk('section', { heading: P('your community name'), intro: '', align: 'center' }, { layout: { background: 'invert', width: 'wide' } }), mk('community', { description: P('who it’s for and what happens there') })),
  },
  // Professionals
  {
    id: 'freelancer-portfolio',
    name: 'Freelancer hero + portfolio',
    group: 'Professionals',
    description: 'What you do in one sentence, then your selected work.',
    shape: 'Split hero · Portfolio grid',
    build: () => [mk('hero', { variant: 'split', eyebrow: '', title: P('what you do, for whom'), primaryLabel: 'See my work', secondaryLabel: 'Get in touch' }), mk('portfolio', { title: 'Selected work' })],
  },
  {
    id: 'designer-tabs',
    name: 'Designer profile + case studies',
    group: 'Professionals',
    description: 'Projects and experience in two tabs — an accordion on phones.',
    shape: 'Tabs: Projects | Experience',
    build: () => inside(mk('tabs', { style: 'underline', phoneStyle: 'accordion' }), mk('portfolio', { title: '' }, { slotLabel: 'Projects' }), mk('credentials', { title: '', variant: 'resume' }, { slotLabel: 'Experience' })),
  },
  {
    id: 'business-services',
    name: 'Business hero + services + contact',
    group: 'Professionals',
    description: 'A clear opening, three services, and a closing call to action.',
    shape: 'Split hero · Services grid · CTA band',
    build: () => [
      mk('hero', { variant: 'split', title: P('what your business does'), primaryLabel: 'Our services' }),
      mk('featureGrid', { title: 'Services', columns: 3, items: [1, 2, 3].map(() => ({ id: uid('ft'), title: P('a service'), text: '', imageUrl: '', imageAlt: '', label: '', url: '' })) }),
      mk('cta', { title: 'Ready to start?', primaryLabel: 'Get in touch', layout: 'band' }),
    ],
  },
  {
    id: 'trust-credentials',
    name: 'Trust: credentials + testimonial',
    group: 'Professionals',
    description: 'Qualifications beside a quote from a real client.',
    shape: 'Columns: Credentials | Testimonial',
    build: () => inside(mk('columns', { ratio: 'wide-first', valign: 'center' }, { layout: { width: 'wide' } }), mk('credentials', { title: 'Qualifications' }), mk('testimonial', { quote: P('a real client’s words, with their permission') })),
  },
  {
    id: 'case-study-contact',
    name: 'Case study + contact',
    group: 'Professionals',
    description: 'One project told properly, ending in an invitation to talk.',
    shape: 'Split hero (case study) · Split CTA',
    build: () => [mk('hero', { variant: 'split', eyebrow: 'Case study', title: P('project name'), subtitle: P('the problem, what you did, what changed') }), mk('cta', { title: 'Have a similar project?', primaryLabel: 'Tell me about it', layout: 'split' })],
  },
  {
    id: 'faq-contact',
    name: 'FAQ + contact',
    group: 'Professionals',
    description: 'Common questions, with ways to reach you right beside them.',
    shape: 'Columns 3 : 2: FAQ | Contact buttons',
    build: () => inside(mk('columns', { ratio: 'wide-first' }, { layout: { width: 'wide' } }), mk('faq'), mk('contactActions', { title: 'Still have a question?', layout: 'stack' })),
  },
  // Shops & offers
  {
    id: 'product-spotlight',
    name: 'Product spotlight + benefits',
    group: 'Shops & offers',
    description: 'One product on a soft stage, then why it’s worth it.',
    shape: 'Product hero · Benefits grid',
    build: () => [mk('hero', { variant: 'product', title: P('product name'), meta: P('price'), primaryLabel: 'Buy now' }), mk('featureGrid', { title: 'Why you’ll love it', columns: 3 })],
  },
  {
    id: 'collection-shop',
    name: 'Shop categories + products',
    group: 'Shops & offers',
    description: 'Category shortcuts above a grid of products.',
    shape: 'Shop categories (chips) · Product grid',
    build: () => [mk('shopCategories', { title: '', layout: 'chips' }), mk('productGrid')],
  },
  {
    id: 'digital-offer',
    name: 'Digital product + how you get it',
    group: 'Shops & offers',
    description: 'The download beside clear delivery and refund details in your words.',
    shape: 'Columns: Download | Policies',
    build: () =>
      inside(
        mk('columns', { ratio: 'equal' }, { layout: { width: 'wide' } }),
        mk('download', { title: P('product name'), access: 'paid' }),
        mk('policies', { title: 'How you get it', items: [{ id: uid('pol'), title: 'Access', text: P('how and when buyers get the file') }, { id: uid('pol'), title: 'Refunds', text: P('your refund policy') }] }),
      ),
  },
  {
    id: 'restaurant-menu',
    name: 'Menu + order on WhatsApp',
    group: 'Shops & offers',
    description: 'Your menu, then one clear way to order.',
    shape: 'Menu · WhatsApp',
    build: () => [mk('menu'), mk('whatsapp', { label: 'Order on WhatsApp' }, { style: { emphasis: 'featured' } })],
  },
  {
    id: 'lead-magnet',
    name: 'Lead magnet + sign-up',
    group: 'Shops & offers',
    description: 'What the free guide covers, beside a short form that says why you ask.',
    shape: 'Tinted columns 2 : 3: Text | Lead form',
    build: () =>
      inside(
        mk('columns', { ratio: 'narrow-first', valign: 'center' }, { layout: { width: 'wide', background: 'tint' } }),
        mk('text', { variant: 'editorial', body: `${P('the guide’s title')}\n${P('what’s inside, in two lines')}` }),
        mk('leadForm', { title: 'Get it free', submitLabel: 'Send it to me' }),
      ),
  },
  {
    id: 'campaign-offer',
    name: 'Campaign announcement + offer',
    group: 'Shops & offers',
    description: 'A top bar for the news, and a spotlight that shows only during the campaign.',
    shape: 'Announcement bar · Campaign spotlight',
    build: () => [mk('announcement', { text: P('the offer in one line'), tone: 'invert' }), mk('campaignSpotlight', { title: P('campaign name') })],
  },
  // Services & events
  {
    id: 'service-booking',
    name: 'Service menu + booking',
    group: 'Services & events',
    description: 'What you offer with prices, then the way to book.',
    shape: 'Pricing · Booking',
    build: () => [mk('pricing', { title: 'Services' }), mk('booking')],
  },
  {
    id: 'appointment-enquiry',
    name: 'Appointment + enquiry',
    group: 'Services & events',
    description: 'Book a time on one side, or send a question on the other.',
    shape: 'Columns: Booking | Lead form',
    build: () => inside(mk('columns', { ratio: 'equal' }, { layout: { width: 'wide' } }), mk('booking'), mk('leadForm', { title: 'Not sure yet? Ask first', submitLabel: 'Send question' })),
  },
  {
    id: 'photographer-booking',
    name: 'Photographer gallery + booking',
    group: 'Services & events',
    description: 'A masonry gallery of your work, closing with a booking call to action.',
    shape: 'Masonry gallery (wide) · CTA band',
    build: () => [mk('gallery', { title: '', layout: 'masonry' }, { layout: { width: 'wide' } }), mk('cta', { title: 'Book a shoot', primaryLabel: 'Check availability', layout: 'band' })],
  },
  {
    id: 'event-register',
    name: 'Event hero + registration',
    group: 'Services & events',
    description: 'A poster-style opening with date and venue, then tickets or sign-up.',
    shape: 'Poster hero · Event',
    build: () => [mk('hero', { variant: 'poster', title: P('event name'), meta: P('date and venue'), primaryLabel: 'Get tickets' }), mk('event')],
  },
  {
    id: 'schedule-speakers',
    name: 'Schedule + speakers',
    group: 'Services & events',
    description: 'The running order and who’s on, in two tabs.',
    shape: 'Tabs: Schedule | Speakers',
    build: () => inside(mk('tabs', { style: 'pills', phoneStyle: 'accordion' }), mk('agenda', { title: '' }, { slotLabel: 'Schedule' }), mk('team', { title: '', variant: 'speakers' }, { slotLabel: 'Speakers' })),
  },
  {
    id: 'location-hours',
    name: 'Location + hours',
    group: 'Services & events',
    description: 'Address and directions beside your opening hours.',
    shape: 'Columns: Location | Business hours',
    build: () => inside(mk('columns', { ratio: 'equal' }, { layout: { width: 'wide' } }), mk('location', { address: P('your address') }), mk('hours')),
  },
];
