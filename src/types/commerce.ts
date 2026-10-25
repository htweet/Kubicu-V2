import type { SubPlan, Subscription } from './subscriptions';

export type ProductStatus = 'active' | 'draft' | 'archived';
/** 'ticket' products are owned by a Commerce event (D73): one variant per ticket type, stock = seats left. Never listed as products. */
export type ProductKind = 'physical' | 'digital' | 'ticket';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

/** e.g. Size → [S, M, L]. Up to two options generate the variant grid. */
export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  /** Option name → value, e.g. { Size: 'M', Colour: 'Cream' }. Empty for single-variant products. */
  options: Record<string, string>;
  /** Null uses the product price. */
  priceNgn: number | null;
  stock: number;
}

export type DigitalFileStatus = 'processing' | 'scanning' | 'ready' | 'failed';

export interface DigitalFileVersion {
  version: number;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  note: string;
}

export interface DigitalAsset {
  fileName: string;
  sizeBytes: number;
  status: DigitalFileStatus;
  version: number;
  versions: DigitalFileVersion[];
  /** Null = unlimited. */
  downloadLimit: number | null;
  /** Days the link works after purchase. Null = no expiry. */
  expiryDays: number | null;
  licence: string;
  /** D125: stamp each PDF page with the buyer's name, email and order number (simulated). */
  stamp?: boolean;
  /** D136: tile a faint watermark with the buyer's details across image files (simulated). */
  watermarkImages?: boolean;
  /** D125: issue a licence key per buyer, with a number of activations. */
  keys?: {enabled: boolean;prefix: string;activations: number;};
}

