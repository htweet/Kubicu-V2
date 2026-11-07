import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseIcon,
  CalendarCheckIcon,
  CircleUserRoundIcon,
  ClipboardListIcon,
  ImagesIcon,
  LayoutTemplateIcon,
  Link2Icon,
  PlayCircleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TypeIcon,
  WrenchIcon,
} from 'lucide-react';
import type { BlockType } from '../types/page';
import { blockDefinitions, type BlockCategory } from './blockRegistry';
import type { UiLang } from './translations';
import { foldSearch, localSearchWords } from '../utils/searchGlossary';

/*
 * Block library taxonomy (D166). The registry's four broad groups stay for internal use; the picker
 * shows these 13 categories plus "Sections". Every block also gets everyday synonyms so people find it
 * without knowing its name ("appointment" → Booking, "photo" → Image).
 */

export type LibraryCategoryId =
  | 'layout' | 'identity' | 'links' | 'text' | 'images' | 'media' | 'portfolio'
  | 'commerce' | 'services' | 'forms' | 'trust' | 'utilities' | 'smart';

export const libraryCategories: { id: LibraryCategoryId; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplateIcon, description: 'Sections, columns, spacing and rhythm' },
  { id: 'identity', label: 'Identity', icon: CircleUserRoundIcon, description: 'Who you are, up front' },
  { id: 'links', label: 'Links & contact', icon: Link2Icon, description: 'Buttons, socials and ways to reach you' },
  { id: 'text', label: 'Text & story', icon: TypeIcon, description: 'Explain, persuade and answer questions' },
  { id: 'images', label: 'Images', icon: ImagesIcon, description: 'Photos, galleries and logos' },
  { id: 'media', label: 'Media', icon: PlayCircleIcon, description: 'Video, audio, episodes and files' },
  { id: 'portfolio', label: 'Professional', icon: BriefcaseIcon, description: 'Work, team and credentials' },
  { id: 'commerce', label: 'Shop', icon: ShoppingBagIcon, description: 'Products, menus and payments' },
  { id: 'services', label: 'Bookings & events', icon: CalendarCheckIcon, description: 'Appointments, events and dates' },
  { id: 'forms', label: 'Forms & audience', icon: ClipboardListIcon, description: 'Sign-ups, enquiries and community' },
  { id: 'trust', label: 'Trust', icon: ShieldCheckIcon, description: 'Reviews, proof and policies' },
  { id: 'utilities', label: 'Business info', icon: WrenchIcon, description: 'Contact, location, hours and sharing' },
  { id: 'smart', label: 'Smart', icon: SparklesIcon, description: 'Rule-based blocks that adapt' },
];

const categoryOf: Partial<Record<BlockType, LibraryCategoryId>> = {
  section: 'layout', columns: 'layout', tabs: 'layout', anchorNav: 'layout',
  announcement: 'identity', cta: 'identity',
  contactActions: 'links',
  quote: 'text', timeline: 'text', comparison: 'text',
  beforeAfter: 'images',
  team: 'portfolio', credentials: 'portfolio', press: 'portfolio',
  agenda: 'services',
  share: 'forms',
  policies: 'trust',
  delivery: 'commerce',
  hours: 'utilities',
  carousel: 'images', brandHeader: 'identity', linkCollection: 'links', qrCode: 'links',
  document: 'media', embed: 'media', shopCategories: 'commerce', checkoutButton: 'commerce',
  poll: 'forms', community: 'forms', reviewSummary: 'trust', languageSwitch: 'utilities',
  smartButton: 'smart', campaignSpotlight: 'smart', recommendations: 'smart', backToTop: 'utilities', faqAssistant: 'smart',
  spacer: 'layout', divider: 'layout', featureGrid: 'layout', steps: 'layout',
  profile: 'identity', hero: 'identity',
  link: 'links', social: 'links', whatsapp: 'links',
  heading: 'text', text: 'text', faq: 'text', figures: 'text', pricing: 'text', testimonial: 'text',
  image: 'images', gallery: 'images', logoStrip: 'images',
  video: 'media', audio: 'media', playlist: 'media', mediaList: 'media', download: 'media',
  portfolio: 'portfolio',
  product: 'commerce', productGrid: 'commerce', collection: 'commerce', menu: 'commerce', listings: 'commerce', subscription: 'commerce', course: 'commerce', support: 'commerce', membersOnly: 'commerce',
  booking: 'services', event: 'services', countdown: 'services',
  leadForm: 'forms', newsletter: 'forms', form: 'forms',
  proof: 'trust', trustBadge: 'trust',
  contact: 'utilities', location: 'utilities',
};

const fallbackFor: Record<BlockCategory, LibraryCategoryId> = { Foundation: 'text', Showcase: 'layout', Conversion: 'forms', Commerce: 'commerce' };

