import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { usePlan } from '../../contexts/PlanContext';
import { useAdminStore } from '../../utils/admin/store';
import { usePolicyAgreements } from '../../hooks/usePolicyAgreements';
import { agreeAll, pendingPolicies, POLICY_GRACE_DAYS } from '../../utils/policyAgreements';
import { formatDate } from '../../utils/billing';
import { cn } from '../../utils/cn';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

/**
 * Asks the workspace Owner to agree to new KUBICU policy versions (D141).
 * "Later" is allowed for 14 days from publishing; after that the Owner must agree before carrying on.
 * Other team members see a strip saying the Owner needs to agree.
 */
export function PolicyAgreement() {
  const { current } = useWorkspace();
  const team = useTeam();
  const plan = usePlan();
  const [admin] = useAdminStore();
  const [store, update] = usePolicyAgreements(current.id);
  const [reviewing, setReviewing] = useState(false);
  const [read, setRead] = useState(false);

  const pending = pendingPolicies(admin.policyReleases, store, plan.id !== 'free');
  if (pending.length === 0) return null;

  const isOwner = team.role === 'owner';
  const overdue = pending.some((p) => p.overdue);
  const unseen = pending.some((p) => !store.laterAt[`${p.doc.slug}@${p.release.version}`]);
  const open = isOwner && (reviewing || overdue || unseen);
  const deadline = pending[0].deadline;
  const names = pending.map((p) => p.doc.title);
  const nameList = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

  const later = () => {
    const at = new Date().toISOString();
    update((s) => ({ ...s, laterAt: { ...s.laterAt, ...Object.fromEntries(pending.map((p) => [`${p.doc.slug}@${p.release.version}`, at])) } }));
    setReviewing(false);
    setRead(false);
  };

  const agree = () => {
    update((s) => agreeAll(s, pending, admin.policyReleases, team.me.name));
    setReviewing(false);
    setRead(false);
    toast.success(`Agreed to the updated ${nameList}`, { description: `Recorded for ${current.name} — ${team.me.name}, ${formatDate(new Date().toISOString())}.` });
  };

  return (
    <>
      <div role={overdue ? 'alert' : 'status'} className={cn('border-b', overdue ? 'border-danger/30 bg-danger-soft' : 'border-line bg-warning-soft')}>
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center md:px-10">
          <p className={cn('flex flex-1 items-start gap-2 text-label', overdue ? 'text-danger' : 'text-fg')}>
            <FileTextIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              KUBICU updated its {nameList}.{' '}
              {isOwner ?
              overdue ?
              'Agree to carry on using your workspace.' :
              `Please agree by ${formatDate(new Date(deadline).toISOString())}.` :
              `${current.ownerName} (the Owner) needs to agree by ${formatDate(new Date(deadline).toISOString())}. Nothing changes for you.`}
            </span>
          </p>
          {isOwner &&
          <Button size="sm" className="shrink-0 self-start sm:self-auto" onClick={() => setReviewing(true)}>
              Review and agree
            </Button>
          }
        </div>
      </div>

      <Dialog
        open={open}
        onClose={later}
        dismissible={!overdue}
        size="lg"
        title={pending.length === 1 ? `${names[0]} updated` : 'KUBICU policies updated'}
        description={
        overdue ?
        `The ${POLICY_GRACE_DAYS} days to review have passed. Agree to keep using ${current.name}. Your public pages stay online either way.` :
        `As the Owner of ${current.name}, please read what changed and agree by ${formatDate(new Date(deadline).toISOString())}.`
        }
        footer={
        <>
            {!overdue &&
          <Button variant="secondary" onClick={later}>
                Later
              </Button>
          }
            <Button onClick={agree} disabled={!read}>
              I agree
            </Button>
          </>
        }>
        
        <ul className="flex flex-col divide-y divide-line">
          {pending.map((p) =>
          <li key={p.doc.slug} className="py-4 first:pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-label font-semibold text-fg">
                  {p.doc.title} <span className="font-normal text-fg-muted">· version {p.release.version}</span>
                </h3>
                <span className="text-caption text-fg-subtle">Published {formatDate(p.release.publishedAt)}</span>
              </div>
              <p className="mt-1.5 text-label text-fg-muted">{p.release.summary}</p>
              <a href={`/about/${p.doc.slug}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-label font-medium text-action underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Read the full {p.doc.title}
                <ExternalLinkIcon size={13} aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          )}
        </ul>
        <label className="mt-2 flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border border-line bg-sunken px-3 py-3 text-label text-fg">
          <input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
          <span>I’ve read the changes and agree on behalf of {current.name}.</span>
        </label>
        <p className="mt-2 text-caption text-fg-subtle">KUBICU records who agreed and when. Draft wording — pending legal review.</p>
      </Dialog>
    </>);

}