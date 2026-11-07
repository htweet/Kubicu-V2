import { useAdminStore } from '../utils/admin/store';
import { useTemplateStore } from '../utils/templateListings';
import { useSubmissions } from '../utils/extensionSubmissions';
import { STAFF_KINDS, effectiveStatus } from '../utils/admin/approvals';
import { useKycQueue } from './useKycQueue';
import { useSponsorships } from './useSponsorships';
import { appealOpen, disputeOpen, disputeRows } from '../utils/sponsorships';

/**
 * Super-admin sidebar badges (D248): each number repeats a count the area's own page shows,
 * using the same filter, so the sidebar and the page never disagree. Areas whose page shows no
 * waiting count get no badge.
 */
export function useAdminNavCounts(): Record<string, number> {
  const [store] = useAdminStore();
  const [templates] = useTemplateStore();
  const [subs] = useSubmissions();
  const kyc = useKycQueue();
  const { briefs } = useSponsorships();
  const now = Date.now();

  const templateQueue = templates.listings.filter((l) => l.status === 'in_review' || (l.status === 'listed' && l.pendingDoc)).length;
  const extensionQueue = subs.submissions.filter((s) => s.status === 'in_review' || (s.status === 'listed' && s.pending)).length;

  return {
    // "Verification" tab badge
    payments: kyc.length,
    // "Open reports" tab badge
    moderation: store.reports.filter((r) => r.status === 'open').length,
    // "Waiting for a decision"
    appeals: store.appeals.filter((a) => a.status === 'open').length,
    // "Needs reply" tab badge
    support: store.tickets.filter((t) => t.status === 'open').length,
    // "Open requests"
    'data-requests': store.dataRequests.filter((d) => d.status === 'new' || d.status === 'in_progress').length,
    // Template "Review queue" + "Extensions" review queue
    modules: templateQueue + extensionQueue,
    // Sponsorship problems "To decide" (D454)
    sponsorships: disputeRows(briefs).filter((r) => disputeOpen(r.app) || appealOpen(r.app)).length + briefs.filter((b) => b.status === 'review').length,
    // "Waiting for a second Platform lead"
    staff: store.approvals.filter((a) => STAFF_KINDS.includes(a.kind) && effectiveStatus(a, now) === 'pending').length,
  };
}