export function libraryCategoryOf(type: BlockType): LibraryCategoryId {
  return categoryOf[type] ?? fallbackFor[blockDefinitions[type].category];
}

/** Everyday words people type, beyond each block's own keywords. */
const synonyms: Partial<Record<BlockType, string[]>> = {
  booking: ['appointment', 'schedule', 'reserve', 'calendar', 'session', 'consultation'],
  image: ['photo', 'picture', 'pic', 'banner image'],
  gallery: ['photos', 'pictures', 'album', 'lookbook'],
  productGrid: ['shop', 'store', 'products', 'catalogue', 'catalog', 'sell'],
  product: ['item', 'sell', 'buy', 'shop'],
  location: ['map', 'address', 'directions', 'opening hours'],
  contact: ['phone', 'email', 'call', 'reach'],
  leadForm: ['contact form', 'enquiry', 'inquiry', 'leads'],
  form: ['application', 'survey', 'questionnaire', 'enquiry form', 'contact form'],
  newsletter: ['email list', 'subscribe', 'mailing list', 'waitlist'],
  video: ['youtube', 'embed', 'reel', 'vimeo', 'film'],
  audio: ['podcast', 'sound', 'song', 'track'],
  whatsapp: ['chat', 'message', 'dm'],
  pricing: ['packages', 'plans', 'rates', 'price list'],
  faq: ['questions', 'accordion', 'q&a'],
  testimonial: ['review', 'quote', 'feedback'],
  hero: ['banner', 'header', 'headline', 'cover'],
  countdown: ['timer', 'launch'],
  event: ['tickets', 'rsvp', 'party', 'concert'],
  divider: ['line', 'separator', 'rule'],
  spacer: ['gap', 'space', 'padding'],
  menu: ['food', 'restaurant', 'dishes', 'bakery'],
  support: ['tip', 'donate', 'fundraising'],
  social: ['instagram', 'tiktok', 'follow', 'x', 'twitter'],
  link: ['button', 'url', 'website'],
  profile: ['bio', 'about me', 'avatar', 'name'],
  portfolio: ['projects', 'case study', 'work'],
  download: ['pdf', 'file', 'ebook', 'guide'],
  featureGrid: ['services', 'benefits', 'features', 'cards'],
  steps: ['process', 'how it works', 'timeline'],
  figures: ['stats', 'numbers', 'metrics'],
  logoStrip: ['clients', 'partners', 'brands', 'press'],
  mediaList: ['episodes', 'tracks', 'releases', 'videos'],
  listings: ['property', 'houses', 'rentals', 'cars'],
  section: ['container', 'group', 'band', 'wrapper', 'block group'],
  columns: ['side by side', 'two columns', 'three columns', 'layout', 'row'],
  tabs: ['tabbed', 'switcher', 'accordion', 'panels'],
  announcement: ['top bar', 'promo', 'sale', 'launch'],
  cta: ['book now', 'sign up', 'buy now', 'contact us', 'hire me'],
  quote: ['saying', 'testimonial', 'highlight'],
  timeline: ['milestones', 'history', 'roadmap', 'career'],
  comparison: ['pricing table', 'vs', 'feature table', 'options'],
  beforeAfter: ['transformation', 'makeover', 'renovation', 'results', 'photo comparison'],
  team: ['staff', 'crew', 'speakers', 'artists', 'lineup', 'founders'],
  credentials: ['certificates', 'awards', 'cv', 'resume', 'education', 'qualifications'],
  press: ['as seen in', 'media', 'featured', 'books', 'talks'],
  hours: ['opening times', 'open now', 'when are you open'],
  agenda: ['programme', 'schedule', 'timetable', 'event schedule'],
  contactActions: ['call me', 'email me', 'phone number', 'contact buttons'],
  share: ['share buttons', 'copy link', 'whatsapp share'],
  anchorNav: ['table of contents', 'jump to', 'section menu', 'in-page links'],
  policies: ['refund policy', 'terms', 'guarantee', 'promises', 'customer service'],
  delivery: ['shipping', 'delivery fee', 'returns', 'return policy', 'pickup', 'collection', 'dispatch', 'courier', 'waybill', 'nationwide delivery'],
  carousel: ['slider', 'slideshow', 'swipe', 'banner slides'],
  brandHeader: ['logo', 'business name', 'company header', 'shop header'],
  linkCollection: ['many links', 'link groups', 'resources', 'directory'],
  qrCode: ['scan code', 'barcode', 'qr'],
  document: ['pdf', 'brochure', 'price list pdf', 'catalogue pdf', 'deck'],
  embed: ['spotify', 'soundcloud', 'calendly', 'maps', 'iframe', 'widget'],
  shopCategories: ['collections', 'categories', 'browse shop'],
  checkoutButton: ['buy button', 'pay now', 'payment link', 'order now'],
  poll: ['vote', 'survey', 'quiz', 'opinion'],
  community: ['whatsapp group', 'telegram', 'discord', 'join us', 'members'],
  reviewSummary: ['rating', 'stars', 'reviews', 'verified reviews'],
  languageSwitch: ['translate', 'pidgin', 'yoruba', 'hausa', 'igbo'],
  smartButton: ['personalised button', 'dynamic button', 'by source'],
  campaignSpotlight: ['promo', 'sale banner', 'limited offer', 'countdown offer'],
  recommendations: ['my picks', 'favourites', 'start here', 'gear', 'recommended'],
  course: ['online course', 'tutorial class', 'lessons', 'e-learning', 'curriculum', 'modules', 'school', 'tutor'],
  faqAssistant: ['ai', 'bot', 'chat', 'ask a question', 'customer questions', 'auto answer'],
};

