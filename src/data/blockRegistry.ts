import type { LucideIcon } from 'lucide-react';
import { LockKeyholeIcon, ShieldCheckIcon as TrustShieldIcon } from 'lucide-react';
import {
  CircleUserRoundIcon,
  HeadingIcon,
  AlignLeftIcon,
  Link2Icon,
  AtSignIcon,
  ImageIcon,
  VideoIcon,
  MinusIcon,
  MoveVerticalIcon,
  PhoneIcon,
  CircleHelpIcon,
  ClipboardListIcon,
  ShoppingBagIcon,
  CalendarCheckIcon,
  MessageCircleIcon,
  MailIcon,
  LayoutGridIcon,
  ImagesIcon,
  TimerIcon,
  ListChecksIcon,
  QuoteIcon,
  TicketIcon,
  DownloadIcon,
  UtensilsIcon,
  BriefcaseIcon,
  MapPinIcon,
  RepeatIcon,
  ClipboardPenIcon,
  BadgeCheckIcon } from
'lucide-react';
import type { BlockContentMap, BlockType } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import { uid } from '../utils/id';
import { defaultHours } from '../utils/openHours';

export type BlockCategory = 'Foundation' | 'Conversion' | 'Commerce';

export interface BlockDefinition<K extends BlockType = BlockType> {
  type: K;
  name: string;
  description: string;
  category: BlockCategory;
  icon: LucideIcon;
  keywords: string[];
  defaultAlign: 'left' | 'center';
  supportsEmphasis: boolean;
  clickable: boolean;
  /** Lowest plan that unlocks the full block. Lower plans get a graceful fallback. */
  minPlan?: WorkspacePlan;
  /** Offered in the library only while this KUBICU app is installed (D87). */
  requiresApp?: string;
  defaults: () => BlockContentMap[K];
}

