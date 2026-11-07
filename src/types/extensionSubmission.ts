import type { ExtensionCategory } from './marketplace';
import type { WorkspacePlan } from './plan';
import type { ApiScope, WebhookEvent } from './developers';

export type SubmissionStatus = 'in_review' | 'changes_requested' | 'listed' | 'rejected' | 'unlisted';

export interface SubmissionEvent {
  id: string;
  at: string;
  label: string;
  by: 'developer' | 'staff';
}

export interface ExtensionSubmission {
  id: string;
  workspaceId: string;
  developerName: string;
  name: string;
  summary: string;
  description: string;
  category: Exclude<ExtensionCategory, 'apps'>;
  adds: string[];
  scopes: ApiScope[];
  events: WebhookEvent[];
  appUrl: string;
  supportEmail: string;
  privacyUrl: string;
  priceNgn: number;
  minPlan: WorkspacePlan;
  version: string;
  releaseNotes: string;
  status: SubmissionStatus;
  reviewNote: string | null;
  submittedAt: string;
  listedAt: string | null;
  history: SubmissionEvent[];
  /** An update to a listed extension waiting for review; the listed version stays on sale meanwhile. */
  pending?: SubmissionFields | null;
  sample?: boolean;
}

export type SubmissionFields = Pick<
  ExtensionSubmission,
  'name' | 'summary' | 'description' | 'category' | 'adds' | 'scopes' | 'events' | 'appUrl' | 'supportEmail' | 'privacyUrl' | 'priceNgn' | 'minPlan' | 'version' | 'releaseNotes'
>;

export interface SubmissionStore {
  submissions: ExtensionSubmission[];
  seeded: boolean;
}
