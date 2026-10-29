import type { Block, PageTheme } from './page';

/** AI page assistant (D211). Every reply comes from `utils/assistant/engine` — rule-based in the prototype. */

export type AssistantStage = 'intro' | 'asking' | 'plan' | 'building' | 'paused' | 'done';

export type QuestionId = 'business' | 'name' | 'audience' | 'action' | 'offer' | 'items' | 'city' | 'phone' | 'feel' | 'logo' | 'photos' | 'qr' | 'mode' | 'prices';

/** Something the owner sells or offers, from their own list. The id becomes the Commerce product or Bookings service id. */
export interface AssistantItem {
  id: string;
  name: string;
  priceNgn: number | null;
  /** A photo matched to this item (by order), changeable later in Commerce. */
  imageSrc?: string;
}

/** What the build created outside the page, so it can be listed and removed together. */
export interface AssistantCreated {
  productIds: string[];
  serviceIds: string[];
  qrId?: string;
  linkId?: string;
}

export type AssistantAction = 'order' | 'book' | 'buy' | 'enquire' | 'follow' | 'donate';
export type AssistantOffer = 'products' | 'menu' | 'services' | 'events' | 'content' | 'cause';
export type AssistantFeel = 'warm' | 'light' | 'bold' | 'dark' | 'editorial' | 'glass';

export interface AssistantAnswers {
  brief: string;
  /** Starter id when the business matches one; otherwise empty and `businessText` holds their words. */
  business?: string;
  businessText?: string;
  name?: string;
  audience?: string;
  action?: AssistantAction;
  offer?: AssistantOffer;
  city?: string;
  phone?: string;
  feel?: AssistantFeel;
  /** Replace the current page, or add the new sections under it. */
  mode?: 'replace' | 'add';
  /** Products, menu items or services from the owner's list (Pass C). */
  items?: AssistantItem[];
  /** Make a QR code and campaign link for the page. */
  qr?: boolean;
}

export interface AssistantChip {
  value: string;
  label: string;
  /** Feel chips show a small swatch of the theme they lead to. */
  swatch?: {background: string;accent: string;text: string;};
}

export interface AssistantQuestion {
  id: QuestionId;
  chips: AssistantChip[];
  /** Free text answers are welcome (shown as "Other — type it"). */
  allowText: boolean;
  input: 'choice' | 'text' | 'tel' | 'images' | 'image';
  placeholder?: string;
  /** Images and optional details can be skipped. */
  skippable: boolean;
}

export type ImageRole = 'logo' | 'hero' | 'gallery';

export interface AssistantImage {
  /** Media library reference (or the image itself when the library is unavailable). */
  src: string;
  name: string;
  role: ImageRole;
  width: number;
  height: number;
  /** A small copy for chat bubbles, so the full photo isn't stored twice (Copilot only). */
  thumb?: string;
}

export type AssistantCard = 'plan' | 'done' | 'change' | 'credits' | 'failed' | 'removed';

/** One change requested by chat after the build (Pass D). Nothing reaches the page until it's kept. */
export interface AssistantChange {
  id: string;
  request: string;
  summary: string;
  blocks: Block[];
  theme: PageTheme;
  /** The section it's about, highlighted in the before/after. */
  focusId?: string;
  status: 'pending' | 'kept' | 'discarded' | 'undone';
}

export interface AssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  images?: string[];
  card?: AssistantCard;
  /** For change cards. */
  changeId?: string;
  /** For failed requests: what to send again. */
  retryText?: string;
  /** Shown as a quiet error under the message (e.g. a phone number that doesn't look right). */
  tone?: 'default' | 'warning';
  createdAt: string;
}

export interface PlanSource {
  kind: 'template' | 'composed';
  /** Starter id for templates. */
  exampleId?: string;
  name: string;
  /** Why it was chosen, in plain words. */
  reason: string;
}

/** One step of the live build: a top-level block and anything inside it. */
export interface PlanUnit {
  id: string;
  label: string;
  blocks: Block[];
}

export interface AssistantPlan {
  source: PlanSource;
  /** Other starters worth offering ("Prefer something else?"). */
  alternatives: {id: string;name: string;}[];
  units: PlanUnit[];
  theme: PageTheme;
  themeName: string;
  creates: string[];
  assumptions: string[];
  gaps: string[];
  /** Items to create, and where: Commerce products (products, menu) or Bookings services. */
  items: AssistantItem[];
  itemsAs: 'products' | 'services' | null;
  /** Services go to Bookings only when it's installed; otherwise an enquiry form stands in. */
  bookingsReady: boolean;
  qr: boolean;
  /** A suggested next step that needs its own space (e.g. ticketed events), never created automatically. */
  suggestSpace?: 'event' | 'popup';
}

export interface AssistantSession {
  id: string;
  workspaceId: string;
  pageId: string;
  stage: AssistantStage;
  answers: AssistantAnswers;
  messages: AssistantMessage[];
  question: AssistantQuestion | null;
  asked: QuestionId[];
  /** Questions the owner chose to skip. */
  skipped: QuestionId[];
  images: AssistantImage[];
  plan: AssistantPlan | null;
  /** How many plan units are showing in the live preview. */
  built: number;
  /** Set once the finished page has been applied to the editor. */
  applied: boolean;
  savedTemplateId?: string;
  created?: AssistantCreated;
  /** The page as it was before the build, so "Remove everything" can put it back. */
  before?: {blocks: Block[];theme: PageTheme;};
  /** Changes asked for after the build. */
  changes?: AssistantChange[];
  /** A section tapped in the preview, so "this" in the next message means it. */
  focusId?: string;
  /** Everything the assistant made has been removed. */
  removed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssistantInput =
{kind: 'text';text: string;} |
{kind: 'choice';value: string;label: string;} |
{kind: 'images';items: AssistantImage[];} |
{kind: 'skip';} |
{kind: 'approve';} |
{kind: 'change';} |
{kind: 'alternative';exampleId: string;};