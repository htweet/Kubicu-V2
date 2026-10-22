import type { PageDocument, PageVersion, ScheduledPublish } from './page';
import type { WorkspacePlan } from './plan';

export interface Workspace {
  id: string;
  name: string;
  /** First name used in greetings. */
  ownerName: string;
  plan: WorkspacePlan;
  /** One page per workspace in this release (D15). */
  pageId: string;
  createdAt: string;
}

/** Everything saved for a workspace's page. */
export interface PersistedPage {
  draft: PageDocument;
  published: PageDocument | null;
  publishedAt: string | null;
  versions: PageVersion[];
  lastSavedAt: string | null;
  scheduled: ScheduledPublish | null;
}