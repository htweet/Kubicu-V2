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
'form' |
'proof' |
'membersOnly' |
'trustBadge' |
'audio' |
'playlist' |
'collection' |
'support' |
'hero' |
'featureGrid' |
'steps' |
'logoStrip' |
'figures' |
'mediaList' |
'listings';

/** Layout sections (D153): six designed openings for a page. */
export type HeroVariant = 'portrait' | 'split' | 'cover' | 'masthead' | 'poster' | 'product';

export interface FeatureItem {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  /** Small line under the title, e.g. "From ₦45,000" or "45 min · online". */
  label: string;
  url: string;
}

export interface StepItem {
  id: string;
  title: string;
  text: string;
}

export interface LogoItem {
  id: string;
  name: string;
  logoUrl: string;
}

export interface FigureItem {
  id: string;
  value: string;
  label: string;
}

export interface MediaListItem {
  id: string;
  title: string;
  /** Date, guest or format, e.g. "Ep. 42 · with Ada Nwosu". */
  meta: string;
  duration: string;
  imageUrl: string;
  url: string;
}

export interface ListingItem {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  price: string;
  /** Key facts on one line, e.g. "3 bed · 2 bath · 180 m²" or "Full day · up to 8 people". */
  facts: string;
  location: string;
  url: string;
  /** Sample cards are labelled "Example listing" until the seller edits them. */
  example: boolean;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

/** One track in a Playlist block (D124). `productId` sells it as a Commerce digital product. */
export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  /** A link to an MP3/M4A/OGG file, or a small upload kept on this device in the prototype. */
  url: string;
  fileName: string;
  duration: string;
  productId: string | null;
}

/** Who may see members-only content (D110): any live subscriber, or subscribers of chosen plans. */
export interface MemberRule {
  access: 'any' | 'plans';
  planIds: string[];
}

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
  /** `editorial` (D157): first line becomes a display heading, an optional short kicker above it. */
  text: {body: string;variant?: 'plain' | 'editorial';};
  link: {label: string;url: string;description: string;};
  social: {items: SocialItem[];};
  /** `decorative` images are skipped by screen readers (empty alt, D76). */
  image: {url: string;alt: string;caption: string;aspect: '1:1' | '4:5' | '16:9';decorative?: boolean;};
  /** Any link from the safe embed list (D142). `captioned` is the seller's own confirmation for video sites. */
  video: {url: string;title: string;captioned?: boolean;};
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
  /** Verified reviews and delivered work from Proof of work (D91). */
  proof: {title: string;show: 'both' | 'reviews' | 'work';limit: number;};
  /**
   * Members-only section (D110): hides the blocks below it from anyone who isn't a signed-in subscriber.
   * `covers` = how many blocks below it are hidden; 0 = everything below it on this page.
   */
  membersOnly: MemberRule & {title: string;teaser: string;joinLabel: string;covers: number;};
  /** Trust Passport badge (D111): level and checked signals, worked out when the page is viewed. */
  trustBadge: {style: 'compact' | 'full';showScore: boolean;};
  /** One audio track (D124): a link or a small upload, with cover and optional transcript. */
  audio: {title: string;artist: string;url: string;fileName: string;coverUrl: string;coverAlt: string;allowDownload: boolean;transcript: string;};
  /** Several tracks with a now-playing bar (D124). */
  playlist: {title: string;artist: string;coverUrl: string;coverAlt: string;tracks: PlaylistTrack[];allowDownload: boolean;};
  /** One Commerce collection as a strip or grid, with "See all" into the shop filtered to it (D124). */
  collection: {title: string;collectionId: string | null;layout: 'strip' | 'grid';limit: number;showSeeAll: boolean;};
  /**
   * Support / pay-what-you-want (D124). Paid through a payment link of kind "open" that the
   * inspector creates and keeps in sync (`linkId`). It's a payment, never a tax-deductible donation.
   */
  support: {
    title: string;
    intro: string;
    wording: 'support' | 'donate' | 'tip';
    amounts: number[];
    allowOther: boolean;
    minNgn: number;
    askName: boolean;
    askMessage: boolean;
    linkId: string | null;
  };
  hero: {
    variant: HeroVariant;
    eyebrow: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    focal: 'center' | 'top' | 'bottom';
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
    /** Poster: date and venue line. Product: price line. Others: a short credit line. */
    meta: string;
  };
  featureGrid: {title: string;intro: string;columns: 2 | 3 | 4;items: FeatureItem[];};
  steps: {title: string;intro: string;items: StepItem[];};
  logoStrip: {title: string;items: LogoItem[];permission: boolean;};
  figures: {title: string;items: FigureItem[];confirmed: boolean;};
  mediaList: {title: string;kind: 'episodes' | 'tracks' | 'videos' | 'chapters';items: MediaListItem[];links: LinkItem[];};
  listings: {title: string;ctaLabel: string;items: ListingItem[];};
}

export interface BlockStyle {
  align: 'left' | 'center';
  emphasis: 'default' | 'featured' | 'subtle';
}

export interface BlockLayout {
  spacing: 'tight' | 'normal' | 'loose';
  /** Layout sections (D153). Missing = 'column', today's width. */
  width?: 'column' | 'wide' | 'full';
  /** Sit beside the next block on tablet and desktop. Missing = stacked. */
  pair?: 'equal' | 'wide-first' | 'narrow-first' | null;
  /** When paired: show this block second on phones. */
  phoneSecond?: boolean;
  /** Section background from the theme. Missing = 'none'. */
  background?: 'none' | 'tint' | 'invert';
}

/** Page-wide layout settings (D153). */
export interface PageLayoutSettings {
  contentWidth?: 'narrow' | 'standard' | 'wide';
  /** A sticky action bar on phones: one primary action. */
  actionBar?: {enabled: boolean;label: string;blockId: string | null;url: string;} | null;
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
  /** A/B test (D127): two blocks share a test id; each visit sees one version. */
  abTest?: AbTest;
}

