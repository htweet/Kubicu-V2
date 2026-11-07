import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangleIcon, CheckCircle2Icon, PlugIcon, RefreshCwIcon } from 'lucide-react';
import type { AccountingPostMode, AccountKey } from '../../../types/accounting';
import type { CountryCode } from '../../../types/country';
import { useCommerce } from '../../../contexts/CommerceContext';
import { shopSettingsOf } from '../../../utils/commerce/shopSettings';
import { countryInfo } from '../../../utils/country';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useT } from '../../../contexts/LocaleContext';
import { useAccounting } from '../../../hooks/useAccounting';
import { useIncomeEntries } from '../../../hooks/useIncomeEntries';
import { useMoney } from '../../../hooks/useMoney';
import { ACCOUNTING_PLAN, accountLabels, accountingProviders } from '../../../data/accountingProviders';
import { plans, planAtLeast } from '../../../data/plans';
import { emptyAccounting, missingAccounts, missingTaxCountries, payoutsWaiting, runSync, waiting } from '../../../utils/accounting/sync';
import { formatNgn, formatRelative } from '../../../utils/format';
import { Section } from '../../ui/layout/Section';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TextInput } from '../../ui/TextInput';
import { Switch } from '../../ui/Switch';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { AccountingConnectDialog } from './AccountingConnectDialog';

