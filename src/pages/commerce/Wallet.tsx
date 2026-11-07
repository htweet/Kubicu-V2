import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, BadgeCheckIcon, LandmarkIcon, PlusIcon, ShieldAlertIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { AutoPayoutMode } from '../../types/money';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { useMoney } from '../../hooks/useMoney';
import { balances, paidOutToday, payoutBlocker, payoutTier, starterEligible, starterMissing, starterReady, tierInfo, usableBanks } from '../../utils/money/store';
import { kycRules, verifiedName } from '../../utils/money/kyc';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { activeCurrency, currencyInfo, currencySymbol, isNaira, withSymbol } from '../../utils/currency';
import { activeCountry, activeCountryInfo } from '../../utils/country';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { SelectInput } from '../../components/ui/SelectInput';
import { TextInput } from '../../components/ui/TextInput';
import { Card } from '../../components/ui/layout/Card';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { List } from '../../components/ui/layout/ListRow';
import { PartnerNote } from '../../components/money/PartnerNote';
import { WalletLedger } from '../../components/money/WalletLedger';
import { PayoutDialog } from '../../components/money/PayoutDialog';
import { BankAccountDialog } from '../../components/money/BankAccountDialog';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { isVerified } from '../../utils/money/store';
import { statusLabels, statusTones } from '../../utils/money/kyc';
import { TopUpDialog } from '../../components/money/TopUpDialog';
import { cn } from '../../utils/cn';

const autoOptions: { value: AutoPayoutMode; label: string }[] = [
  { value: 'off', label: 'Off — I’ll pay out myself' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'threshold', label: 'When it reaches an amount' },
];

