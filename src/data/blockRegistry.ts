import type { LucideIcon } from 'lucide-react';
import { LockKeyholeIcon, ShieldCheckIcon as TrustShieldIcon, BotMessageSquareIcon, MicIcon } from 'lucide-react';
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
  BadgeCheckIcon,
  MusicIcon,
  ListMusicIcon,
  LibraryBigIcon,
  HandHeartIcon,
  PanelTopIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  AwardIcon,
  BarChart3Icon,
  TvIcon,
  HomeIcon,
  RectangleHorizontalIcon,
  ColumnsIcon,
  AppWindowIcon,
  GraduationCapIcon } from
'lucide-react';
import type { BlockContentMap, BlockLayout, BlockType } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import { uid } from '../utils/id';
import { defaultHours } from '../utils/openHours';
import { storyBlockDefinitions, storyBlockOrder } from './blockRegistryStory';
import { round2BlockDefinitions, round2BlockOrder } from './blockRegistryRound2';

export type BlockCategory = 'Foundation' | 'Showcase' | 'Conversion' | 'Commerce';

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
  /** Layout a new block starts with, e.g. Columns start Wide (D167). */
  defaultLayout?: Partial<BlockLayout>;
  defaults: () => BlockContentMap[K];
}

const supportBase = {
  type: 'support' as const,
  name: 'Support / pay what you want',
  description: 'Let fans and customers send any amount. A payment, not a tax-deductible donation.',
  category: 'Commerce' as const,
  icon: HandHeartIcon,
  keywords: ['tip', 'donate', 'donation', 'support', 'pay what you want', 'gift', 'appreciation', 'spray', 'church', 'fundraise'],
  defaultAlign: 'center' as const,
  supportsEmphasis: false,
  clickable: true,
  defaults: (): BlockContentMap['support'] => ({
    title: 'Support my work',
    intro: '',
    wording: 'support',
    amounts: [1000, 2000, 5000],
    allowOther: true,
    minNgn: 500,
    askName: true,
    askMessage: true,
    linkId: null
  })
};

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
    name: 'Video & embed',
    description: 'YouTube, Vimeo, TikTok, Instagram, Spotify, maps, Calendly and more — safely embedded.',
    category: 'Foundation',
    icon: VideoIcon,
    keywords: ['youtube', 'vimeo', 'tiktok', 'instagram', 'reel', 'facebook', 'loom', 'spotify', 'soundcloud', 'audiomack', 'music', 'podcast', 'map', 'google maps', 'calendly', 'film', 'media', 'embed'],
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
  course: {
    type: 'course',
    name: 'Course',
    description: 'A course from Commerce → Courses: what’s inside, the price or membership, and a button to start.',
    category: 'Commerce',
    icon: GraduationCapIcon,
    keywords: ['course', 'class', 'lessons', 'tutorial', 'training', 'academy', 'learn', 'masterclass', 'workshop', 'teach'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    minPlan: 'creator',
    defaults: () => ({ courseId: null, style: 'card', ctaLabel: '' })
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
    // D254: new badges hide the number and stay hidden while "Just starting".
    defaults: () => ({ style: 'compact', showScore: false, hideBelow: true })
  },
  audio: {
    type: 'audio',
    name: 'Audio',
    description: 'One track, voice note or episode with a player.',
    category: 'Foundation',
    icon: MusicIcon,
    keywords: ['music', 'song', 'podcast', 'voice note', 'mp3', 'sound', 'beat', 'sermon'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ title: '', artist: '', url: '', fileName: '', coverUrl: '', coverAlt: '', allowDownload: false, transcript: '' })
  },
  playlist: {
    type: 'playlist',
    name: 'Playlist',
    description: 'Several tracks with a track list. Sell any track as a download.',
    category: 'Foundation',
    icon: ListMusicIcon,
    keywords: ['music', 'album', 'ep', 'mixtape', 'podcast', 'episodes', 'tracks'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ title: '', artist: '', coverUrl: '', coverAlt: '', allowDownload: false, tracks: [{ id: uid('tr'), title: '', artist: '', url: '', fileName: '', duration: '', productId: null }] })
  },
  collection: {
    type: 'collection',
    name: 'Collection',
    description: 'One shop collection as a strip or grid, with “See all”.',
    category: 'Commerce',
    icon: LibraryBigIcon,
    keywords: ['shop', 'category', 'new arrivals', 'range', 'catalogue', 'collection'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({ title: '', collectionId: null, layout: 'strip', limit: 8, showSeeAll: true })
  },
  support: supportBase,
  // ——— Layout & showcase (D153) ———
  hero: {
    type: 'hero',
    name: 'Hero',
    description: 'A designed opening: portrait, split, cover, masthead, poster or product.',
    category: 'Showcase',
    icon: PanelTopIcon,
    keywords: ['header', 'banner', 'cover', 'intro', 'masthead', 'poster', 'landing', 'top'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      variant: 'split',
      eyebrow: '',
      title: 'Say what you do in one line',
      subtitle: 'One or two sentences on who it’s for and why it matters.',
      imageUrl: '',
      imageAlt: '',
      focal: 'center',
      primaryLabel: 'Get in touch',
      primaryUrl: '',
      secondaryLabel: '',
      secondaryUrl: '',
      meta: ''
    })
  },
  featureGrid: {
    type: 'featureGrid',
    name: 'Feature grid',
    description: 'Two to four items side by side: services, programmes, formats or categories.',
    category: 'Showcase',
    icon: LayoutDashboardIcon,
    keywords: ['services', 'features', 'grid', 'columns', 'cards', 'offer', 'programmes', 'categories'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'What I offer',
      intro: '',
      columns: 3,
      items: [
      { id: uid('ft'), title: 'First service', text: 'What it is and who it helps.', imageUrl: '', imageAlt: '', label: '', url: '' },
      { id: uid('ft'), title: 'Second service', text: 'What it is and who it helps.', imageUrl: '', imageAlt: '', label: '', url: '' },
      { id: uid('ft'), title: 'Third service', text: 'What it is and who it helps.', imageUrl: '', imageAlt: '', label: '', url: '' }]

    })
  },
  steps: {
    type: 'steps',
    name: 'Steps',
    description: 'A numbered process or timeline, for when the order matters.',
    category: 'Showcase',
    icon: ListOrderedIcon,
    keywords: ['process', 'how it works', 'timeline', 'agenda', 'itinerary', 'steps', 'what happens next'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({
      title: 'How it works',
      intro: '',
      items: [
      { id: uid('st'), title: 'Tell me what you need', text: '' },
      { id: uid('st'), title: 'I send a plan and price', text: '' },
      { id: uid('st'), title: 'We get started', text: '' }]

    })
  },
  logoStrip: {
    type: 'logoStrip',
    name: 'Logo strip',
    description: 'Clients, partners or press — shown only with their permission.',
    category: 'Showcase',
    icon: AwardIcon,
    keywords: ['clients', 'partners', 'brands', 'press', 'featured in', 'logos', 'worked with'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ title: 'Worked with', items: [], permission: false })
  },
  figures: {
    type: 'figures',
    name: 'Figures',
    description: 'Two to four labelled numbers. Marked illustrative until you confirm they’re real.',
    category: 'Showcase',
    icon: BarChart3Icon,
    keywords: ['stats', 'numbers', 'metrics', 'audience', 'impact', 'results', 'figures'],
    defaultAlign: 'center',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({
      title: '',
      items: [
      { id: uid('fg'), value: '120+', label: 'Projects delivered' },
      { id: uid('fg'), value: '6 yrs', label: 'In business' },
      { id: uid('fg'), value: '4', label: 'Cities served' }],

      confirmed: false
    })
  },
  mediaList: {
    type: 'mediaList',
    name: 'Media list',
    description: 'Episodes, releases, videos or chapters with thumbnails, dates and links.',
    category: 'Showcase',
    icon: TvIcon,
    keywords: ['podcast', 'episodes', 'tracks', 'releases', 'videos', 'chapters', 'archive', 'stories'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Latest episodes',
      kind: 'episodes',
      items: [{ id: uid('md'), title: 'Your first episode', meta: '', duration: '', imageUrl: '', url: '' }],
      links: []
    })
  },
  listings: {
    type: 'listings',
    name: 'Listings',
    description: 'Properties, stays or experiences with key facts and an enquiry button.',
    category: 'Showcase',
    icon: HomeIcon,
    keywords: ['property', 'real estate', 'rent', 'sale', 'apartment', 'tour', 'experience', 'stay', 'listing'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: true,
    defaults: () => ({
      title: 'Available now',
      ctaLabel: 'Enquire',
      items: [{ id: uid('ls'), title: 'Your first listing', imageUrl: '', imageAlt: '', price: '', facts: '', location: '', url: '', example: true }]
    })
  },
  /* Containers (D167) */
  section: {
    type: 'section',
    name: 'Section',
    description: 'Group up to 4 blocks under one heading, width and background.',
    category: 'Showcase',
    icon: RectangleHorizontalIcon,
    keywords: ['section', 'group', 'container', 'wrapper', 'band'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    defaults: () => ({ heading: '', intro: '', align: 'left' })
  },
  columns: {
    type: 'columns',
    name: 'Columns',
    description: 'Put 2–4 blocks side by side. They stack on phones.',
    category: 'Showcase',
    icon: ColumnsIcon,
    keywords: ['columns', 'side by side', 'grid', 'row', 'split'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    minPlan: 'creator',
    defaultLayout: { width: 'wide' },
    defaults: () => ({ ratio: 'equal', gap: 'normal', valign: 'top', phoneReverse: false })
  },
  tabs: {
    type: 'tabs',
    name: 'Tabs',
    description: 'Switch between up to 4 blocks. Becomes an accordion on phones.',
    category: 'Showcase',
    icon: AppWindowIcon,
    keywords: ['tabs', 'switcher', 'panels', 'toggle'],
    defaultAlign: 'left',
    supportsEmphasis: false,
    clickable: false,
    minPlan: 'creator',
    defaults: () => ({ style: 'underline', phoneStyle: 'accordion' })
  },
  ...storyBlockDefinitions,
  ...round2BlockDefinitions
};

export const blockCategories: BlockCategory[] = ['Foundation', 'Showcase', 'Conversion', 'Commerce'];

export const blockOrder: BlockType[] = [
'hero',
'profile',
'heading',
'text',
'link',
'social',
'image',
'video',
'audio',
'playlist',
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
'collection',
'menu',
'pricing',
'support',
'subscription',
'course',
'membersOnly',
'download',
'featureGrid',
'steps',
'logoStrip',
'figures',
'mediaList',
'listings',
'section',
'columns',
'tabs',
...storyBlockOrder,
...round2BlockOrder];


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
// Canvas ecosystem (D170): the two smart blocks that need real AI/speech providers are shown as Planned only.
export const plannedBlocks: PlannedBlock[] = [
{
  id: 'ai-faq',
  name: 'AI FAQ assistant',
  description: 'Answers visitor questions using only facts you’ve approved — never invents prices or policies.',
  category: 'Conversion',
  icon: BotMessageSquareIcon,
  availability: 'planned',
  note: 'Needs an AI provider connection'
},
{
  id: 'voice-content',
  name: 'Voice to content',
  description: 'Speak, review the transcript, then turn it into a block. Typing always works too.',
  category: 'Foundation',
  icon: MicIcon,
  availability: 'planned',
  note: 'Needs a speech-to-text provider'
}];