/** Settings → Integrations → Accounting (D438): post sales, fees, refunds and tax to Xero or Sage. */
export function AccountingSection({ canManage }: { canManage: boolean }) {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, ACCOUNTING_PLAN);
  const { data: s, update } = useAccounting(current.id);
  const entries = useIncomeEntries();
  const payouts = useMoney(current.id).data.payouts;
  const commerce = useCommerce().data;
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const list = waiting(s, entries);
  const outs = payoutsWaiting(s, payouts);
  const pending = list.length + outs.length;
  const missing = missingAccounts(s, list, outs);
  const lastRun = s.runs[0];
  const editable = canManage && allowed;

  // Daily sync (simulated): runs when the screen opens if the last one was over a day ago.
  useEffect(() => {
    if (!s.provider || !s.auto || !allowed || pending === 0) return;
    if (lastRun && Date.now() - Date.parse(lastRun.at) < 86_400_000) return;
    update((x) => runSync(x, entries, 'auto', payouts));
  }, [s.provider, s.auto, allowed]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAccount = (k: AccountKey, v: string) => update((x) => ({ ...x, accounts: { ...x.accounts, [k]: v.trim().slice(0, 12) } }));
  const setAbroad = (c: string, v: string) => update((x) => ({ ...x, accounts: { ...x.accounts, vatAbroad: { ...x.accounts.vatAbroad, [c]: v.trim().slice(0, 12) } } }));
  // Countries the shop is registered for tax in, besides its own (D435): each gets its own tax account (D456).
  const taxAbroad = Object.entries(shopSettingsOf(commerce).tax.sellsTo ?? {})
    .filter(([, r]) => r?.registered)
    .map(([c]) => c);
  const missingAbroad = missingTaxCountries(s, list);
  const missingAll = [...missing.map((m) => tr(m)), ...missingAbroad.map((c) => tr('Tax collected — {country}', { country: tr(countryInfo(c as CountryCode).name) }))];

  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      const next = runSync(s, entries, 'manual', payouts);
      const result = next.runs[0];
      update(() => next);
      setSyncing(false);
      const tool = s.provider ? accountingProviders[s.provider].name : '';
      if (result.failed && !result.posted) toast.error(tr('Nothing posted'), { description: result.problems[0] });
      else
        toast.success(tr('Posted to {tool}: {n}', { tool, n: result.posted }), {
          description: result.failed
            ? `${tr('Still waiting: {n}', { n: result.failed })} — ${result.problems[0]}`
            : [tr('{amount} in sales', { amount: formatNgn(result.amountNgn) }), result.transfers ? tr('Payouts to your bank: {n}', { n: result.transfers }) : ''].filter(Boolean).join(' · '),
        });
    }, 700);
  };

  const disconnect = () => {
    update((x) => ({ ...emptyAccounting(), synced: x.synced, runs: x.runs, startFrom: x.startFrom }));
    toast(tr('Accounting disconnected'), { description: tr('Nothing already posted is removed from your books.') });
  };

  return (
    <Section id="int-accounting" title={tr('Accounting')} description={tr('Send every payment, fee, refund and tax amount to your accounting tool, so your books match your wallet without typing.')}>
      {!allowed && (
        <InlineAlert tone="info" title={tr('Accounting connections are on {plan}', { plan: plans[ACCOUNTING_PLAN].name })} action={<UpgradeButton plan={ACCOUNTING_PLAN} feature="Accounting connections" />}>
          {tr('On every plan you can still download a QuickBooks, Zoho or spreadsheet file from the Sales report.')}
        </InlineAlert>
      )}

      {!s.provider ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <p className="text-label text-fg-muted">{tr('Xero or Sage Business Cloud — one at a time.')}</p>
          <Button size="sm" variant="secondary" leadingIcon={PlugIcon} disabled={!editable} onClick={() => setConnecting(true)}>
            Connect
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
            <p className="min-w-0 text-label text-fg">
              <span className="font-semibold">{accountingProviders[s.provider].name}</span> <span className="text-fg-subtle">· {s.organisation}</span>{' '}
              <Badge tone="success" dot>
                Connected · test
              </Badge>
            </p>
            <Button size="sm" variant="tertiary" disabled={!canManage} onClick={disconnect}>
              Disconnect
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-heading font-semibold tabular-nums text-fg">
                {pending === 0 ? tr('All caught up') : [list.length ? tr('Payments waiting: {n}', { n: list.length }) : '', outs.length ? tr('Payouts waiting: {n}', { n: outs.length }) : ''].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-0.5 text-caption text-fg-muted">
                {lastRun
                  ? [tr('Last sync {when}', { when: formatRelative(lastRun.at) }) + (lastRun.trigger === 'auto' ? ` ${tr('(automatic)')}` : ''), tr('Posted: {n}', { n: lastRun.posted }), lastRun.failed ? tr('Held back: {n}', { n: lastRun.failed }) : ''].filter(Boolean).join(' · ')
                  : tr('Not synced yet.')}{' '}
                {s.auto ? tr('Syncs by itself once a day.') : ''}
              </p>
            </div>
            <Button leadingIcon={RefreshCwIcon} loading={syncing} disabled={!editable || pending === 0} onClick={sync}>
              Sync now
            </Button>
          </div>

          {missingAll.length > 0 && pending > 0 && (
            <InlineAlert tone="warning" title="Add the missing account codes">
              {tr('Payments that need these wait until you add them below: {codes}', { codes: missingAll.join(', ') })}
            </InlineAlert>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Field id="acct-mode" label="How payments post">
                <Segmented<AccountingPostMode>
                  ariaLabel="How payments post"
                  fullWidth
                  value={s.mode}
                  onChange={(mode) => editable && update((x) => ({ ...x, mode }))}
                  options={[
                    { value: 'each', label: 'Each payment' },
                    { value: 'daily', label: 'One summary a day' },
                  ]}
                />
              </Field>
              <TextInput id="acct-from" label="Sync payments from" type="date" value={s.startFrom} disabled={!editable} hint="Earlier payments stay out, so nothing you already entered by hand is doubled." onChange={(e) => e.target.value && update((x) => ({ ...x, startFrom: e.target.value }))} />
              <Switch id="acct-auto" label="Sync once a day by itself" checked={s.auto} disabled={!editable} onChange={(auto) => update((x) => ({ ...x, auto }))} />
            </div>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-label font-semibold text-fg">{tr('Account codes')}</legend>
              {(Object.keys(accountLabels) as AccountKey[]).map((k) => (
                <TextInput key={k} id={`acct-${k}`} label={accountLabels[k].label} hint={accountLabels[k].hint} value={s.accounts[k] ?? ''} disabled={!editable} onChange={(e) => setAccount(k, e.target.value)} />
              ))}
              {taxAbroad.map((c) => {
                const country = tr(countryInfo(c as CountryCode).name);
                return (
                  <TextInput
                    key={c}
                    id={`acct-vat-${c}`}
                    label={tr('Tax collected — {country}', { country })}
                    hint={tr('Tax you owe {country}’s tax office, kept apart from your own country’s.', { country })}
                    value={s.accounts.vatAbroad?.[c] ?? ''}
                    disabled={!editable}
                    onChange={(e) => setAbroad(c, e.target.value)}
                  />
                );
              })}
              <p className="text-caption text-fg-subtle">{tr('Filled from {tool}’s standard list of accounts. Ask your accountant before changing them.', { tool: accountingProviders[s.provider].name })}</p>
            </fieldset>
          </div>

          {s.runs.length > 0 && (
            <div>
              <h4 className="text-label font-semibold text-fg">{tr('Sync history')}</h4>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {s.runs.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    {r.failed ? <AlertTriangleIcon size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden /> : <CheckCircle2Icon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />}
                    <span className="min-w-0 flex-1 text-label text-fg">
                      {[tr('Posted: {n}', { n: r.posted }), r.failed ? tr('Held back: {n}', { n: r.failed }) : '', formatNgn(r.amountNgn), r.transfers ? tr('Payouts to your bank: {n}', { n: r.transfers }) : '', r.payoutFeesNgn ? tr('Payout fees: {amount}', { amount: formatNgn(r.payoutFeesNgn) }) : ''].filter(Boolean).join(' · ')}
                      {r.problems.length > 0 && <span className="block text-caption text-fg-muted">{r.problems.join(' · ')}</span>}
                    </span>
                    <span className="shrink-0 text-caption text-fg-subtle">{formatRelative(r.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <AccountingConnectDialog
        open={connecting}
        defaultOrganisation={current.name}
        onClose={() => setConnecting(false)}
        onConnect={(provider, organisation) => {
          update((x) => ({ ...x, provider, organisation, connectedAt: new Date().toISOString(), accounts: accountingProviders[provider].defaults }));
          setConnecting(false);
          toast.success(tr('{tool} connected', { tool: accountingProviders[provider].name }), { description: tr('Check the account codes, then sync.') });
        }}
      />
    </Section>
  );
}
