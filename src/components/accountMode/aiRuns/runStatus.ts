import type { AiApprovalStatus, AiRunStatus } from '../../../types/aiRuns';

type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

/** Label and badge tone for each run status (D549). Labels go through tr() where shown. */
export const runStatusMeta: Record<AiRunStatus, { label: string; tone: Tone }> = {
  queued: { label: 'Queued', tone: 'neutral' },
  running: { label: 'Running', tone: 'info' },
  waiting_approval: { label: 'Waiting for approval', tone: 'warning' },
  cancelling: { label: 'Cancelling', tone: 'neutral' },
  succeeded: { label: 'Succeeded', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  timed_out: { label: 'Timed out', tone: 'danger' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const approvalStatusMeta: Record<AiApprovalStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Waiting for you', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  expired: { label: 'Expired', tone: 'neutral' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' },
};

export type RunFilter = 'all' | 'running' | 'waiting' | 'ended';

export function matchesFilter(status: AiRunStatus, f: RunFilter): boolean {
  if (f === 'all') return true;
  if (f === 'running') return status === 'queued' || status === 'running' || status === 'cancelling';
  if (f === 'waiting') return status === 'waiting_approval';
  return status === 'succeeded' || status === 'failed' || status === 'cancelled' || status === 'timed_out' || status === 'rejected';
}
