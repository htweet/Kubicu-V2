import React, { useState } from 'react';
import { InfoIcon } from 'lucide-react';
import type { AccountFailure } from '../../../types/accountMode';
import type { AiApproval } from '../../../types/aiRuns';
import { useT } from '../../../contexts/LocaleContext';
import { formatRelative } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { AccountStateAlert, toastSaved } from '../../account/AccountStates';
import { approvalStatusMeta } from './runStatus';
import type { AiRunsState } from './useAiRuns';

/**
 * One approval (D549). The action line is Kubicu's fixed summary of the real action, never AI-written.
 * Used in the run timeline and in the Approvals inbox.
 */
export function ApprovalCard({ approval, state, className }: { approval: AiApproval; state: AiRunsState; className?: string }) {
  const { t: tr } = useT();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const can = state.can('workflows.approve');
  // Separation of duties is treated as on for AI approvals (the brief's case); the server enforces it.
  const ownRequest = approval.requestedBy.id === 'me';
  const pending = approval.status === 'pending';
  const hoursLeft = Math.max(0, Math.round((Date.parse(approval.expiresAt) - Date.now()) / 3_600_000));
  const meta = approvalStatusMeta[approval.status];

  const decide = async (d: 'approve' | 'reject') => {
    setBusy(d);
    setFailure(null);
    const r = await state.decide(approval.id, d, comment);
    setBusy(null);
    if (r.ok) {
      toastSaved(tr, d === 'approve' ? tr('Approved. The run carries on.') : tr('Rejected. The run has stopped.'));
      return;
    }
    if (r.failure.code !== 'cancelled' && r.failure.code !== 'already_decided' && r.failure.code !== 'approval_expired') setFailure(r.failure);
  };

  return (
    <article className={cn('rounded-md border border-line bg-surface p-4', pending && 'border-warning/40', className)} aria-label={tr('Approval for {name}', { name: approval.automationName })}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone} dot>
          {tr(meta.label)}
        </Badge>
        <span className="text-caption text-fg-subtle">
          {tr('Asked by {name}', { name: approval.requestedBy.id === 'me' ? tr('you') : approval.requestedBy.name })} · {formatRelative(approval.requestedAt)}
        </span>
      </div>
      <p className="mt-2 text-caption font-medium text-fg-muted">{tr('If approved, Kubicu will:')}</p>
      <p className="mt-0.5 text-label text-fg">{tr(approval.action)}</p>

      {pending && <p className="mt-2 text-caption text-fg-subtle">{tr('Expires in about {n} hours. If nobody decides, the run stops.', { n: hoursLeft })}</p>}

      {approval.status === 'approved' && approval.decidedBy && (
        <p className="mt-2 flex items-center gap-1.5 text-caption text-fg-muted">
          <InfoIcon size={12} aria-hidden />
          {approval.decidedBy.id === 'me' ? tr('You approved this.') : tr('Already decided by {name}', { name: approval.decidedBy.name })}
        </p>
      )}
      {approval.status === 'rejected' && approval.decidedBy && (
        <p className="mt-2 text-caption text-fg-muted">
          {tr('Rejected by {name}', { name: approval.decidedBy.id === 'me' ? tr('you') : approval.decidedBy.name })}
          {approval.comment ? `: “${approval.comment}”` : ''}
        </p>
      )}
      {approval.status === 'expired' && <p className="mt-2 text-caption text-fg-muted">{tr('Nobody decided within 48 hours, so it expired and the run stopped.')}</p>}
      {approval.status === 'withdrawn' && <p className="mt-2 text-caption text-fg-muted">{tr('Withdrawn because the run was cancelled. Nothing was carried out.')}</p>}

      {pending && (
        <div className="mt-3 flex flex-col gap-3">
          {failure && <AccountStateAlert failure={failure} onRetry={() => void decide('approve')} />}
          {!can.allowed ? (
            <p className="text-caption text-fg-muted">{tr(can.reason)}</p>
          ) : ownRequest ? (
            <InlineAlert tone="info" title={tr('Someone else must approve this')}>
              {tr('Separation of duties is on, so nobody can approve their own request.')}
            </InlineAlert>
          ) : (
            <>
              <TextInput id={`ap-comment-${approval.id}`} label={tr('Comment')} optional value={comment} disabled={!!busy} onChange={(e) => setComment(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" loading={busy === 'approve'} disabled={!!busy} onClick={() => void decide('approve')}>
                  {tr('Approve')}
                </Button>
                <Button size="sm" variant="secondary" loading={busy === 'reject'} disabled={!!busy} onClick={() => void decide('reject')}>
                  {tr('Reject')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