export interface AbTest {
  id: string;
  arm: 'A' | 'B';
  goal: IntentGoal;
  startedAt: string;
  /** Paused tests show version A to everyone. */
  paused?: boolean;
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
  /** Co-branded spaces only (D121): who looks after this block. Missing = the business that set it up. */
  owner?: BlockOwner;
  createdAt: string;
  updatedAt: string;
}

export type BlockOwner = 'lead' | 'partner' | 'shared';

/** A space two businesses run together (D121). Lives in the lead business's workspace. */
export interface CoBrandSettings {
  partnershipId: string;
  leadName: string;
  partnerName: string;
  partnerHandle?: string;
  /** "sections": each block is Yours, Theirs or Shared. "open": both can change anything; changes are listed and undoable. */
  mode: 'sections' | 'open';
  /** The partner's sign-off on a version of the page; tied to a fingerprint so any later change needs it again. */
  partnerApproval?: {sig: string;partnerSig: string;at: string;} | null;
  startedAt: string;
}

export interface BlockGroup {
  id: string;
  name: string;
}

export interface PageBranding {
  /** Owner's preference. Only honoured on plans that allow removing the badge. */
  hideKubicuBadge: boolean;
  /** Seller choice: every visitor starts in Lightweight mode; they can still turn it off (D88). */
  startLightweight?: boolean;
  /** Ask search engines not to list this space (adds a noindex tag), D124. Links still work. */
  hideFromSearch?: boolean;
}

export type Block = { [K in
BlockType]: BaseBlock & {type: K;content: BlockContentMap[K];} }[
BlockType];

export type BlockOf<K extends BlockType> = Extract<Block, {type: K;}>;

export type BlockMeta = Pick<BaseBlock, 'style' | 'layout' | 'behaviour' | 'visibility' | 'accessibility'>;

export type FontPair = 'editorial' | 'modern' | 'classic' | 'expressive' | 'statement' | 'warm' | 'luxe' | 'grotesk';
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
  /** Artwork behind the whole page (D158). Stays in view while content scrolls over it. */
  backgroundImage?: string;
  /** How much of the background colour sits over the artwork, 0–90 (%). Keeps text readable. */
  backgroundVeil?: number;
  /** Signature material layer (D161). Every field is optional and defaults to today's flat look. */
  material?: ThemeMaterial;
}

export type SurfaceFinish = 'matte' | 'satin' | 'glass' | 'lacquer';
export type ShadowLevel = 'none' | 'soft' | 'lifted' | 'glow';
export type RadiusScale = 'sharp' | 'soft' | 'round' | 'generous';
export type ButtonFinish = 'solid' | 'gradient' | 'gloss' | 'glow';
export type ImageFrame = 'none' | 'hairline' | 'mat' | 'shadow';
export type LinkStyle = 'underline' | 'accent' | 'arrow';
export type ThemeFontId =
'inter' | 'fraunces' | 'newsreader' | 'instrument' | 'archivo' | 'lora' | 'cormorant' | 'bricolage' |
'manrope' | 'sora' | 'dmSerif' | 'playfair' | 'outfit' | 'syne';

/**
 * Material layer for Signature themes (D161): atmosphere, surface finish, depth, shape, button finish and type.
 * Missing values fall back to the flat theme, so classic themes and existing pages render exactly as before.
 */
export interface ThemeMaterial {
  /** Secondary brand colour, used in gradient actions and highlights. */
  secondary?: string;
  /** Subtle text (captions, metadata). Defaults to mutedText. */
  subtleText?: string;
  /** Hairline/border colour. Defaults to a mix of text. */
  border?: string;
  /** Focus ring colour. Defaults to accent. */
  focus?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  /** CSS background recipe for the page atmosphere (gradients, radial glows). Sits behind content; never under body text directly. */
  backdrop?: string;
  /** Lighter recipe used on phones. Defaults to `backdrop`. */
  backdropMobile?: string;
  /** The colours the backdrop can put behind text, so the readability check tests the worst case. */
  backdropStops?: string[];
  surfaceFinish?: SurfaceFinish;
  /** Glass surface opacity, 0–100 (%). */
  glassOpacity?: number;
  /** Glass blur in px. Turned off for reduced transparency. */
  glassBlur?: number;
  shadow?: ShadowLevel;
  /** Glow colour for `glow` shadows and button edges. Defaults to accent. */
  glow?: string;
  /** Border strength as % of text colour when `border` isn't set. */
  borderStrength?: number;
  /** Light-catching top edge on surfaces. */
  edgeHighlight?: boolean;
  radius?: RadiusScale;
  buttonFinish?: ButtonFinish;
  /** Explicit CSS gradient for primary actions; otherwise accent → secondary. */
  buttonGradient?: string;
  /** Short sheen sweep on primary actions (off for reduced motion). */
  sheen?: boolean;
  imageFrame?: ImageFrame;
  linkStyle?: LinkStyle;
  headingFont?: ThemeFontId;
  bodyFont?: ThemeFontId;
  headingWeight?: number;
  /** Heading letter-spacing, e.g. '-0.02em'. */
  headingTracking?: string;
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
  /** Members-only page (D110). Home can't be members-only. */
  membersOnly?: (MemberRule & {teaser: string;}) | null;
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
  /** Present on co-branded campaign spaces only (D121). */
  coBrand?: CoBrandSettings | null;
  /** Language of the page content, as a BCP 47 tag (WCAG 3.1.1, D76). Defaults to "en". */
  language?: string;
  /** Page width and sticky action bar (D153). */
  layout?: PageLayoutSettings;
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