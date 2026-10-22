import type { PageDocument, PageVersion, ScheduledPublish } from './page';
import type { WorkspacePlan } from './plan';

/** What a space is for (D50). Every workspace has exactly one main space. */
export type SpaceKind = 'main' | 'campaign' | 'dealroom';

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
  createdAt: string;
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