/** A licence key issued to one buyer for one digital product (D125). */
export interface LicenceKey {
  id: string;
  productId: string;
  key: string;
  activationsAllowed: number;
  activations: number;
  status: 'active' | 'revoked';
  issuedAt: string;
  revokedAt?: string;
  /** Set when this key replaced an earlier one. */
  replaces?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  kind: ProductKind;
  priceNgn: number | null;
  compareAtNgn: number | null;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  collectionIds: string[];
  trackStock: boolean;
  lowStockAt: number;
  weightKg: number | null;
  digital?: DigitalAsset;
  /** Ticket products: the event that owns them. */
  eventId?: string;
  /** Physical products made after ordering: a deposit at checkout, the balance before dispatch (D95). */
  madeToOrder?: MadeToOrder;
  /** Can be paid in parts at checkout when Instalments is on (D112). */
  instalments?: ProductInstalments;
  /** Sold together with a business partner; money is split per seller at payment (D122). */
  bundle?: ProductBundle;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A partner bundle (D122): one product, two sellers, one checkout. */
export interface ProductBundle {
  partnershipId: string;
  partnerName: string;
  partnerKind: 'connected' | 'guest';
  /** What the partner brings, shown to buyers, e.g. "Gele tying on the day". */
  partnerPart: string;
  /** The agreed percentage, or an exact naira amount per item. */
  split: 'agreement' | 'fixed';
  /** Snapshot of the agreement's lead share, refreshed on every save. */
  leadSharePct: number;
  partnerFixedNgn?: number;
  /** Exact amounts need the partner's acceptance before the product can be active. */
  partnerAcceptedAt?: string;
  /** Connected partners only: hold their share in escrow until delivery. */
  partnerEscrow?: boolean;
}

/** The partner's part of one order line, frozen at payment (D122). */
export interface OrderItemBundle {
  partnershipId: string;
  partnerName: string;
  partnerKind: 'connected' | 'guest';
  partnerPart: string;
  /** Naira per unit before any discount. */
  partnerUnitNgn: number;
  escrow?: boolean;
}

/** Seller-run instalments on a product (D112): the first part at checkout, the rest charged to the same card. */
export interface ProductInstalments {
  parts: 2 | 3 | 4;
  every: InstalmentEvery;
  /** Send after the first part, or only once the last part is paid. */
  ship: 'first' | 'last';
}

export type InstalmentEvery = 'week' | 'fortnight' | 'month';

export interface InstalmentPart {
  id: string;
  /** 1-based. */
  n: number;
  dueAt: string;
  amountNgn: number;
  status: 'paid' | 'scheduled' | 'failed' | 'cancelled';
  paidAt?: string;
  how?: 'card' | 'online' | 'recorded';
  /** First failed attempt of this part; retried on days 1, 3 and 5. */
  failedAt?: string;
  retries: number;
}

export interface OrderInstalments {
  every: InstalmentEvery;
  ship: 'first' | 'last';
  card: {brand: 'Visa' | 'Mastercard' | 'Verve';last4: string;};
  parts: InstalmentPart[];
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  agreedAt: string;
}

/** Pay on delivery (D112): nothing is charged online; the rider or seller collects at the door. */
export interface OrderPod {
  amountNgn: number;
  accept: 'cash' | 'transfer' | 'both';
  collected?: {how: 'cash' | 'transfer';at: string;};
  failed?: {at: string;reason: PodFailReason;note?: string;}[];
}

export type PodFailReason = 'refused' | 'not_home' | 'unreachable' | 'wrong_address' | 'other';

/** Extra ways a buyer can pay at checkout (D112). Pro and above. */
export interface PayOptions {
  pod: {
    enabled: boolean;
    /** Largest order it's offered on. */
    maxOrderNgn: number;
    /** Delivery zones it's offered in; null = every zone. */
    zoneIds: string[] | null;
    accept: 'cash' | 'transfer' | 'both';
    /** Buyers whose phone has refused a pay-on-delivery order before must pay online. */
    blockAfterRefusal: boolean;
  };
  instalments: {enabled: boolean;};
}

export interface MadeToOrder {
  /** Share of the item price taken at checkout, 10–90%. */
  depositPct: number;
  /** Typical days to make it, shown to buyers. */
  leadDays: number;
}

/** What's left to pay on a made-to-order order before it can be dispatched (D95). */
export interface OrderBalance {
  dueNgn: number;
  requestedAt?: string;
  paidAt?: string;
  how?: 'online' | 'recorded';
}

export type EventStatus = 'draft' | 'on_sale' | 'paused' | 'cancelled';

export interface TicketType {
  id: string;
  name: string;
  /** 0 = free. */
  priceNgn: number;
  /** Total seats of this type, including those already sold. */
  quantity: number;
  salesStart: string | null;
  salesEnd: string | null;
  minPerOrder: number;
  maxPerOrder: number;
  note: string;
}

/** Seating maps (D113). A row is a theatre row or a banquet table; every seat in it sells as one ticket type. */
export type SeatingLayout = 'theatre' | 'banquet' | 'stage';

export interface SeatRow {
  id: string;
  /** "A" for rows, "Table 3" for tables. */
  label: string;
  seats: number;
  ticketTypeId: string;
}

export interface SeatingMap {
  layout: SeatingLayout;
  rows: SeatRow[];
}

export type RepeatEvery = 'weekly' | 'fortnightly' | 'monthly';

/** Repeating events (D113): each date is its own event with its own seats and guest list. */
export interface EventSeries {
  id: string;
  every: RepeatEvery;
}

/** An event sold through KUBICU checkout (D73). Its ticket types live on a linked 'ticket' product. */
export interface CommerceEvent {
  seating?: SeatingMap;
  series?: EventSeries;
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string | null;
  timeZone: string;
  online: boolean;
  venue: string;
  address: string;
  /** Overall seat limit across all ticket types. Null = only the per-type quantities apply. */
  capacity: number | null;
  refundPolicy: string;
  status: EventStatus;
  productId: string;
  ticketTypes: TicketType[];
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  sample?: boolean;
}

/** One admission, issued per seat when a ticket order is placed. */
export interface IssuedTicket {
  id: string;
  /** Short code printed under the QR, e.g. KUB-7K2Q. */
  code: string;
  eventId: string;
  ticketTypeId: string;
  typeName: string;
  guestName: string;
  status: 'valid' | 'void';
  checkedInAt?: string;
  checkedInBy?: string;
  /** Which door admitted them, e.g. "Main gate" (D143). */
  checkedInDoor?: string;
  /** Added by the seller (complimentary). */
  comp?: boolean;
  /** Assigned seat (D113): id for checks, label for people, e.g. "Row B, seat 4". */
  seatId?: string;
  seat?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  sample?: boolean;
}

export type StockReason = 'received' | 'correction' | 'damaged' | 'order' | 'cancelled' | 'returned' | 'created';

export interface StockMovement {
  id: string;
  productId: string;
  variantId: string;
  delta: number;
  /** Stock on hand after this movement. */
  after: number;
  reason: StockReason;
  note: string;
  by: string;
  at: string;
  orderNumber?: number;
  sample?: boolean;
}

export type OrderStatus = 'new' | 'paid' | 'packing' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'cancelled';
export type FulfilmentMethod = 'pickup' | 'delivery' | 'digital' | 'tickets';

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPriceNgn: number;
  qty: number;
  imageUrl: string;
  kind: ProductKind;
  /** Chosen seats for seated tickets (D113). */
  seats?: string[];
  /** Partner bundle line: the partner's share, frozen at payment (D122). */
  bundle?: OrderItemBundle;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
}

