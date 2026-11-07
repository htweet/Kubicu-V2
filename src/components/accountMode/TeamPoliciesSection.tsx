import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { AccountFailure, TeamPolicies } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { simulate } from '../../utils/accountModeSim';
import { sampleTeamPolicies } from '../../data/accountModeSamples';
import { Switch } from '../ui/Switch';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { List } from '../ui/layout/ListRow';
import { accountErrorCopy, isScreenFailure, toastSaved } from '../account/AccountStates';

type Key = keyof TeamPolicies;
type RowState = { kind: 'saving' } | { kind: 'saved' } | { kind: 'failed'; text: string } | null;

/**
 * Account mode team policies (D536). Each change needs team.manage and "Confirm it's you"; who may pay out
 * is Owner only. A failed save puts the old value back. Refund limit and publishing review also exist in
 * Settings → Roles / Approvals; engineering wires those controls to the same `policy.save` call.
 */
export function TeamPoliciesSection({ onScreenFailure }: { onScreenFailure: (f: AccountFailure) => void }) {
  const { t: tr } = useT();
  const team = useTeam();
  const { simulation, withStepUp } = useAccountMode();
  const manage = team.can('team.manage');
  const isOwner = team.role === 'owner';
  const [values, setValues] = useState<TeamPolicies>(sampleTeamPolicies);
  const [limitDraft, setLimitDraft] = useState(String(sampleTeamPolicies.salesRefundLimit));
  const [rows, setRows] = useState<Partial<Record<Key, RowState>>>({});

  useEffect(() => setLimitDraft(String(values.salesRefundLimit)), [values.salesRefundLimit]);

  const save = async <K extends Key>(key: K, next: TeamPolicies[K]) => {
    const old = values[key];
    setValues((v) => ({ ...v, [key]: next }));
    setRows((r) => ({ ...r, [key]: { kind: 'saving' } }));
    const refusal = key === 'adminsCanPayOut' ? tr('Only Owners can change who may pay out.') : tr('You need permission to manage the team to change this.');
    const res = await withStepUp(() => simulate('policy.save', simulation, { stepUp: true, refusal }));
    if (res.ok) {
      setRows((r) => ({ ...r, [key]: { kind: 'saved' } }));
      toastSaved(tr);
      window.setTimeout(() => setRows((r) => (r[key]?.kind === 'saved' ? { ...r, [key]: null } : r)), 2500);
      return;
    }
    // The old value comes back.
    setValues((v) => ({ ...v, [key]: old }));
    if (key === 'salesRefundLimit') setLimitDraft(String(old));
    if (res.code === 'cancelled') {
      setRows((r) => ({ ...r, [key]: null }));
      return;
    }
    if (isScreenFailure(res.code)) {
      onScreenFailure(res);
      return;
    }
    setRows((r) => ({ ...r, [key]: { kind: 'failed', text: `${tr('Couldn’t save.')} ${accountErrorCopy(tr, res).body}` } }));
  };

  const status = (key: Key) => {
    const s = rows[key];
    if (!s) return null;
    if (s.kind === 'saving')
      return (
        <p className="mt-1.5 flex items-center gap-1.5 text-caption text-fg-subtle" role="status">
          <Loader2Icon size={12} className="animate-spin" aria-hidden />
          {tr('Saving…')}
        </p>
      );
    if (s.kind === 'saved')
      return (
        <p className="mt-1.5 text-caption text-success" role="status">
          {tr('Saved')}
        </p>
      );
    return (
      <p className="mt-1.5 text-caption text-danger" role="alert">
        {s.text}
      </p>
    );
  };

  const limitValue = Number(limitDraft.replace(/\D/g, ''));
  const busy = (key: Key) => rows[key]?.kind === 'saving';

  return (
    <section aria-labelledby="policies-heading">
      <h2 id="policies-heading" className="text-label font-semibold text-fg">
        {tr('Team policies')}
      </h2>
      {!manage.allowed && <p className="mt-1 text-caption text-fg-muted">{manage.reason}</p>}
      <List ruled className="mt-3">
        <li className="py-3">
          <Switch
            id="pol-payout"
            label={tr('Admins can pay out')}
            description={isOwner ? tr('Let Admins send money from the wallet to the bank.') : tr('Only Owners can change who may pay out.')}
            checked={values.adminsCanPayOut}
            disabled={!isOwner || busy('adminsCanPayOut')}
            onChange={(v) => void save('adminsCanPayOut', v)}
          />
          {status('adminsCanPayOut')}
        </li>
        <li className="py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="sm:w-56">
              <TextInput
                id="pol-refund"
                label={tr('Sales refund limit')}
                inputMode="numeric"
                value={limitDraft}
                disabled={!manage.allowed || busy('salesRefundLimit')}
                hint={tr('Most a Sales member can refund on one order without an Admin.')}
                onChange={(e) => setLimitDraft(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <Button size="sm" variant="secondary" disabled={!manage.allowed || !limitDraft || limitValue === values.salesRefundLimit} loading={busy('salesRefundLimit')} onClick={() => void save('salesRefundLimit', limitValue)}>
              {tr('Save')}
            </Button>
          </div>
          {status('salesRefundLimit')}
        </li>
        <li className="py-3">
          <Switch
            id="pol-review"
            label={tr('Publishing needs review')}
            description={tr('Changes to live pages wait for an Owner or Admin to approve them.')}
            checked={values.publishingNeedsReview}
            disabled={!manage.allowed || busy('publishingNeedsReview')}
            onChange={(v) => void save('publishingNeedsReview', v)}
          />
          {status('publishingNeedsReview')}
        </li>
        <li className="py-3">
          <Switch
            id="pol-sod"
            label={tr('Separation of duties')}
            description={tr('Someone else must approve. Nobody can approve their own request.')}
            checked={values.separationOfDuties}
            disabled={!manage.allowed || busy('separationOfDuties')}
            onChange={(v) => void save('separationOfDuties', v)}
          />
          {status('separationOfDuties')}
        </li>
      </List>
    </section>
  );
}
