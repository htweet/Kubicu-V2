export type ProductStatus = 'active' | 'draft' | 'archived';
export type ProductKind = 'physical' | 'digital';

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
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
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
export type FulfilmentMethod = 'pickup' | 'delivery' | 'digital';

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPriceNgn: number;
  qty: number;
  imageUrl: string;
  kind: ProductKind;
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

export type OrderEventKind = 'placed' | 'payment' | 'paid' | 'packing' | 'shipped' | 'ready' | 'completed' | 'cancelled' | 'refund' | 'dispute' | 'note' | 'download';

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
  refunds: Refund[];
  dispute?: Dispute;
  events: OrderEvent[];
  downloadToken?: string;
  downloads: DownloadRecord[];
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
  /** Team member looking after this order (D60). */
  assigneeId?: string | null;
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
}

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

export type PaymentProviderId = 'paystack' | 'flutterwave';

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
  nextOrderNumber: number;
  /** True once sample data has been offered/seeded, so clearing it doesn't bring it back. */
  sampleSeeded: boolean;
}

/** One line in the visitor's cart. */
export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
}

export type TestPaymentOutcome = 'success' | 'pending' | 'failed' | 'cancelled' | 'timeout';