export interface OrderFulfilment {
  method: FulfilmentMethod;
  zoneId?: string;
  zoneName?: string;
  address?: string;
  eta?: string;
}

export interface Refund {
  id: string;
  amountNgn: number;
  reason: string;
  restocked: boolean;
  at: string;
}

export type DisputeStatus = 'needs_response' | 'under_review' | 'won' | 'lost';

export interface Dispute {
  id: string;
  reason: string;
  amountNgn: number;
  openedAt: string;
  respondBy: string;
  status: DisputeStatus;
  evidence: {id: string;name: string;at: string;}[];
  response: string;
}

export type OrderEventKind = 'placed' | 'payment' | 'paid' | 'packing' | 'shipped' | 'ready' | 'completed' | 'cancelled' | 'refund' | 'dispute' | 'note' | 'download' | 'tracking';

/** Shipping with a courier outside KUBICU Local Fulfilment, e.g. interstate (D144). */
export interface TrackingCarrier {
  name: string;
  trackingNumber?: string;
  url?: string;
}

export type TrackingMilestone = 'update' | 'in_transit' | 'out_for_delivery' | 'attempted';

/** A seller update the customer sees on their tracking page (D144). */
export interface TrackingUpdate {
  id: string;
  at: string;
  label: string;
  location?: string;
  milestone: TrackingMilestone;
}

export interface OrderTracking {
  /** Date the seller promised the customer; overrides the estimate. */
  promisedBy?: string;
  carrier?: TrackingCarrier;
  updates: TrackingUpdate[];
}

export interface OrderEvent {
  id: string;
  at: string;
  kind: OrderEventKind;
  label: string;
}

export interface DownloadRecord {
  id: string;
  productId: string;
  at: string;
  /** The buyer details stamped on this copy, when the file is watermarked (D136). */
  copy?: string;
}