/**
 * Everything a search can match for a block. Pass the screen's translate function so the block's name,
 * description and category also match in the chosen language (D342); English words always match too.
 */
export function blockSearchText(type: BlockType, t?: (text: string) => string, lang: UiLang = 'en'): string {
  const def = blockDefinitions[type];
  const cat = libraryCategories.find((c) => c.id === libraryCategoryOf(type));
  const english = [def.name, def.description, cat?.label ?? '', ...def.keywords, ...(synonyms[type] ?? [])];
  const local = t ? [t(def.name), t(def.description), cat ? t(cat.label) : ''] : [];
  // Everyday words in the screen language for the block's English synonyms (D344), with and without tone marks.
  const glossary = localSearchWords(english.join(' '), lang);
  const text = [...english, ...local].join(' ').toLowerCase();
  return `${text} ${foldSearch(text)} ${glossary}`;
}

/** Presentation choices a block already offers, shown in the details pane (grows in Pass E). */
export const blockVariants: Partial<Record<BlockType, string[]>> = {
  hero: ['Split', 'Portrait', 'Cover', 'Masthead', 'Poster', 'Product'],
  text: ['Plain', 'Editorial'],
  link: ['Standard', 'Featured', 'Subtle'],
  gallery: ['Grid', 'Carousel'],
  whatsapp: ['Standard', 'Featured', 'Subtle'],
  mediaList: ['Episodes', 'Releases', 'Videos'],
  columns: ['1 : 1', '3 : 2', '2 : 3'],
  tabs: ['Underline', 'Pills'],
  announcement: ['Neutral', 'Accent', 'Inverted'],
  cta: ['Band', 'Card', 'Split'],
  quote: ['Editorial', 'Marked'],
  team: ['Team', 'Speakers'],
  credentials: ['Credentials', 'Résumé'],
  contactActions: ['Row', 'Stacked'],
  carousel: ['Wide', 'Square', 'Portrait'],
  linkCollection: ['List', 'Grid'],
  shopCategories: ['Cards', 'Chips'],
  brandHeader: ['Centred', 'Left'],
};

/** What a block depends on, in plain words, for the details pane. */
export function blockNeeds(type: BlockType): string[] {
  const needs: Partial<Record<BlockType, string>> = {
    product: 'Uses your products in Commerce',
    productGrid: 'Uses your products, or items you type in',
    collection: 'Uses a collection from Commerce',
    subscription: 'Uses plans from Commerce → Subscriptions',
    course: 'Uses a course from Commerce → Courses',
    booking: 'Uses services from the Bookings app',
    event: 'Can link to an event in Commerce → Events',
    proof: 'Uses reviews from the Proof app',
    trustBadge: 'Shows only after real verification',
    membersOnly: 'Uses your subscriber list',
    form: 'Uses a form from the Forms add-on',
    section: 'Holds up to 4 blocks — select it, then add blocks inside',
    columns: 'Holds 2–4 blocks; each block is one column',
    tabs: 'Holds up to 4 blocks; each block is one tab',
    beforeAfter: 'Two photos you have permission to show',
    anchorNav: 'Points at blocks already on this page',
    policies: 'Only what you write — KUBICU never adds promises for you',
    delivery: 'Can use delivery zones and pickup from Commerce → Settings; returns are in your words',
    shopCategories: 'Uses your collections in Commerce',
    checkoutButton: 'A product from Commerce, or your own payment link',
    reviewSummary: 'Uses verified reviews from the Proof app',
    embed: 'Works with the supported sites list — no custom code',
    smartButton: 'Uses the visitor’s source (IntentFlow); everyone else sees the default',
    campaignSpotlight: 'Shows only between your start and end dates',
    poll: 'Votes are counted on each visitor’s device in this prototype',
  };
  return needs[type] ? [needs[type] as string] : [];
}
