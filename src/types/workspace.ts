import type { PageDocument, PageVersion, ScheduledPublish } from './page';
import type { WorkspacePlan } from './plan';
import type { CurrencyCode } from '../utils/currency';
import type { CountryCode } from './country';

/** What a space is for (D50). Every workspace has exactly one main space. */
export type SpaceKind = 'main' | 'campaign' | 'dealroom' | 'event' | 'fundraiser' | 'popup' | 'booking' | 'members' | 'page';

/** One public space inside a workspace — its own link, theme, blocks and publishing. */
export interface Space {
  id: string;
  kind: SpaceKind;
  name: string;
  createdAt: string;
  /** Archived spaces keep their orders and contacts; their link forwards to the main page. */
  archivedAt: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  /** First name used in greetings. */
  ownerName: string;
  plan: WorkspacePlan;
  /** The main space's page. */
  pageId: string;
  /** Campaigns and DealRooms (D50). The main space is implicit. */
  spaces?: Space[];
  /** Demo workspace only: the sample campaign and DealRoom have been added once. */
  sampleSpacesSeeded?: boolean;
  /** Demo workspace only: the sample Event and Fundraiser spaces have been added once (D179). */
  sampleSpaces2Seeded?: boolean;
  /** Demo workspace only: the latest round of sample spaces added (3 = Pop-up shop, D183; 4 = Booking page and Members area, D186). */
  sampleSpacesRound?: number;
  createdAt: string;
  /**
   * Created with "Start with demo data" (D200): every module has labelled sample records until they're
   * removed in Settings → Business, or automatically once `expiresAt` passes.
   */
  demoData?: { seededAt: string; expiresAt: string } | null;
  /** One currency for everything this workspace sells (D136). Missing = naira. */
  currency?: CurrencyCode;
  /** Where this business sells from (D352). Sets defaults for currency, phone numbers, regions, banks and checkout. Missing = from the currency, else Nigeria. */
  country?: CountryCode;
  /** The Business WhatsApp number every WhatsApp button falls back to (D214). Plain wa.me links — no API. */
  whatsapp?: string;
}

/** Everything saved for one space's page. */
export interface PersistedPage {
  draft: PageDocument;
  published: PageDocument | null;
  publishedAt: string | null;
  versions: PageVersion[];
  lastSavedAt: string | null;
  scheduled: ScheduledPublish | null;
}
