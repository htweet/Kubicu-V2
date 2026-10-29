import type { SourceId } from './analytics';

/** Where a domain is in the connection process (D62). It never shows “Live” before verification and a certificate. */
export type DomainStatus = 'waiting_dns' | 'verifying' | 'issuing' | 'live' | 'problem';

/** Prototype control: what the next “Check now” should simulate. */
export type CheckOutcome = 'success' | 'wrong_record' | 'timeout';

export interface CustomDomain {
  id: string;
  /** e.g. adaeze.com or shop.adaeze.com — lowercase, no protocol. */
  host: string;
  kind: 'root' | 'subdomain';
  /** The space this domain shows. */
  spaceId: string;
  status: DomainStatus;
  /** Why the last check didn't pass. */
  problem?: 'wrong_record' | 'timeout';
  /** Value for the verification TXT record. */
  token: string;
  createdAt: string;
  checkedAt?: string;
  liveAt?: string;
  /** The space's main address (canonical URL). One per space. */
  primary: boolean;
  /** Visitors to the kub.icu link are sent to this domain. */
  redirectKubicu: boolean;
}

/** Inside a space: '' = home, a page path, 'shop' or 'shop/<productId>'. */
export interface LinkDestination {
  spaceId: string;
  path: string;
  /** A block on that page to scroll to — an event, a booking or a subscription block. */
  anchor?: string;
}

/** A tracked short link: kub.icu/{main handle}/s/{slug} (D62). */
export interface CampaignLink {
  id: string;
  slug: string;
  /** Where it's shared, in the owner's words — “Instagram bio”, “Market flyer”. */
  name: string;
  source: SourceId;
  destination: LinkDestination;
  createdAt: string;
  archivedAt: string | null;
  /** Optional tags passed on for Google Analytics and ad tools (D230). Source comes from `source`. */
  utm?: {medium: string;campaign: string;content: string;};
  /** Optional end: after this, the link shows "This link has ended" like an archived one (D230). */
  endsAt?: string | null;
  /** Another website instead of one of your pages (D268). Checked by utils/linkSafety on save and on every visit. */
  externalUrl?: string | null;
  /** The owner's own labels, for filtering and export (D268). */
  tags?: string[];
  /** Paused links show "paused" and send nobody anywhere until resumed (D268). */
  pausedAt?: string | null;
  /** Every change of where it goes, newest first (D268). */
  history?: LinkHistoryEntry[];
  /** Optional start: before this, the link says “not live yet” (D271). */
  startsAt?: string | null;
  /** Opens a WhatsApp chat with a message already written, instead of a page or website (D271). */
  whatsapp?: {phone: string;message: string;} | null;
  /** Result of the latest scheduled or manual check (D271). */
  health?: LinkHealth;
}

export interface LinkHealth {
  ok: boolean;
  /** Plain reason when not ok. */
  reason?: string;
  checkedAt: string;
}

/** A saved set of campaign tags to reuse on new links (D271). */
export interface UtmPreset {
  id: string;
  name: string;
  medium: string;
  campaign: string;
  content: string;
}

export interface LinkHistoryEntry {
  at: string;
  by: string;
  /** Human label of the new destination. */
  to: string;
}

export type QrModuleStyle = 'square' | 'rounded' | 'dots';
export type QrEyeStyle = 'square' | 'rounded' | 'circle';
export type QrCentreKind = 'none' | 'initials' | 'text' | 'image';
export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type QrSize = 'sm' | 'md' | 'lg';
export type QrFrame = 'none' | 'border' | 'banner';
export type QrExportSize = 512 | 1024 | 2048;

export interface QrDesign {
  id: string;
  /** Every QR code encodes one campaign link, so scans show in Analytics. */
  linkId: string;
  fg: string;
  bg: string;
  /** Legacy: initials in the middle. Superseded by `centreKind`. */
  centre: boolean;
  frameText: string;
  createdAt: string;
  /* Added with the full designer (D62). Optional so earlier codes keep working. */
  transparent?: boolean;
  moduleStyle?: QrModuleStyle;
  eyeStyle?: QrEyeStyle;
  eyeColor?: string;
  ecLevel?: QrErrorLevel;
  /** Quiet zone around the code, in modules. */
  margin?: number;
  centreKind?: QrCentreKind;
  centreText?: string;
  /** Small data URL of an uploaded logo or picture. */
  centreImage?: string;
  centreSize?: QrSize;
  captionPosition?: 'top' | 'bottom';
  captionColor?: string;
  captionSize?: QrSize;
  frame?: QrFrame;
  exportSize?: QrExportSize;
}

/** An address you choose that forwards somewhere else: a page of yours or another website. */
export interface CustomRedirect {
  id: string;
  spaceId: string;
  /** Path after the space's link, without a leading slash. */
  from: string;
  /** '' / page path / 'shop', or a full https:// address. */
  to: string;
  createdAt: string;
}

export interface DomainsData {
  version: 1;
  domains: CustomDomain[];
  links: CampaignLink[];
  qrs: QrDesign[];
  redirects: CustomRedirect[];
  sampleSeeded?: boolean;
  utmPresets?: UtmPreset[];
  /** When every link was last checked (D271). Checks run at most once a day while the app is open. */
  linkHealthCheckedAt?: string;
}