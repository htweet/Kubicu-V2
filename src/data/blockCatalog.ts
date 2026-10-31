import type { BlockLayout, BlockStyle, BlockType } from '../types/page';
import type { LibraryCategoryId } from './blockTaxonomy';
import { uid } from '../utils/id';

/*
 * The full block catalogue (D171): all 120 ideas from the Canvas brief, numbered as in the brief.
 * Each idea is either its own block, a ready-made look of a block (same block, different starting
 * settings — so nothing is duplicated), a how-to for an existing feature, or planned.
 */

export interface BlockPreset {
  content?: Record<string, unknown>;
  style?: Partial<BlockStyle>;
  layout?: Partial<BlockLayout>;
}

export interface CatalogEntry {
  n: number;
  name: string;
  category: LibraryCategoryId;
  kind: 'block' | 'look' | 'howto' | 'planned';
  /** The block it inserts (blocks and looks). */
  type?: BlockType;
  /** Starting settings for a look. A function so item ids are fresh each time. */
  preset?: () => BlockPreset;
  note?: string;
}

const B = (n: number, name: string, category: LibraryCategoryId, type: BlockType, note?: string): CatalogEntry => ({ n, name, category, kind: 'block', type, note });
const L = (n: number, name: string, category: LibraryCategoryId, type: BlockType, preset: () => BlockPreset, note?: string): CatalogEntry => ({ n, name, category, kind: 'look', type, preset, note });

