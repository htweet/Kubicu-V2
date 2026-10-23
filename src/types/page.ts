import type { SourceId } from './analytics';

export type BlockType =
'profile' |
'heading' |
'text' |
'link' |
'social' |
'image' |
'video' |
'divider' |
'spacer' |
'contact' |
'faq' |
'leadForm' |
'product' |
'booking' |
'whatsapp' |
'newsletter' |
'gallery' |
'productGrid' |
'menu' |
'pricing' |
'testimonial' |
'event' |
'countdown' |
'download' |
'portfolio' |
'location' |
'subscription' |
'form';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface GridProduct {
  id: string;
  name: string;
  priceNgn: number | null;
  imageUrl: string;
  imageAlt: string;
  note: string;
  soldOut: boolean;
  /** Used when the grid orders through links. */
  url: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceNgn: number | null;
  /** Short notes such as “Spicy · Vegetarian”. */
  tags: string;
  available: boolean;
  /** When set, name, description, price and availability come from this Commerce product. */
  productId?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface PricingPackage {
  id: string;
  name: string;
  priceNgn: number | null;
  /** e.g. “per project”, “per month”. */
  unit: string;
  description: string;
  /** One inclusion per line. */
  features: string;
  ctaLabel: string;
  url: string;
  highlighted: boolean;
  /** When set, the button books this Bookings service instead of opening `url`. */
  serviceId?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  priceNgn: number | null;
  note: string;
  soldOut: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  role: string;
  outcome: string;
  summary: string;
  coverUrl: string;
  coverAlt: string;
  url: string;
}

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  open: string;
  close: string;
  closed: boolean;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'x' | 'facebook' | 'youtube' | 'linkedin';

export interface SocialItem {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LeadFormFields {
  name: boolean;
  email: boolean;
  phone: boolean;
  message: boolean;
}

export interface BlockContentMap {
  profile: {name: string;tagline: string;avatarUrl: string;avatarAlt: string;location: string;};
  heading: {text: string;level: 'h2' | 'h3';};
  text: {body: string;};
  link: {label: string;url: string;description: string;};
  social: {items: SocialItem[];};
  /** `decorative` images are skipped by screen readers (empty alt, D76). */
  image: {url: string;alt: string;caption: string;aspect: '1:1' | '4:5' | '16:9';decorative?: boolean;};
  video: {url: string;title: string;};
  divider: {label: string;};
  spacer: {size: 'sm' | 'md' | 'lg';};
  contact: {phone: string;email: string;address: string;hours: string;};
  faq: {title: string;items: FaqItem[];};
  leadForm: {
    title: string;
    description: string;
    fields: LeadFormFields;
    submitLabel: string;
    consentText: string;
  };
  product: {
    name: string;
    priceNgn: number | null;
    description: string;
    imageUrl: string;
    imageAlt: string;
    badge: string;
    ctaLabel: string;
    /** `checkout` adds to the KUBICU cart (catalogue-linked products only). */
    ctaAction: 'whatsapp' | 'link' | 'checkout';
    url: string;
    whatsappPhone: string;
    /** `catalog` reads name, price, photo and stock from Commerce. Absent = manual. */
    source?: 'manual' | 'catalog';
    productId?: string;
  };
  booking: {
    title: string;
    description: string;
    duration: string;
    priceNote: string;
    ctaLabel: string;
    url: string;
    /** `catalog` books a Bookings service on the page. Absent = external link. */
    source?: 'manual' | 'catalog';
    serviceId?: string;
  };
  whatsapp: {label: string;phone: string;message: string;};
  newsletter: {title: string;description: string;buttonLabel: string;consentText: string;};
  gallery: {title: string;layout: 'grid' | 'carousel';images: GalleryImage[];};
  productGrid: {
    title: string;
    items: GridProduct[];
    orderAction: 'whatsapp' | 'link' | 'checkout';
    whatsappPhone: string;
    ctaLabel: string;
    source?: 'manual' | 'catalog';
    /** Catalogue mode: either a collection, or hand-picked products in this order. */
    collectionId?: string | null;
    productIds?: string[];
  };
  menu: {
    title: string;
    note: string;
    categories: MenuCategory[];
    whatsappPhone: string;
    /** When off, the menu shows but ordering is paused (e.g. kitchen closed). */
    orderingOpen: boolean;
    closedMessage: string;
  };
  pricing: {title: string;packages: PricingPackage[];};
  testimonial: {
    quote: string;
    name: string;
    role: string;
    source: string;
    avatarUrl: string;
    avatarAlt: string;
    /** The owner confirms they have permission to publish this quote. */
    permission: boolean;
  };
  event: {
    title: string;
    startsAt: string | null;
    endsAt: string | null;
    timeZone: string;
    venue: string;
    address: string;
    ticketUrl: string;
    ctaLabel: string;
    tiers: TicketTier[];
    soldOut: boolean;
    /** 'catalog' reads the event, ticket types and seats from Commerce → Events and sells through checkout (D73). */
    source?: 'manual' | 'catalog';
    eventId?: string | null;
  };
  countdown: {title: string;target: string | null;endedMessage: string;linkLabel: string;url: string;};
  download: {
    title: string;
    description: string;
    fileName: string;
    fileSize: string;
    format: string;
    access: 'free' | 'paid';
    priceNgn: number | null;
    url: string;
    ctaLabel: string;
    coverUrl: string;
    coverAlt: string;
    /** `catalog` sells a Commerce digital product through checkout with secure delivery. */
    source?: 'manual' | 'catalog';
    productId?: string;
  };
  portfolio: {title: string;items: PortfolioItem[];};
  location: {name: string;address: string;timeZone: string;hours: OpeningHours[];note: string;};
  /** Recurring plans from Commerce → Subscriptions, one to three side by side (D69). */
  subscription: {title: string;intro: string;planIds: string[];ctaLabel: string;highlightPlanId: string | null;};
  /** A saved form from the Forms add-on (D79). */
  form: {formId: string | null;showTitle: boolean;};
}

export interface BlockStyle {
  align: 'left' | 'center';
  emphasis: 'default' | 'featured' | 'subtle';
}

export interface BlockLayout {
  spacing: 'tight' | 'normal' | 'loose';
}

export interface BlockBehaviour {
  trackClicks: boolean;
  openInNewTab: boolean;
}

export type IntentGoal = 'tap' | 'order' | 'lead' | 'booking';

/** IntentFlow (D64): show a block only to — or to everyone except — visits from these sources. */
export interface SourceRule {
  mode: 'only' | 'except';
  ids: SourceId[];
  goal: IntentGoal;
  /** Paused rules show the block to everyone. */
  paused?: boolean;
  createdAt: string;
}

export interface BlockVisibility {
  sources?: SourceRule;
  hidden: boolean;
  /** ISO time the block starts showing on the live page. Null = no start limit. */
  showFrom?: string | null;
  /** ISO time the block stops showing on the live page. Null = no end limit. */
  showUntil?: string | null;
  /** Campaign spaces: the phases this block shows in. Undefined = every phase (D52). */
  phases?: CampaignPhase[];
}

export type CampaignPhase = 'before' | 'live' | 'ended';
export type CampaignStarter = 'sale' | 'launch' | 'event';

export type DealRoomType = 'drop' | 'goal';

export interface DealRoomExtension {
  at: string;
  from: string;
  to: string;
  reason: string;
}

export interface DealRoomUpdate {
  id: string;
  at: string;
  text: string;
}

/** A DealRoom (D54): one product on its own link, as a limited drop or a group goal. */
export interface DealRoomSettings {
  type: DealRoomType;
  productId: string;
  /** Room price per unit; null = the product's own price. */
  priceNgn: number | null;
  /** Limited drop: units for this room (taken from real stock). */
  seats: number | null;
  /** Group goal: minimum number of buyers by the deadline. */
  goal: number | null;
  perPersonLimit: number;
  opensAt: string | null;
  deadline: string | null;
  /** Set when the seller ends the room early. */
  endedAt: string | null;
  extensions: DealRoomExtension[];
  updates: DealRoomUpdate[];
  /** What a buyer gets for bringing others in, honoured by the seller (nothing is paid automatically). */
  referralReward?: string;
}

/** Campaign settings on a campaign space's document (D52). */
export interface CampaignSettings {
  starter: CampaignStarter;
  /** Campaign window in absolute time; shown in the workspace time zone. */
  startsAt: string | null;
  endsAt: string | null;
  /** A discount (code) from Commerce applied through the campaign link. */
  discountId: string | null;
  /** Products the campaign features (checked before publishing). */
  productIds: string[];
}

export interface BlockAccessibility {
  label: string;
}

export interface BaseBlock {
  id: string;
  schemaVersion: number;
  style: BlockStyle;
  layout: BlockLayout;
  behaviour: BlockBehaviour;
  visibility: BlockVisibility;
  accessibility: BlockAccessibility;
  /** Locked blocks can't be edited, moved or deleted until unlocked. */
  locked?: boolean;
  /** Blocks sharing a groupId form one contiguous group. */
  groupId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockGroup {
  id: string;
  name: string;
}

export interface PageBranding {
  /** Owner's preference. Only honoured on plans that allow removing the badge. */
  hideKubicuBadge: boolean;
}

export type Block = { [K in
BlockType]: BaseBlock & {type: K;content: BlockContentMap[K];} }[
BlockType];

export type BlockOf<K extends BlockType> = Extract<Block, {type: K;}>;

export type BlockMeta = Pick<BaseBlock, 'style' | 'layout' | 'behaviour' | 'visibility' | 'accessibility'>;

export type FontPair = 'editorial' | 'modern' | 'classic' | 'expressive' | 'statement' | 'warm';
export type ButtonShape = 'pill' | 'rounded' | 'square';
export type ButtonStyle = 'solid' | 'outline' | 'soft';

export interface PageTheme {
  presetId: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  accentText: string;
  fontPair: FontPair;
  buttonShape: ButtonShape;
  buttonStyle: ButtonStyle;
}

export interface PageSeo {
  title: string;
  description: string;
}

/** An extra page inside a space (D48). The home page lives on the document itself. */
export interface SitePage {
  id: string;
  /** Shown in the site menu. */
  title: string;
  /** Address after the handle: kub.icu/handle/{path}. */
  path: string;
  seo: PageSeo;
  blocks: Block[];
  groups?: BlockGroup[];
  hideFromNav?: boolean;
  createdAt: string;
}

/** An old page address that forwards to a new one ('' = home). */
export interface PageRedirect {
  from: string;
  to: string;
}

/**
 * A space: shared link, theme and branding. `blocks`, `groups` and `seo` belong to the
 * home page; extra pages (D48) live in `pages`.
 */
export interface PageDocument {
  id: string;
  schemaVersion: number;
  handle: string;
  title: string;
  theme: PageTheme;
  seo: PageSeo;
  blocks: Block[];
  groups?: BlockGroup[];
  branding?: PageBranding;
  pages?: SitePage[];
  /** Menu label for the home page. Defaults to “Home”. */
  homeLabel?: string;
  redirects?: PageRedirect[];
  /** Present on campaign spaces only. */
  campaign?: CampaignSettings;
  /** Present on DealRoom spaces only (D54). */
  dealRoom?: DealRoomSettings;
  /** Language of the page content, as a BCP 47 tag (WCAG 3.1.1, D76). Defaults to "en". */
  language?: string;
  updatedAt: string;
}

export interface PageVersion {
  id: string;
  label: string;
  note: string;
  createdAt: string;
  kind: 'published' | 'snapshot';
  doc: PageDocument;
}

export interface ScheduledPublish {
  id: string;
  /** ISO time the version goes live. */
  at: string;
  note: string;
  /** The exact draft captured when scheduling. Later edits need another publish. */
  doc: PageDocument;
  createdAt: string;
}

export interface SavedSection {
  id: string;
  name: string;
  blocks: Block[];
  createdAt: string;
}

export interface SavedTheme {
  id: string;
  name: string;
  theme: PageTheme;
  createdAt: string;
}

export type SaveStatus = 'saved' | 'saving' | 'offline' | 'error' | 'conflict';

export type Viewport = 'phone' | 'widePhone' | 'tablet' | 'desktop';

export type RenderMode = 'edit' | 'live';