export interface Order {
  id: string;
  number: number;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  fulfilment: OrderFulfilment;
  subtotalNgn: number;
  discountNgn: number;
  deliveryNgn: number;
  providerFeeNgn: number;
  kubicuFeeNgn: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Shown in the timeline when the provider was slow to confirm. */
  paymentNote?: string;
  /** Paid by bank transfer to the seller's own account (D148); the seller confirms it arrived. */
  bankTransfer?: {bank: string;account: string;accountName: string;sentAt?: string;};
  refunds: Refund[];
  dispute?: Dispute;
  events: OrderEvent[];
  downloadToken?: string;
  downloads: DownloadRecord[];
  /** Licence keys issued for digital items in this order (D125). */
  licenceKeys?: LicenceKey[];
  note: string;
  sample?: boolean;
  /** The one discount applied to this order (D51). */
  discount?: OrderDiscount;
  /** Link the order was placed from (main page, campaign or DealRoom). */
  sourceHandle?: string;
  /** Group-goal DealRoom: paid but not to be fulfilled until the goal is reached (D54). */
  held?: boolean;
  /** DealRoom buyers get their own share code; orders placed through it record it in `referredBy` (D54). */
  referralCode?: string;
  referredBy?: string;
  /** Creator Collaboration partner code from the link the buyer arrived on (?partner=) (D103). */
  partnerCode?: string;
  /** Team member looking after this order (D60). */
  assigneeId?: string | null;
  /** Product box renewal: the subscription that created this order (D69). */
  subscriptionId?: string;
  /** Event tickets issued by this order, one per seat (D73). */
  tickets?: IssuedTicket[];
  /** Made-to-order: the deposit was charged at checkout; this is the rest (D95). */
  balance?: OrderBalance;
  /** Pay on delivery (D112). */
  pod?: OrderPod;
  /** Paid in parts (D112). */
  instalments?: OrderInstalments;
  /** Paid-to-delivered tracking: promise date, outside courier, public updates (D144). */
  tracking?: OrderTracking;
  /** Pop-up shop pickup (D183): which session the buyer collects at, and whether they pay there. */
  popup?: OrderPopup;
}

export interface OrderPopup {
  sessionId: string;
  /** e.g. "Sat 14 Dec, 10:00–18:00 · Ikoyi Christmas Market" — frozen at order time. */
  sessionLabel: string;
  payAtStall: boolean;
  collectedAt?: string;
}

export interface OrderDiscount {
  discountId: string;
  kind: DiscountKind;
  /** Code the customer used; empty for automatic offers. */
  code: string;
  label: string;
  /** Referral codes: who referred this order. */
  referrerName?: string;
}

export type DiscountKind = 'code' | 'automatic' | 'referral';

export type DiscountValue = {type: 'percent';percent: number;} | {type: 'fixed';amountNgn: number;} | {type: 'free_delivery';};

export type DiscountScope = {scope: 'all';} | {scope: 'products';productIds: string[];} | {scope: 'collections';collectionIds: string[];};

export interface Discount {
  id: string;
  kind: DiscountKind;
  /** Upper-case code for codes and referrals; empty for automatic offers. */
  code: string;
  /** What the customer sees, e.g. “Eid sale — 20% off”. */
  title: string;
  value: DiscountValue;
  appliesTo: DiscountScope;
  minSubtotalNgn: number | null;
  startsAt: string | null;
  endsAt: string | null;
  /** Total uses allowed across all customers. */
  usageLimit: number | null;
  /** Uses allowed per customer phone number. */
  perCustomerLimit: number | null;
  /** Off = paused by the seller. */
  active: boolean;
  /** Referral codes: the person who shares it, and the reward the seller promised them (honoured by hand). */
  referrerName?: string;
  rewardNote?: string;
  createdAt: string;
  sample?: boolean;
}

/** The auto-built shop at /shop on the workspace's pages (D53). */
export interface StorefrontSettings {
  enabled: boolean;
  title: string;
  intro: string;
  /** Adds “Shop” to the site menu. */
  showInMenu: boolean;
  menuLabel: string;
  /** How visitors order. Checkout needs Pro; WhatsApp works on every plan. */
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  /** Hide sold-out products instead of showing them as Sold out. */
  hideSoldOut: boolean;
  // ——— D98 additions (optional so older saved shops keep working; read through storefrontConfig) ———
  /** One-line notice above the shop, e.g. “Free delivery in Lekki this week”. */
  announcement?: string;
  bannerUrl?: string;
  bannerAlt?: string;
  /** Products per row on desktop. Phones always show 2. */
  columns?: 2 | 3 | 4;
  imageShape?: 'portrait' | 'square' | 'landscape';
  defaultSort?: 'featured' | 'newest' | 'price_asc' | 'price_desc';
  /** Pinned to the top of the Featured order, in this order (max 8). */
  featuredIds?: string[];
  showSearch?: boolean;
  showCollections?: boolean;
  showStockFilter?: boolean;
  /** “Only 3 left” labels. */
  showLowStock?: boolean;
  deliveryNote?: string;
  returnsNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  // ——— D196 shop looks, parts and feature switches (optional; defaults keep today's shop) ———
  look?: ShopLook;
  header?: ShopHeaderStyle;
  featuredStyle?: ShopFeaturedStyle;
  collectionsStyle?: ShopCollectionsStyle;
  cardStyle?: ShopCardStyle;
  productPage?: ShopProductPageStyle;
  /** Price + buy button pinned to the bottom of product pages on phones. */
  stickyBuy?: boolean;
  /** How items go in the cart from the listing. */
  addMode?: ShopAddMode;
  showSaleBadges?: boolean;
  savedItems?: boolean;
  recentlyViewed?: boolean;
  relatedProducts?: boolean;
  askWhatsApp?: boolean;
  shareButtons?: boolean;
  showReviews?: boolean;
}