export const blockCatalog: CatalogEntry[] = [
// A. Layout & structure
B(1, 'Section container', 'layout', 'section'),
B(2, 'Multi-column layout', 'layout', 'columns'),
L(3, 'Asymmetric split', 'layout', 'columns', () => ({ content: { ratio: 'wide-first' } }), 'Two columns at 3 : 2'),
L(4, 'Responsive grid', 'layout', 'featureGrid', () => ({ content: { title: '', columns: 3 } }), 'Three across, stacks on phones'),
B(5, 'Vertical spacer', 'layout', 'spacer'),
B(6, 'Divider & separator', 'layout', 'divider'),
L(7, 'Background feature section', 'layout', 'section', () => ({ layout: { background: 'tint', width: 'wide' } }), 'A wide section with a tinted band'),
B(8, 'Tabs & content switcher', 'layout', 'tabs'),
L(9, 'Accordion group', 'layout', 'faq', () => ({ content: { title: '' } }), 'Expandable items — instructions, policies, FAQs'),
B(10, 'Content carousel', 'layout', 'carousel'),
B(11, 'Anchor navigation', 'layout', 'anchorNav'),
{ n: 12, name: 'Reusable section', category: 'layout', kind: 'howto', note: 'In Layers, tap Select, pick blocks and Save — they appear under “Your sections”.' },
// B. Profile & identity
B(13, 'Profile identity', 'identity', 'profile'),
B(14, 'Brand header', 'identity', 'brandHeader'),
L(15, 'Editorial hero', 'identity', 'hero', () => ({ content: { variant: 'split' } }), 'Headline, copy, image and two buttons'),
L(16, 'Personal introduction', 'identity', 'text', () => ({ content: { variant: 'editorial', body: 'Hello, I’m …\nA few lines about who you are, what you make and who it’s for.' } }), 'An editorial bio'),
L(17, 'Logo & brand mark', 'identity', 'brandHeader', () => ({ content: { name: '', tagline: '', align: 'center' } }), 'Just your logo, centred'),
B(18, 'Announcement banner', 'identity', 'announcement'),
B(19, 'Featured CTA', 'identity', 'cta'),
// C. Links & navigation
L(20, 'Simple link list', 'links', 'linkCollection', () => ({ content: { layout: 'list' } }), 'A clean list with descriptions'),
L(21, 'Featured link card', 'links', 'link', () => ({ style: { emphasis: 'featured' } }), 'One link in your accent colour'),
L(22, 'Rich link collection', 'links', 'linkCollection', () => ({ content: { layout: 'grid' } }), 'Links as a card grid'),
B(23, 'Social profile row', 'links', 'social'),
L(24, 'Featured social channel', 'links', 'link', () => ({ content: { label: 'Follow me on Instagram', description: 'New work every week' }, style: { emphasis: 'featured' } }), 'One channel, front and centre'),
B(25, 'Contact action buttons', 'links', 'contactActions'),
B(26, 'WhatsApp contact', 'links', 'whatsapp'),
B(27, 'QR & offline connection', 'links', 'qrCode'),
B(28, 'Link collection with categories', 'links', 'linkCollection'),
L(29, 'Smart link preview', 'links', 'link', () => ({ content: { label: 'Read the full story', description: 'Your own title and summary of the page you link to' } }), 'Previews use the words you write — linked pages aren’t fetched'),
// D. Text & storytelling
B(30, 'Rich text', 'text', 'text'),
B(31, 'Pull quote', 'text', 'quote'),
B(32, 'Story timeline', 'text', 'timeline'),
B(33, 'Process steps', 'text', 'steps'),
L(34, 'Key benefits', 'text', 'featureGrid', () => ({ content: { title: 'Why people choose us', columns: 3 } }), 'Three benefits side by side'),
B(35, 'Statistics & highlights', 'text', 'figures', 'Your own numbers, confirmed before publishing'),
B(36, 'FAQ', 'text', 'faq'),
B(37, 'Comparison table', 'text', 'comparison'),
B(38, 'Pricing & packages', 'text', 'pricing'),
B(39, 'Testimonial', 'text', 'testimonial', 'One attributed quote, with your permission confirmed'),
// E. Images & galleries
B(40, 'Single image', 'images', 'image'),
B(41, 'Image gallery', 'images', 'gallery'),
L(42, 'Masonry gallery', 'images', 'gallery', () => ({ content: { layout: 'masonry' } }), 'Natural heights in balanced columns'),
B(43, 'Before & after', 'images', 'beforeAfter'),
L(44, 'Featured image story', 'images', 'hero', () => ({ content: { variant: 'cover', eyebrow: '', title: 'The story behind the work' }, layout: { width: 'wide' } }), 'A big photo with your headline over it'),
B(45, 'Brand & client logos', 'images', 'logoStrip', 'Only names you have permission to show'),
L(46, 'Product image showcase', 'images', 'hero', () => ({ content: { variant: 'product' } }), 'One product on a soft stage'),
// F. Video, audio & media
B(47, 'Video player or embed', 'media', 'video'),
L(48, 'Featured video', 'media', 'video', () => ({ layout: { width: 'wide' } }), 'A wide, principal video'),
B(49, 'Audio player', 'media', 'audio'),
L(50, 'Music release', 'media', 'mediaList', () => ({ content: { kind: 'tracks', title: 'New release' } }), 'Tracklist with listening links'),
L(51, 'Podcast episode', 'media', 'audio', () => ({ content: { title: 'Episode 1 — ', artist: '' } }), 'One episode with artwork and a transcript'),
B(52, 'Playlist / media collection', 'media', 'playlist'),
B(53, 'Downloadable resource', 'media', 'download'),
B(54, 'Document preview', 'media', 'document'),
B(55, 'External media embed', 'media', 'embed'),
// G. Portfolio & professional
B(56, 'Portfolio project grid', 'portfolio', 'portfolio'),
L(57, 'Featured case study', 'portfolio', 'hero', () => ({ content: { variant: 'split', eyebrow: 'Case study', title: 'Project name', subtitle: 'The problem, what you did, and what changed — in your own words.' } }), 'A project told properly'),
L(58, 'Services overview', 'portfolio', 'featureGrid', () => ({ content: { title: 'Services', columns: 3 } }), 'What you offer, each with a link to enquire'),
B(59, 'Team members', 'portfolio', 'team'),
B(60, 'Experience & credentials', 'portfolio', 'credentials'),
L(61, 'Résumé / CV', 'portfolio', 'credentials', () => ({ content: { variant: 'resume', title: 'Experience' } }), 'Roles, years and a CV download'),
B(62, 'Publications & press', 'portfolio', 'press'),
L(63, 'Project process', 'portfolio', 'steps', () => ({ content: { title: 'How a project runs' } }), 'Discovery to delivery'),
L(64, 'Availability & enquiry', 'portfolio', 'leadForm', () => ({ content: { title: 'Work with me', description: 'Tell me what you need and when. I reply within two working days.', submitLabel: 'Send enquiry' } }), 'A short enquiry form'),
B(65, 'Map & location', 'portfolio', 'location', 'Address and directions — no map loads, to save data'),
// H. Products & commerce
B(66, 'Featured product', 'commerce', 'product'),
B(67, 'Product collection', 'commerce', 'productGrid'),
B(68, 'Product category navigation', 'commerce', 'shopCategories'),
L(69, 'Digital product offer', 'commerce', 'download', () => ({ content: { title: 'Your guide', access: 'paid', format: 'PDF' } }), 'An ebook, template or preset with secure delivery'),
L(70, 'Product bundle', 'commerce', 'product', () => ({ content: { badge: 'Bundle', name: 'The starter bundle' } }), 'A grouped offer as one product'),
B(71, 'Purchase / checkout CTA', 'commerce', 'checkoutButton'),
L(72, 'Service pricing', 'commerce', 'pricing', () => ({ content: { title: 'Services & rates' } }), 'Packages with scope and a booking action'),
B(73, 'Order & delivery information', 'commerce', 'delivery', 'Delivery areas and prices from your shop, pickup and returns'),
B(74, 'Food menu / catalogue', 'commerce', 'menu'),
B(75, 'Property or listing showcase', 'commerce', 'listings'),
B(76, 'Donation or support', 'commerce', 'support', 'A payment, never described as tax-deductible'),
// I. Services, bookings & events
B(77, 'Booking CTA', 'services', 'booking'),
L(78, 'Service menu', 'services', 'pricing', () => ({ content: { title: 'Service menu' } }), 'Services with durations and prices'),
L(79, 'Availability preview', 'services', 'booking', () => ({ content: { title: 'See available times' } }), 'Live times come from the Bookings app; otherwise it links to your booking page'),
B(80, 'Event details', 'services', 'event'),
B(81, 'Event schedule', 'services', 'agenda'),
L(82, 'Speakers or performers', 'services', 'team', () => ({ content: { variant: 'speakers', title: 'Speakers' } }), 'Round portraits and sessions'),
L(83, 'RSVP or registration', 'services', 'event', () => ({ content: { ctaLabel: 'RSVP' } }), 'Free sign-up, or tickets from Commerce → Events'),
L(84, 'Ticket or event offer', 'services', 'event', () => ({ content: { ctaLabel: 'Get tickets', source: 'catalog' } }), 'Sells tickets through checkout with seat limits'),
B(85, 'Countdown', 'services', 'countdown'),
// J. Forms, leads & audience
B(86, 'Contact form', 'forms', 'leadForm'),
L(87, 'Lead capture form', 'forms', 'leadForm', () => ({ content: { title: 'Get the free guide', description: 'Leave your details and we’ll send it to you. You can unsubscribe at any time.', submitLabel: 'Send it to me' } }), 'Clear about why you’re asking'),
B(88, 'Newsletter signup', 'forms', 'newsletter'),
L(89, 'Waitlist signup', 'forms', 'newsletter', () => ({ content: { title: 'Join the waitlist', description: 'Be the first to know when it opens.', buttonLabel: 'Notify me' } }), 'For launches and sold-out items'),
L(90, 'Service enquiry form', 'forms', 'leadForm', () => ({ content: { title: 'Tell us about your project', submitLabel: 'Send enquiry' } }), 'Name, contact and your brief'),
B(91, 'Application form', 'forms', 'form', 'Built in the Forms add-on — multi-step, with rules'),
B(92, 'Poll or feedback', 'forms', 'poll'),
B(93, 'Community join', 'forms', 'community'),
L(94, 'Social follow & share', 'forms', 'share', () => ({ content: { title: 'Follow & share' } }), 'Share buttons — pair with your social row'),
L(95, 'Download for lead', 'forms', 'leadForm', () => ({ content: { title: 'Get the free checklist', description: 'Tell us where to send it. Your request goes to Audience and you send the file — nothing is sent automatically yet.', submitLabel: 'Request the checklist' } }), 'Disclosed, never hidden data collection'),
// K. Trust & credibility
L(96, 'Credentials & certifications', 'trust', 'credentials', () => ({ content: { title: 'Certifications' } }), 'Only what you can show if asked'),
B(97, 'Review summary', 'trust', 'reviewSummary'),
B(98, 'Verified identity indicator', 'trust', 'trustBadge', 'Appears only after real verification'),
L(99, 'Client or partner logos', 'trust', 'logoStrip', () => ({ content: { title: 'Trusted by' } }), 'With your permission confirmed'),
B(100, 'Policies & customer assurance', 'trust', 'policies'),
L(101, 'Trust information', 'trust', 'policies', () => ({ content: { title: 'Before you buy', items: [{ id: uid('pol'), title: 'How to reach us', text: '' }, { id: uid('pol'), title: 'When we reply', text: '' }, { id: uid('pol'), title: 'Your privacy', text: '' }] } }), 'Contact routes, response times, privacy'),
// L. Business information & utilities
B(102, 'Business hours', 'utilities', 'hours'),
B(103, 'Contact information', 'utilities', 'contact'),
L(104, 'Location & directions', 'utilities', 'location', () => ({ content: { name: 'Find us' } }), 'Address with a directions button'),
L(105, 'Menu or service catalogue', 'utilities', 'menu', () => ({ content: { title: 'Price list' } }), 'Many options without a full shop'),
L(106, 'Calendar or schedule', 'utilities', 'agenda', () => ({ content: { title: 'This week', date: '' } }), 'Classes, sessions or opening events'),
B(107, 'Language selector', 'utilities', 'languageSwitch'),
B(108, 'Share this page', 'utilities', 'share'),
B(109, 'Back to top', 'utilities', 'backToTop'),
L(110, 'Custom embed', 'utilities', 'embed', () => ({ content: { title: '' } }), 'Supported sites only — no scripts or custom code'),
// M. Smart & AI-powered
L(111, 'AI-assisted content section', 'smart', 'heading', () => ({ content: { text: '' } }), 'Use “Suggest” in the inspector; nothing publishes until you approve it'),
B(112, 'AI FAQ assistant', 'smart', 'faqAssistant'),
L(113, 'Personalised welcome', 'smart', 'smartButton', () => ({ content: { label: 'New here? Start with this' } }), 'Changes by visitor source only — no personal data'),
B(114, 'Campaign spotlight', 'smart', 'campaignSpotlight'),
B(115, 'Smart CTA', 'smart', 'smartButton'),
B(116, 'Recommendation collection', 'smart', 'recommendations'),
L(117, 'Opportunity & contact CTA', 'smart', 'cta', () => ({ content: { title: 'Open to collaborations', text: 'Brands, studios and organisers — tell me what you have in mind.', primaryLabel: 'Pitch me' } }), 'Points to your enquiry route'),
{ n: 118, name: 'Voice to content', category: 'smart', kind: 'howto', note: 'Use “Voice to content” at the top of the block library: speak or type, check the words, then add them as blocks.' },
L(119, 'Campaign landing section', 'smart', 'section', () => ({ content: { heading: 'Launch week', intro: 'Everything for this campaign in one place.' }, layout: { background: 'tint', width: 'wide' } }), 'On campaign spaces, pair with Visibility → phases'),
L(120, 'Smart content collection', 'smart', 'recommendations', () => ({ content: { title: 'Everything for your first order' } }), 'Grouped around one goal, ordered by you')];


export const catalogLooks = blockCatalog.filter((e) => e.kind === 'look');