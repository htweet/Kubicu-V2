import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CoinsIcon, TimerIcon } from 'lucide-react';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useStaffSession } from '../../../hooks/useStaffSession';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { newApproval } from '../../../utils/admin/approvals';
import { staffTrial, trialState, type TrialAction } from '../../../utils/admin/trials';
import { GRANT_APPROVAL_AI, GRANT_APPROVAL_NGN, aiBonus, creditAvailable } from '../../../utils/planCatalogue';
import { readBilling, daysUntil } from '../../../utils/billing';
import { plans } from '../../../data/plans';
import { TRIAL_DAYS } from '../../../data/billing';
import { formatNgn, formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { TextInput } from '../../ui/TextInput';
import { ReasonDialog } from '../ReasonDialog';

type Dlg = {kind: 'trial';workspaceId: string;} | {kind: 'grant';workspaceId: string;} | null;

/** Per-workspace trials and credit grants (D135). Every action is audited; large grants need a second person. */
export function WorkspaceBillingTools() {
  const { workspaces, update } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const me = useStaffSession();
  const [dlg, setDlg] = useState<Dlg>(null);
  const [trialAction, setTrialAction] = useState<TrialAction>('start');
  const [days, setDays] = useState(String(TRIAL_DAYS));
  const [grantKind, setGrantKind] = useState<'account' | 'ai'>('account');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [tick, setTick] = useState(0);

  const rows = useMemo(
    () =>
    workspaces.map((w) => {
      const trial = trialState(w.id);
      return { w, trial, credit: creditAvailable(w.id, readBilling(w.id)?.creditUsedNgn, store), ai: aiBonus(w.id, store) };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaces, store, tick]
  );
  const target = dlg ? workspaces.find((w) => w.id === dlg.workspaceId) : undefined;
  const targetTrial = target ? trialState(target.id) : null;

  const openTrial = (id: string) => {
    const t = trialState(id);
    setTrialAction(t ? 'extend' : 'start');
    setDays(t ? '7' : String(TRIAL_DAYS));
    setError(undefined);
    setDlg({ kind: 'trial', workspaceId: id });
  };
  const openGrant = (id: string) => {
    setGrantKind('account');
    setAmount('');
    setError(undefined);
    setDlg({ kind: 'grant', workspaceId: id });
  };

  const confirm = (reason: string) => {
    if (!dlg || !target) return;
    if (dlg.kind === 'trial') {
      const n = Number(days);
      if (trialAction !== 'end' && (!n || n > 60)) return setError('Choose 1–60 days.');
      const r = staffTrial(target.id, target.plan, trialAction, n, reason);
      if ('error' in r) return setError(r.error);
      if (r.plan !== target.plan) update(target.id, { plan: r.plan });
      setStore((s) => audit(s, { area: 'plans', action: r.summary, target: target.name, reason }));
      toast.success(r.summary, { description: `${target.name} sees this in Plan & billing → History.` });
    } else {
      const n = Number(amount);
      const max = grantKind === 'account' ? 1000000 : 10000;
      if (!n || n > max) return setError(grantKind === 'account' ? 'Enter ₦1–₦1,000,000.' : 'Enter 1–10,000 credits.');
      const label = grantKind === 'account' ? `${formatNgn(n)} account credit` : `${n.toLocaleString()} AI credits`;
      const needsApproval = grantKind === 'account' ? n > GRANT_APPROVAL_NGN : n > GRANT_APPROVAL_AI;
      if (needsApproval) {
        setStore((s) =>
        audit({ ...s, approvals: [newApproval({ kind: 'credit_grant', summary: `Give ${target.name} ${label}`, targetId: target.id, targetEmail: target.name, reason, requestedById: me?.id ?? 'unknown', requestedBy: staffActor(s).split(' ·')[0], workspaceId: target.id, workspaceName: target.name, amountNgn: n, grantKind }), ...s.approvals] }, { area: 'plans', action: `Asked to give ${label}`, target: target.name, reason })
        );
        toast.success('Sent for approval', { description: `Grants over ${grantKind === 'account' ? formatNgn(GRANT_APPROVAL_NGN) : `${GRANT_APPROVAL_AI} credits`} need a second staff member.` });
      } else {
        setStore((s) => audit({ ...s, grants: [{ id: `grt_${Date.now().toString(36)}`, workspaceId: target.id, workspaceName: target.name, kind: grantKind, amount: n, reason, at: new Date().toISOString(), by: staffActor(s) }, ...s.grants] }, { area: 'plans', action: `Gave ${label}`, target: target.name, reason }));
        toast.success(`${label} added to ${target.name}`, { description: grantKind === 'account' ? 'Used before their card on the next invoice.' : 'Added to this month’s allowance.' });
      }
    }
    setTick((t) => t + 1);
    setDlg(null);
  };

  const recent = store.grants.slice(0, 6);

  return (
    <>
      <Card id="workspace-billing" title="Trials and credit" description="Start, extend or end a Pro trial, or give account credit or AI credits — with a reason customers never see." body="flush">
        {rows.length === 0 ?
        <p className="px-5 py-5 text-label text-fg-muted md:px-6">No workspaces on this device.</p> :

        <ul className="divide-y divide-line">
            {rows.map(({ w, trial, credit, ai }) =>
          <li key={w.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                    {w.name}
                    <Badge tone="neutral">{plans[w.plan].name}</Badge>
                    {trial && <Badge tone="info">Trial · {daysUntil(trial.endsAt)} days left</Badge>}
                  </span>
                  <span className="block text-caption text-fg-subtle">
                    {credit > 0 ? `${formatNgn(credit)} credit left` : 'No account credit'}
                    {ai > 0 && ` · +${ai} AI credits this month`}
                  </span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" leadingIcon={TimerIcon} onClick={() => openTrial(w.id)}>
                    Trial
                  </Button>
                  <Button size="sm" variant="secondary" leadingIcon={CoinsIcon} onClick={() => openGrant(w.id)}>
                    Give credit
                  </Button>
                </span>
              </li>
          )}
          </ul>
        }
        {recent.length > 0 &&
        <div className="border-t border-line px-5 py-4 md:px-6">
            <h3 className="text-caption font-semibold text-fg-subtle">Recent grants</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {recent.map((g) =>
            <li key={g.id} className="text-caption text-fg-muted">
                  <span className="font-medium text-fg">{g.kind === 'account' ? formatNgn(g.amount) : `${g.amount} AI credits`}</span> to {g.workspaceName} · {g.by.split(' ·')[0]} · {formatRelative(g.at)}
                </li>
            )}
            </ul>
          </div>
        }
      </Card>

      <ReasonDialog
        open={dlg?.kind === 'trial'}
        onClose={() => setDlg(null)}
        onConfirm={confirm}
        destructive={trialAction === 'end'}
        title={`Trial for ${target?.name ?? ''}`}
        description={targetTrial ? `On a trial until ${new Date(targetTrial.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. Ending it moves them back to ${plans[targetTrial.previousPlan].name}; nothing is deleted.` : 'Trials start from Free and give Pro with no card. They can only be started here once per request.'}
        confirmLabel={trialAction === 'start' ? 'Start trial' : trialAction === 'extend' ? 'Extend trial' : 'End trial'}>
        
        <SelectInput<TrialAction>
          id="trial-action"
          label="What to do"
          value={trialAction}
          onChange={(v) => (setTrialAction(v), setError(undefined))}
          options={[
          { value: 'start', label: 'Start a Pro trial', disabled: !!targetTrial },
          { value: 'extend', label: 'Extend the trial', disabled: !targetTrial },
          { value: 'end', label: 'End the trial now', disabled: !targetTrial }]
          } />
        
        {trialAction !== 'end' && <TextInput id="trial-days" label={trialAction === 'start' ? 'Length (days)' : 'Add days'} inputMode="numeric" value={days} error={error} onChange={(e) => (setDays(e.target.value.replace(/\D/g, '').slice(0, 2)), setError(undefined))} fieldClassName="w-40" />}
        {trialAction === 'end' && error && <p className="text-caption text-danger">{error}</p>}
      </ReasonDialog>

      <ReasonDialog open={dlg?.kind === 'grant'} onClose={() => setDlg(null)} onConfirm={confirm} title={`Give credit to ${target?.name ?? ''}`} description={`Account credit is used before their card on plan invoices. AI credits add to this month only. Over ${formatNgn(GRANT_APPROVAL_NGN)} or ${GRANT_APPROVAL_AI} AI credits needs a second staff member.`} confirmLabel="Give credit">
        <SelectInput<'account' | 'ai'>
          id="grant-kind"
          label="What to give"
          value={grantKind}
          onChange={(v) => (setGrantKind(v), setError(undefined))}
          options={[
          { value: 'account', label: 'Account credit (₦)' },
          { value: 'ai', label: 'AI credits (this month)' }]
          } />
        
        <TextInput id="grant-amount" label={grantKind === 'account' ? 'Amount' : 'Credits'} prefix={grantKind === 'account' ? '₦' : undefined} inputMode="numeric" value={amount} error={error} onChange={(e) => (setAmount(e.target.value.replace(/\D/g, '').slice(0, 7)), setError(undefined))} fieldClassName="w-48" />
      </ReasonDialog>
    </>);

}