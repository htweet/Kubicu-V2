import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import type { PendingApproval } from '../../types/admin';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { applyApproval, effectiveStatus } from '../../utils/admin/approvals';
import { useStaffSession } from '../../hooks/useStaffSession';
import { formatRelative } from '../../utils/format';
import { Button } from '../ui/Button';
import { ReasonDialog } from './ReasonDialog';

interface ApprovalQueueProps {
  kinds: PendingApproval['kind'][];
  title: string;
  description: string;
  /** Side effects outside the staff store (e.g. moving a payout), run after approval succeeds. */
  onApproved?: (a: PendingApproval) => void;
}

/** Requests of the given kinds waiting for a second staff member (D130). Hidden when empty. */
export function ApprovalQueue({ kinds, title, description, onApproved }: ApprovalQueueProps) {
  const [store, setStore] = useAdminStore();
  const me = useStaffSession();
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);
  const pending = store.approvals.filter((a) => kinds.includes(a.kind) && effectiveStatus(a) === 'pending');
  if (pending.length === 0 && !rejecting) return null;

  const approve = (a: PendingApproval) => {
    let error: string | undefined;
    setStore((s) => {
      const r = applyApproval(s, a, staffActor(s));
      error = r.error;
      return r.store;
    });
    if (error) return toast.error('Couldn’t approve', { description: error });
    onApproved?.(a);
    toast.success('Approved and applied', { description: a.summary });
  };
  const reject = (note: string) => {
    if (!rejecting) return;
    const a = rejecting;
    setStore((s) => audit({ ...s, approvals: s.approvals.map((x) => x.id === a.id ? { ...x, status: 'rejected', decidedBy: staffActor(s), decidedAt: new Date().toISOString(), decisionNote: note } : x) }, { area: 'approvals', action: `Rejected: ${a.summary}`, target: a.targetEmail, reason: note }));
    toast('Request rejected', { description: 'Nothing was changed.' });
    setRejecting(null);
  };
  const withdraw = (a: PendingApproval) => {
    setStore((s) => audit({ ...s, approvals: s.approvals.map((x) => x.id === a.id ? { ...x, status: 'withdrawn', decidedBy: staffActor(s), decidedAt: new Date().toISOString() } : x) }, { area: 'approvals', action: `Withdrew: ${a.summary}`, target: a.targetEmail, reason: 'Withdrawn by the requester.' }));
    toast('Request withdrawn');
  };

  return (
    <>
      {pending.length > 0 &&
      <section aria-label={title} className="mt-8 rounded-lg border border-warning/40 bg-warning-soft">
          <header className="px-5 pb-3 pt-4 md:px-6">
            <h2 className="text-heading font-semibold text-fg">
              {title} · {pending.length}
            </h2>
            <p className="mt-0.5 text-caption text-fg-muted">{description}</p>
          </header>
          <ul className="divide-y divide-line border-t border-line bg-raised">
            {pending.map((a) => {
            const mine = a.requestedById === me?.id;
            return (
              <li key={a.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:gap-6 md:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-label font-semibold text-fg">{a.summary}</p>
                    <p className="mt-0.5 text-caption text-fg-subtle">
                      Asked by {a.requestedBy} · {formatRelative(a.requestedAt)} · expires {formatRelative(a.expiresAt)}
                    </p>
                    <p className="mt-2 text-label text-fg-muted">“{a.reason}”</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {mine ?
                  <>
                        <span className="text-caption text-fg-subtle">Waiting for someone else</span>
                        <Button size="sm" variant="secondary" onClick={() => withdraw(a)}>
                          Withdraw
                        </Button>
                      </> :

                  <>
                        <Button size="sm" variant="secondary" onClick={() => setRejecting(a)}>
                          Reject
                        </Button>
                        <Button size="sm" leadingIcon={CheckIcon} onClick={() => approve(a)}>
                          Approve
                        </Button>
                      </>
                  }
                  </div>
                </li>);

          })}
          </ul>
        </section>
      }
      <ReasonDialog open={!!rejecting} onClose={() => setRejecting(null)} onConfirm={reject} destructive title="Reject this request?" description={rejecting ? `${rejecting.summary}. Nothing changes.` : ''} confirmLabel="Reject" />
    </>);

}