export const blockDefinitions: { [K in BlockType]: BlockDefinition<K> } = {
  profile: {
    type: 'profile',
    name: 'Profile',
    description: 'Your name, photo, one-line pitch and location.',
    category: 'Foundation',
    icon: CircleUserRoundIcon,
    keywords: ['header', 'avatar', 'logo', 'bio', 'identity'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ name: 'Your name', tagline: '', avatarUrl: '', avatarAlt: '', location: '' })
  },
  heading: {
    type: 'heading',
    name: 'Heading',
    description: 'A section title that breaks your page into chapters.',
    category: 'Foundation',
    icon: HeadingIcon,
    keywords: ['title', 'section'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ text: 'New section', level: 'h2' })
  },
  text: {
    type: 'text',
    name: 'Text',
    description: 'A short paragraph — your story, an update or a note.',
    category: 'Foundation',
    icon: AlignLeftIcon,
    keywords: ['paragraph', 'copy', 'about', 'story'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ body: '' })
  },
  link: {
    type: 'link',
    name: 'Link button',
    description: 'Send visitors to any page, store or post.',
    category: 'Foundation',
    icon: Link2Icon,
    keywords: ['button', 'url', 'cta'],
    defaultAlign: 'center',
    supportsEmphasis: true,
    clickable: true,
    defaults: () => ({ label: 'New link', url: '', description: '' })
  },
  social: {
    type: 'social',
    name: 'Social links',
    description: 'A compact row of your social profiles.',
    category: 'Foundation',
    icon: AtSignIcon,
    keywords: ['instagram', 'tiktok', 'x', 'twitter', 'youtube', 'facebook'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ items: [] })
  },
  image: {
    type: 'image',
    name: 'Image',
    description: 'A single photo with optional caption.',
    category: 'Foundation',
    icon: ImageIcon,
    keywords: ['photo', 'picture', 'media'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ url: '', alt: '', caption: '', aspect: '4:5' })
  },
  video: {
    type: 'video',
    name: 'Video embed',
    description: 'Embed a YouTube video or short.',
    category: 'Foundation',
    icon: VideoIcon,
    keywords: ['youtube', 'film', 'media', 'embed'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ url: '', title: '' })
  },
  divider: {
    type: 'divider',
    name: 'Divider',
    description: 'A hairline rule, with an optional label.',
    category: 'Foundation',
    icon: MinusIcon,
    keywords: ['line', 'separator', 'rule'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ label: '' })
  },
  spacer: {
    type: 'spacer',
    name: 'Spacer',
    description: 'Extra breathing room between blocks.',
    category: 'Foundation',
    icon: MoveVerticalIcon,
    keywords: ['gap', 'space', 'padding'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ size: 'md' })
  },
  contact: {
    type: 'contact',
    name: 'Contact',
    description: 'Phone, email, address and opening hours.',
    category: 'Conversion',
    icon: PhoneIcon,
    keywords: ['call', 'email', 'address', 'hours', 'location', 'business card'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ phone: '', email: '', address: '', hours: '' })
  },
  faq: {
    type: 'faq',
    name: 'FAQ',
    description: 'Answer the questions customers always ask.',
    category: 'Conversion',
    icon: CircleHelpIcon,
    keywords: ['questions', 'policy', 'delivery', 'returns', 'accordion'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ title: 'Questions', items: [{ id: uid('faq'), question: '', answer: '' }] })
  },
  leadForm: {
    type: 'leadForm',
    name: 'Lead form',
    description: 'Collect enquiries with name, email, phone or message.',
    category: 'Conversion',
    icon: ClipboardListIcon,
    keywords: ['form', 'enquiry', 'contact', 'quote', 'leads'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({
      title: 'Get in touch',
      description: '',
      fields: { name: true, email: true, phone: false, message: true },
      submitLabel: 'Send',
      consentText: ''
    })
  },
  whatsapp: {
    type: 'whatsapp',
    name: 'WhatsApp chat',
    description: 'Open a WhatsApp chat with a prefilled message.',
    category: 'Conversion',
    icon: MessageCircleIcon,
    keywords: ['chat', 'message', 'order', 'whatsapp'],
    defaultAlign: 'center',
    supportsEmphasis: true,
    clickable: true,
    defaults: () => ({ label: 'Chat on WhatsApp', phone: '', message: 'Hello! I have a question.' })
  },
  booking: {
    type: 'booking',
    requiresApp: 'bookings',
    name: 'Booking CTA',
    description: 'Promote a service and link to where people book.',
    category: 'Conversion',
    icon: CalendarCheckIcon,
    keywords: ['appointment', 'service', 'schedule', 'session', 'fitting'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Book a session',
      description: '',
      duration: '',
      priceNote: '',
      ctaLabel: 'Book now',
      url: ''
    })
  },
  newsletter: {
    type: 'newsletter',
    name: 'Newsletter signup',
    description: 'Grow a list you own, with clear consent.',
    category: 'Conversion',
    icon: MailIcon,
    keywords: ['email', 'subscribe', 'list', 'audience'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({
      title: 'Stay in the loop',
      description: '',
      buttonLabel: 'Subscribe',
      consentText: ''
    })
  },
  product: {
    type: 'product',
    name: 'Product highlight',
    description: 'Feature one product with photo, price and an order button.',
    category: 'Commerce',
    icon: ShoppingBagIcon,
    keywords: ['shop', 'sell', 'item', 'store', 'price'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      name: '',
      priceNgn: null,
      description: '',
      imageUrl: '',
      imageAlt: '',
      badge: '',
      ctaLabel: 'Order on WhatsApp',
      ctaAction: 'whatsapp',
      url: '',
      whatsappPhone: ''
    })
  },
  gallery: {
    type: 'gallery',
    name: 'Gallery',
    description: 'A grid or swipeable set of photos.',
    category: 'Foundation',
    icon: ImagesIcon,
    keywords: ['photos', 'lookbook', 'carousel', 'before after', 'images'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    minPlan: 'creator',
    defaults: () => ({ title: '', layout: 'grid', images: [] })
  },
  portfolio: {
    type: 'portfolio',
    name: 'Portfolio',
    description: 'Case studies with client, role and outcome.',
    category: 'Foundation',
    icon: BriefcaseIcon,
    keywords: ['work', 'case study', 'projects', 'clients'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Selected work',
      items: [{ id: uid('pf'), title: '', client: '', role: '', outcome: '', summary: '', coverUrl: '', coverAlt: '', url: '' }]
    })
  },
  location: {
    type: 'location',
    name: 'Location & hours',
    description: 'Address, opening hours and an open-now badge.',
    category: 'Conversion',
    icon: MapPinIcon,
    keywords: ['map', 'directions', 'address', 'hours', 'open', 'shop', 'visit'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ name: '', address: '', timeZone: 'Africa/Lagos', hours: defaultHours(), note: '' })
  },
  testimonial: {
    type: 'testimonial',
    name: 'Testimonial',
    description: 'A real customer quote, with permission and source.',
    category: 'Conversion',
    icon: QuoteIcon,
    keywords: ['review', 'quote', 'social proof', 'feedback'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ quote: '', name: '', role: '', source: '', avatarUrl: '', avatarAlt: '', permission: false })
  },
  countdown: {
    type: 'countdown',
    name: 'Countdown',
    description: 'Counts down to a real date you set.',
    category: 'Conversion',
    icon: TimerIcon,
    keywords: ['timer', 'launch', 'drop', 'deadline', 'event'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ title: 'Launching soon', target: null, endedMessage: 'It’s here.', linkLabel: '', url: '' })
  },
  event: {
    type: 'event',
    name: 'Event tickets',
    description: 'Date, venue, ticket tiers and a ticket link.',
    category: 'Commerce',
    icon: TicketIcon,
    keywords: ['tickets', 'concert', 'party', 'show', 'rsvp', 'venue'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: '',
      startsAt: null,
      endsAt: null,
      timeZone: 'Africa/Lagos',
      venue: '',
      address: '',
      ticketUrl: '',
      ctaLabel: 'Get tickets',
      tiers: [],
      soldOut: false
    })
  },
  productGrid: {
    type: 'productGrid',
    name: 'Product grid',
    description: 'Several products with prices and sold-out tags.',
    category: 'Commerce',
    icon: LayoutGridIcon,
    keywords: ['shop', 'catalogue', 'store', 'items', 'collection'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Shop',
      items: [
      { id: uid('gp'), name: '', priceNgn: null, imageUrl: '', imageAlt: '', note: '', soldOut: false, url: '' },
      { id: uid('gp'), name: '', priceNgn: null, imageUrl: '', imageAlt: '', note: '', soldOut: false, url: '' }],

      orderAction: 'whatsapp',
      whatsappPhone: '',
      ctaLabel: 'Order'
    })
  },
  menu: {
    type: 'menu',
    name: 'Menu',
    description: 'Food or service menu by category, with WhatsApp ordering.',
    category: 'Commerce',
    icon: UtensilsIcon,
    keywords: ['food', 'restaurant', 'catalogue', 'price list', 'kitchen', 'order'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Menu',
      note: '',
      categories: [{ id: uid('mc'), name: 'Mains', items: [{ id: uid('mi'), name: '', description: '', priceNgn: null, tags: '', available: true }] }],
      whatsappPhone: '',
      orderingOpen: true,
      closedMessage: 'We’re not taking orders right now.'
    })
  },
  pricing: {
    type: 'pricing',
    name: 'Pricing table',
    description: 'Compare two or three packages side by side.',
    category: 'Commerce',
    icon: ListChecksIcon,
    keywords: ['packages', 'plans', 'rates', 'services', 'price list'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Packages',
      packages: [
      { id: uid('pk'), name: 'Starter', priceNgn: null, unit: '', description: '', features: '', ctaLabel: 'Enquire', url: '', highlighted: false },
      { id: uid('pk'), name: 'Full', priceNgn: null, unit: '', description: '', features: '', ctaLabel: 'Enquire', url: '', highlighted: true }]

    })
  },
  download: {
    type: 'download',
    name: 'Download',
    description: 'Share a file — free, or paid through your own link.',
    category: 'Commerce',
    icon: DownloadIcon,
    keywords: ['file', 'pdf', 'ebook', 'presets', 'digital', 'guide'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: '',
      description: '',
      fileName: '',
      fileSize: '',
      format: 'PDF',
      access: 'free',
      priceNgn: null,
      url: '',
      ctaLabel: 'Download',
      coverUrl: '',
      coverAlt: ''
    })
  },
  subscription: {
    type: 'subscription',
    name: 'Subscription',
    description: 'Memberships or product boxes people pay for every week, month or year.',
    category: 'Commerce',
    icon: RepeatIcon,
    keywords: ['membership', 'recurring', 'monthly', 'subscribe', 'box', 'club', 'plan'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    minPlan: 'pro',
    defaults: () => ({ title: 'Join', intro: '', planIds: [], ctaLabel: 'Subscribe', highlightPlanId: null })
  },
  form: {
    type: 'form',
    name: 'Form',
    description: 'Multi-step forms with logic, uploads and payments. Forms add-on.',
    category: 'Conversion',
    icon: ClipboardPenIcon,
    keywords: ['form', 'survey', 'quote', 'rsvp', 'application', 'questionnaire', 'intake'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ formId: null, showTitle: true })
  },
  proof: {
    type: 'proof',
    name: 'Proof of work',
    description: 'Verified reviews and delivered work, matched to real records.',
    category: 'Conversion',
    icon: BadgeCheckIcon,
    keywords: ['reviews', 'rating', 'portfolio', 'verified', 'trust', 'case study', 'testimonial'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    requiresApp: 'proof',
    defaults: () => ({ title: 'What clients say', show: 'both', limit: 3 })
  },
  membersOnly: {
    type: 'membersOnly',
    name: 'Members-only section',
    description: 'Hides the blocks below it from anyone who isn’t a signed-in subscriber.',
    category: 'Commerce',
    icon: LockKeyholeIcon,
    keywords: ['members', 'membership', 'private', 'locked', 'exclusive', 'subscribers', 'paywall', 'club', 'login'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    minPlan: 'pro',
    defaults: () => ({ title: 'For members', teaser: '', joinLabel: 'Become a member', access: 'any', planIds: [], covers: 0 })
  },
  trustBadge: {
    type: 'trustBadge',
    name: 'Trust Passport badge',
    description: 'Your trust level from checked records, with a link to the full passport.',
    category: 'Conversion',
    icon: TrustShieldIcon,
    keywords: ['trust', 'verified', 'badge', 'passport', 'safe', 'legit', 'reviews', 'escrow'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    requiresApp: 'trust-passport',
    defaults: () => ({ style: 'compact', showScore: true })
  }
};

export const blockCategories: BlockCategory[] = ['Foundation', 'Conversion', 'Commerce'];

export const blockOrder: BlockType[] = [
'profile',
'heading',
'text',
'link',
'social',
'image',
'video',
'divider',
'spacer',
'contact',
'faq',
'leadForm',
'form',
'whatsapp',
'booking',
'newsletter',
'product',
'gallery',
'portfolio',
'location',
'testimonial',
'proof',
'trustBadge',
'countdown',
'event',
'productGrid',
'menu',
'pricing',
'subscription',
'membersOnly',
'download'];


export interface PlannedBlock {
  id: string;
  name: string;
  description: string;
  category: BlockCategory;
  icon: LucideIcon;
  availability: 'plan' | 'planned';
  note: string;
}

/**
 * Only blocks that are genuinely not built yet (status "Coming" in docs/PLAN_MATRIX.md).
 * Booking, checkout (product/grid blocks) and secure downloads shipped and were removed.
 */
// Seating maps shipped inside the Event block (D113), so nothing is planned right now.
export const plannedBlocks: PlannedBlock[] = [];