export type ShopLook = 'classic' | 'boutique' | 'catalogue' | 'lookbook' | 'quick' | 'spotlight';
export type ShopHeaderStyle = 'banner' | 'title' | 'split' | 'none';
export type ShopFeaturedStyle = 'none' | 'row' | 'hero' | 'spotlight';
export type ShopCollectionsStyle = 'chips' | 'tabs' | 'side';
export type ShopCardStyle = 'standard' | 'minimal' | 'overlay' | 'row';
export type ShopProductPageStyle = 'side' | 'stacked' | 'full';
export type ShopAddMode = 'page' | 'button' | 'stepper';

export interface DeliveryZone {
  id: string;
  name: string;
  feeNgn: number;
  eta: string;
}

export interface FulfilmentSettings {
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupHours: string;
  deliveryEnabled: boolean;
  zones: DeliveryZone[];
  freeDeliveryOverNgn: number | null;
}

export type PaymentProviderId = 'paystack' | 'flutterwave' | 'monnify' | 'stripe';

export interface PaymentSettings {
  provider: PaymentProviderId | null;
  connectedAt: string | null;
  businessName: string;
  methods: string[];
}

export interface CommerceData {
  products: Product[];
  collections: Collection[];
  movements: StockMovement[];
  orders: Order[];
  discounts: Discount[];
  storefront: StorefrontSettings;
  /** Group-goal DealRooms already settled at their deadline, by link (D54). */
  settledRooms?: Record<string, {at: string;outcome: 'reached' | 'missed';refunded: number;}>;
  fulfilment: FulfilmentSettings;
  payments: PaymentSettings;
  /** Customer subscriptions (D69). */
  subPlans: SubPlan[];
  subscriptions: Subscription[];
  /** Events with KUBICU ticketing (D73). Optional for data saved before ticketing. */
  events?: CommerceEvent[];
  /** Seats reserved while a buyer is in checkout (D73a). Expired holds are ignored and pruned. */
  ticketHolds?: TicketHold[];
  /** Pay on delivery and instalments (D112). Optional for data saved before them. */
  payOptions?: PayOptions;
  /** Stock set aside for pop-up shops (D191). Synced from each pop-up's settings. */
  stallHolds?: StallHold[];
  nextOrderNumber: number;
  /** True once sample data has been offered/seeded, so clearing it doesn't bring it back. */
  sampleSeeded: boolean;
}

/**
 * Units of a product set aside for one pop-up (D191). What's still held is worked out live:
 * `limit` minus what that pop-up has sold, until `until` (its last session's end) or it closes.
 */
export interface StallHold {
  handle: string;
  label: string;
  productId: string;
  limit: number;
  until: string;
}

/** One line in the visitor's cart. */
export interface TicketHold {
  id: string;
  /** A random id for one browser's checkout — never personal data. */
  holder: string;
  eventId: string;
  productId: string;
  /** Ticket type id (the ticket product's variant id). */
  variantId: string;
  qty: number;
  expiresAt: string;
  /** Exact seats held, for seated events (D113). */
  seats?: string[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
  /** Chosen seats for seated tickets; qty always equals seats.length (D113). */
  seats?: string[];
}

export type TestPaymentOutcome = 'success' | 'pending' | 'failed' | 'cancelled' | 'timeout';