import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { MessageSquareWarningIcon, SendIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { sameDoc } from '../../utils/reviews';
import { Badge } from '../ui/Badge';

/** Keeps a pending review in step with the Editor's latest draft (D58). Renders nothing. */
export function ReviewSync() {
  const { state } = useEditor();
  const team = useTeam();
  const { currentSpace } = useWorkspace();
  const pending = team.data.reviews.find((r) => r.spaceId === currentSpace.id && r.status === 'pending' && r.requestedById === team.me.id);

  useEffect(() => {
    if (!pending || sameDoc(pending.doc, state.site)) return;
    const t = window.setTimeout(() => team.updateReviewDoc(pending.id, state.site), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.site, pending?.id]);

  // Tell the Editor when their request was decided while they were away.
  useEffect(() => {
    const unseen = team.myNotices.filter((n) => !n.seen);
    if (unseen.length === 0) return;
    unseen.slice(0, 2).forEach((n) => toast(n.text));
    team.markNoticesSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.myNotices.length]);

  return null;
}

/** “In review” / “Changes requested” next to the page status in the canvas top bar. */
export function ReviewBadge() {
  const team = useTeam();
  const { currentSpace } = useWorkspace();
  const latest = team.data.reviews.find((r) => r.spaceId === currentSpace.id && r.status !== 'withdrawn');
  if (!latest || !team.data.approvalsOn) return null;
  if (latest.status === 'pending')
    return (
      <span title={`Sent by ${latest.requestedBy}${latest.updatedAt !== latest.createdAt ? ' · updated since' : ''}`}>
        <Badge tone="info" icon={SendIcon}>
          In review
        </Badge>
      </span>
    );
  if (latest.status === 'changes')
    return (
      <span title={latest.comment ? `${latest.decidedBy}: “${latest.comment}”` : undefined}>
        <Badge tone="warning" icon={MessageSquareWarningIcon}>
          Changes requested
        </Badge>
      </span>
    );
  return null;
}