/** Commerce → Wallet (D92): balances, history, payouts, bank accounts, schedule and limits. Follows the interface language (D133q). */
export function Wallet() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const { role, me, myBranchId } = useTeam();
  const { data, update } = useMoney(current.id);
  const payPerm = useCan('payouts.manage');
  const canPayout = payPerm.allowed || (role === 'admin' && data.adminsCanPayout);
  const noPayoutReason = role === 'admin' ? tr('The Owner hasn’t allowed Admins to pay out. They can change this below.') : tr(payPerm.reason ?? '');
  const [dialog, setDialog] = useState<'payout' | 'bank' | 'topup' | null>(null);
  const navigate = useNavigate();
  const verified = isVerified(data);
  const [threshold, setThreshold] = useState(String(data.autoPayout.thresholdNgn));

  const b = balances(data);
  const blocker = payoutBlocker(data);
  const starter = starterReady(data);
  const tier = tierInfo[payoutTier(data)];
  const missing = verified || starter || data.kyc.status === 'rejected' || !starterEligible(data) ? [] : starterMissing(data);
  const usedToday = paidOutToday(data);
  const usedPct = tier.dailyPayoutNgn ? Math.min(100, Math.round((usedToday / tier.dailyPayoutNgn) * 100)) : 0;
  const total = b.available + b.pending + b.held + b.reserved;
  const capPct = tier.balanceCapNgn ? Math.min(100, Math.round((total / tier.balanceCapNgn) * 100)) : 0;
  const actor = me.name || (role === 'owner' ? 'Owner' : 'Admin');
  const ofLine = (a: number, cap: number) => tr('{amount} of {cap}', { amount: formatNgn(a), cap: formatNgn(cap) });

  const guard = (fn: () => void) => () => (canPayout ? fn() : toast.error(noPayoutReason));

  const setAuto = (mode: AutoPayoutMode) =>
    guard(() => {
      update((d) => ({ ...d, autoPayout: { ...d.autoPayout, mode, lastRunAt: mode === 'off' ? d.autoPayout.lastRunAt : new Date().toISOString() } }));
      toast.success(tr(mode === 'off' ? 'Automatic payouts off' : 'Automatic payouts on'), { description: mode === 'off' ? undefined : tr('Scheduled payouts are free and go to your main account.') });
    })();

  const saveThreshold = () => {
    const v = Number(threshold) || 0;
    if (v < 5000) return toast.error(withSymbol(tr('Choose at least ₦5,000')));
    update((d) => ({ ...d, autoPayout: { ...d.autoPayout, thresholdNgn: v } }));
    toast.success(tr('Pays out when you reach {amount}', { amount: formatNgn(v) }));
  };

  const kycTitle =
    data.kyc.status === 'in_review'
      ? 'Payouts start once your verification is approved'
      : data.kyc.status === 'needs_info'
        ? 'KUBICU asked for changes to your verification'
        : data.kyc.status === 'rejected'
          ? 'Your verification wasn’t approved'
          : 'Verify your business to turn on payouts';

  // The wallet holds the whole business's money, so a teammate limited to one location doesn't see it (D482).
  if (myBranchId)
    return (
      <>
        <PageHeader title={tr('Wallet')} />
        <InlineAlert className="mt-6" tone="info" title={tr('The wallet covers the whole business')}>
          {tr('You work at one location, so balances and payouts are only shown to the owner and admins. Your location’s sales are in the Sales report.')}
        </InlineAlert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/app/commerce/reports')}>
            {tr('Open Sales report')}
          </Button>
        </div>
      </>
    );

  return (
    <>
      <PageHeader
        title={tr('Wallet')}
        description={tr('Money from wallet and escrow sales, payment links and top-ups. Pay out to your bank whenever you like.')}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDialog('topup')}>
              {tr('Top up')}
            </Button>
            <Button leadingIcon={LandmarkIcon} onClick={guard(() => (blocker ? toast.error(tr(blocker)) : setDialog('payout')))}>
              {tr('Pay out')}
            </Button>
          </div>
        }
      />
      <PartnerNote className="mt-6" />

      {!isNaira() && (
        <InlineAlert className="mt-4" tone="info" title={tr('Payouts in {currency} are simulated', { currency: tr(currencyInfo(activeCurrency()).name) })}>
          {activeCountryInfo().currency === activeCurrency()
            ? tr('Your balance is kept in your currency. You can add a {country} payout account, but no money moves until KUBICU has a payment partner there.', { country: tr(activeCountryInfo().name) })
            : tr('Your balance is kept in your currency. Paying out to Nigerian banks only works in naira — a payout account in your country is added once KUBICU has a payment partner there.')}
        </InlineAlert>
      )}

      {!verified && !data.frozen && (
        <InlineAlert
          className="mt-4"
          tone={data.kyc.status === 'needs_info' || data.kyc.status === 'rejected' ? 'warning' : 'info'}
          title={tr(kycTitle)}
          action={
            data.kyc.status !== 'in_review' ? (
              <Button size="sm" onClick={() => navigate('/app/commerce/verification')}>
                {tr(data.kyc.status === 'not_started' ? 'Start verification' : data.kyc.status === 'needs_info' ? 'Fix what was asked' : 'Continue')}
              </Button>
            ) : undefined
          }
        >
          {starter
            ? tr('Starter payouts are on — up to {n} a day to your own account. Finish verification for higher limits.', { n: formatNgn(tierInfo[1].dailyPayoutNgn) })
            : activeCountry() === 'NG'
              ? tr(
                  data.kyc.entity && data.kyc.entity !== 'individual'
                    ? 'Sales keep arriving in your wallet. Takes about 10 minutes — have your BVN, NIN, a photo ID and proof of address ready, plus your CAC documents.'
                    : 'Sales keep arriving in your wallet. Takes about 10 minutes — have your BVN, NIN, a photo ID and proof of address ready.',
                )
              : // Other countries name their own numbers and registry (D425).
                tr(
                  data.kyc.entity && data.kyc.entity !== 'individual'
                    ? 'Sales keep arriving in your wallet. Takes about 10 minutes — have your {ids}, a photo ID and proof of address ready, plus your {registry} documents.'
                    : 'Sales keep arriving in your wallet. Takes about 10 minutes — have your {ids}, a photo ID and proof of address ready.',
                  { ids: [kycRules().primary.label, kycRules().secondary?.label].filter(Boolean).join(tr(' and ')), registry: kycRules().registry.short },
                )}
        </InlineAlert>
      )}

      {data.frozen && (
        <p className="mt-4 flex items-start gap-2 rounded-md bg-danger-soft px-4 py-3 text-label text-danger" role="alert">
          <ShieldAlertIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">{tr('Payouts are paused by KUBICU.')}</span> {data.frozen.reason} {tr('Sales still arrive as normal. Contact support from Help if you think this is a mistake.')}
          </span>
        </p>
      )}
      {b.available < 0 && (
        <p className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-soft px-4 py-3 text-label text-warning" role="alert">
          <span className="flex items-center gap-2">
            <AlertTriangleIcon size={16} aria-hidden /> {tr('Refunds took your available balance to {amount}. Top up to cover it — payouts are paused until then.', { amount: formatNgn(b.available) })}
          </span>
          <Button size="sm" variant="secondary" onClick={() => setDialog('topup')}>
            {tr('Top up {amount}', { amount: formatNgn(-b.available) })}
          </Button>
        </p>
      )}

      <Card emphasis="primary" as="div" className="mt-6">
        <div role="group" aria-label={tr('Balances')} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <dl>
            <Stat
              primary
              label={tr('Available to pay out')}
              value={formatNgn(Math.max(0, b.available))}
              hint={blocker && b.available >= 1000 ? tr(blocker) : tr('Up to {amount} more today', { amount: formatNgn(Math.max(0, tier.dailyPayoutNgn - usedToday)) })}
            />
          </dl>
          <StatGroup columns={3} className="lg:min-w-[480px]">
            <Stat label={tr('Settling')} value={formatNgn(b.pending)} hint={tr('Available within 24 hours')} />
            <Stat label={tr('Held in escrow')} value={formatNgn(b.held)} hint={tr('Released after delivery')} />
            <Stat label={tr('Reserved')} value={formatNgn(b.reserved)} hint={tr('Open disputes')} />
          </StatGroup>
        </div>
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <WalletLedger data={data} />

        <div className="flex flex-col gap-6">
          <Card
            title={tr('Bank accounts')}
            body="flush"
            actions={
              <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={guard(() => setDialog('bank'))}>
                {tr('Add')}
              </Button>
            }
          >
            {data.banks.length === 0 ? (
              <p className="px-5 py-4 text-label text-fg-muted md:px-6">{tr('Add an account in your business’s name to start paying out.')}</p>
            ) : (
              <List label={tr('Bank accounts')}>
                {data.banks.map((bank) => {
                  const waiting = !usableBanks(data).some((u) => u.id === bank.id) && bank.nameMatch !== 'mismatch';
                  const acct = `${bank.bankName} ····${bank.last4}`;
                  return (
                    <li key={bank.id} className="flex items-start gap-3 px-5 py-3.5 md:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                          {acct}
                          {bank.primary && <Badge tone="action">{tr('Main')}</Badge>}
                        </span>
                        <span className="block truncate text-caption text-fg-subtle">{bank.accountName}</span>
                        <span className={cn('mt-1 flex items-center gap-1 text-caption', waiting ? 'text-warning' : bank.nameMatch === 'match' ? 'text-success' : 'text-warning')}>
                          {waiting ? (
                            tr('Safety wait — usable {when}', { when: formatRelative(bank.usableAt) })
                          ) : bank.nameMatch === 'match' ? (
                            <>
                              <BadgeCheckIcon size={13} aria-hidden /> {tr('Name matches your business')}
                            </>
                          ) : (
                            tr('Name partly matches — payouts may be checked')
                          )}
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-1">
                        {!bank.primary && (
                          <Button
                            size="sm"
                            variant="tertiary"
                            leadingIcon={StarIcon}
                            aria-label={tr('Make {account} your main account', { account: acct })}
                            onClick={guard(() => update((d) => ({ ...d, banks: d.banks.map((x) => ({ ...x, primary: x.id === bank.id })) })))}
                          >
                            {tr('Main')}
                          </Button>
                        )}
                        {data.banks.length > 1 && (
                          <Button
                            size="sm"
                            variant="tertiary"
                            leadingIcon={Trash2Icon}
                            aria-label={tr('Remove {name}', { name: acct })}
                            onClick={guard(() => {
                              update((d) => {
                                const rest = d.banks.filter((x) => x.id !== bank.id);
                                return { ...d, banks: bank.primary && rest.length ? rest.map((x, i) => ({ ...x, primary: i === 0 })) : rest };
                              });
                              toast(tr('Bank account removed'));
                            })}
                          />
                        )}
                      </span>
                    </li>
                  );
                })}
              </List>
            )}
          </Card>

          <Card title={tr('Automatic payouts')} description={tr('Scheduled payouts are free and go to your main account.')}>
            <div className="flex flex-col gap-4">
              <SelectInput id="auto-mode" label={tr('Pay out')} value={data.autoPayout.mode} options={autoOptions.map((o) => ({ ...o, label: tr(o.label) }))} onChange={setAuto} disabled={!canPayout} />
              {data.autoPayout.mode === 'threshold' && (
                <div className="flex items-end gap-2">
                  <TextInput id="auto-threshold" label={tr('When available reaches')} prefix={currencySymbol()} inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))} fieldClassName="flex-1" />
                  <Button variant="secondary" onClick={guard(saveThreshold)}>
                    {tr('Save')}
                  </Button>
                </div>
              )}
              {data.autoPayout.lastRunAt && data.autoPayout.mode !== 'off' && <p className="text-caption text-fg-subtle">{tr('Last checked {date}', { date: formatTimestamp(data.autoPayout.lastRunAt) })}</p>}
            </div>
          </Card>

          <Card title={tr('Verification & limits')}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-label font-semibold text-fg">{tr(tier.label)}</span>
                  <span className="block text-caption text-fg-subtle">{tr(tier.checks)}</span>
                </span>
                {verified ? (
                  <Badge tone="success" icon={BadgeCheckIcon}>
                    {tr('Verified')}
                  </Badge>
                ) : starter ? (
                  <Badge tone="info">{tr('Starter')}</Badge>
                ) : (
                  <Badge tone={statusTones[data.kyc.status]}>{tr(statusLabels[data.kyc.status])}</Badge>
                )}
              </div>
              {verified || starter ? (
                <>
                  <Meter label={tr('Paid out today')} value={ofLine(usedToday, tier.dailyPayoutNgn)} pct={usedPct} />
                  {tier.balanceCapNgn && <Meter label={tr(starter ? 'Wallet balance before full verification' : 'Wallet balance')} value={ofLine(total, tier.balanceCapNgn)} pct={capPct} />}
                </>
              ) : (
                tier.balanceCapNgn && <Meter label={tr('Wallet balance before verifying')} value={ofLine(total, tier.balanceCapNgn)} pct={capPct} />
              )}
              {missing.length > 0 && (
                <div className="rounded-md bg-sunken px-3 py-2.5">
                  <p className="text-label font-medium text-fg">{tr('Start small payouts — up to {n} a day', { n: formatNgn(tierInfo[1].dailyPayoutNgn) })}</p>
                  <p className="mt-0.5 text-caption text-fg-muted">{activeCountry() === 'NG' ? tr('No CAC or address proof needed yet. Still to do:') : tr('No business documents or address proof needed yet. Still to do:')}</p>
                  <ul className="mt-1.5 list-disc pl-5 text-caption text-fg-muted">
                    {missing.map((m) => (
                      <li key={m}>{tr(m)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {starter && (
                <p className="text-caption text-fg-subtle">
                  {tr('Payouts go only to your account in your own name. Finish verification to raise your limit to {ind} a day, or {biz} as a registered business.', { ind: formatNgn(tierInfo[2].dailyPayoutNgn), biz: formatNgn(tierInfo[3].dailyPayoutNgn) })}
                </p>
              )}
              <Link to="/app/commerce/verification" className="inline-flex h-10 items-center justify-center rounded-md border border-line-strong bg-raised px-4 text-label font-medium text-fg transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {tr(verified ? 'View verification' : data.kyc.status === 'in_review' ? 'See review status' : data.kyc.status === 'needs_info' ? 'Fix what was asked' : data.kyc.status === 'not_started' ? 'Verify your business' : 'Continue verification')}
              </Link>
            </div>
          </Card>

          <Card title={tr('Who can pay out')}>
            <Switch
              id="admins-payout"
              checked={data.adminsCanPayout}
              disabled={role !== 'owner'}
              onChange={(v) => {
                update((d) => ({ ...d, adminsCanPayout: v }));
                toast.success(tr(v ? 'Admins can now pay out' : 'Only you can pay out'));
              }}
              label={tr('Let Admins pay out')}
              description={tr('Every payout and bank change still needs the person’s password and two-step code. Only the Owner can change this.')}
            />
          </Card>
        </div>
      </div>

      <PayoutDialog open={dialog === 'payout'} onClose={() => setDialog(null)} data={data} update={update} by={actor} />
      <BankAccountDialog open={dialog === 'bank'} onClose={() => setDialog(null)} data={data} update={update} businessName={verifiedName(data.kyc) || current.name} />
      <TopUpDialog open={dialog === 'topup'} onClose={() => setDialog(null)} update={update} businessName={current.name} workspaceId={current.id} suggested={b.available < 0 ? -b.available : undefined} />
    </>
  );
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  const { t: tr } = useT();
  const state = pct >= 100 ? tr('Full') : pct >= 80 ? tr('Nearly full') : null;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-caption">
        <span className="text-fg-muted">{label}</span>
        <span className="tabular-nums text-fg">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${tr('{n}% used', { n: pct })}${state ? ` · ${state}` : ''}`}>
        <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-action')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
