import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, BadgeCheckIcon, LandmarkIcon, PlusIcon, ShieldAlertIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { AutoPayoutMode } from '../../types/money';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMoney } from '../../hooks/useMoney';
import { balances, paidOutToday, payoutBlocker, tierInfo, usableBanks } from '../../utils/money/store';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { SelectInput } from '../../components/ui/SelectInput';
import { TextInput } from '../../components/ui/TextInput';
import { Card } from '../../components/ui/layout/Card';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { PartnerNote } from '../../components/money/PartnerNote';
import { WalletLedger } from '../../components/money/WalletLedger';
import { PayoutDialog } from '../../components/money/PayoutDialog';
import { BankAccountDialog } from '../../components/money/BankAccountDialog';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { isVerified } from '../../utils/money/store';
import { statusLabels, statusTones } from '../../utils/money/kyc';
import { TopUpDialog } from '../../components/money/TopUpDialog';
import { cn } from '../../utils/cn';

const autoOptions: {value: AutoPayoutMode;label: string;}[] = [
{ value: 'off', label: 'Off — I’ll pay out myself' },
{ value: 'daily', label: 'Every day' },
{ value: 'weekly', label: 'Every week' },
{ value: 'threshold', label: 'When it reaches an amount' }];


/** Commerce → Wallet (D92): balances, history, payouts, bank accounts, schedule and limits. */
export function Wallet() {
  const { current } = useWorkspace();
  const { role, me } = useTeam();
  const { data, update } = useMoney(current.id);
  const payPerm = useCan('payouts.manage');
  const canPayout = payPerm.allowed || role === 'admin' && data.adminsCanPayout;
  const noPayoutReason = role === 'admin' ? 'The Owner hasn’t allowed Admins to pay out. They can change this below.' : payPerm.reason;
  const [dialog, setDialog] = useState<'payout' | 'bank' | 'topup' | null>(null);
  const navigate = useNavigate();
  const verified = isVerified(data);
  const [threshold, setThreshold] = useState(String(data.autoPayout.thresholdNgn));

  const b = balances(data);
  const blocker = payoutBlocker(data);
  const tier = tierInfo[data.verification.tier];
  const usedToday = paidOutToday(data);
  const usedPct = tier.dailyPayoutNgn ? Math.min(100, Math.round(usedToday / tier.dailyPayoutNgn * 100)) : 0;
  const total = b.available + b.pending + b.held + b.reserved;
  const capPct = tier.balanceCapNgn ? Math.min(100, Math.round(total / tier.balanceCapNgn * 100)) : 0;
  const actor = me.name || (role === 'owner' ? 'Owner' : 'Admin');

  const guard = (fn: () => void) => () => canPayout ? fn() : toast.error(noPayoutReason);

  const setAuto = (mode: AutoPayoutMode) =>
  guard(() => {
    update((d) => ({ ...d, autoPayout: { ...d.autoPayout, mode, lastRunAt: mode === 'off' ? d.autoPayout.lastRunAt : new Date().toISOString() } }));
    toast.success(mode === 'off' ? 'Automatic payouts off' : 'Automatic payouts on', { description: mode === 'off' ? undefined : 'Scheduled payouts are free and go to your main account.' });
  })();

  const saveThreshold = () => {
    const v = Number(threshold) || 0;
    if (v < 5000) return toast.error('Choose at least ₦5,000');
    update((d) => ({ ...d, autoPayout: { ...d.autoPayout, thresholdNgn: v } }));
    toast.success(`Pays out when you reach ${formatNgn(v)}`);
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Money from wallet and escrow sales, payment links and top-ups. Pay out to your bank whenever you like."
        actions={
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDialog('topup')}>
              Top up
            </Button>
            <Button leadingIcon={LandmarkIcon} onClick={guard(() => blocker ? toast.error(blocker) : setDialog('payout'))}>
              Pay out
            </Button>
          </div>
        } />
      
      <PartnerNote className="mt-6" />

      {!verified && !data.frozen &&
      <InlineAlert
        className="mt-4"
        tone={data.kyc.status === 'needs_info' || data.kyc.status === 'rejected' ? 'warning' : 'info'}
        title={data.kyc.status === 'in_review' ? 'Payouts start once your verification is approved' : data.kyc.status === 'needs_info' ? 'KUBICU asked for changes to your verification' : data.kyc.status === 'rejected' ? 'Your verification wasn’t approved' : 'Verify your business to turn on payouts'}
        action={
        data.kyc.status !== 'in_review' ?
        <Button size="sm" onClick={() => navigate('/app/commerce/verification')}>
                {data.kyc.status === 'not_started' ? 'Start verification' : data.kyc.status === 'needs_info' ? 'Fix what was asked' : 'Continue'}
              </Button> :
        undefined
        }>
        
          Sales keep arriving in your wallet. Takes about 10 minutes — have your BVN, NIN, a photo ID and proof of address ready{data.kyc.entity && data.kyc.entity !== 'individual' ? ', plus your CAC documents' : ''}.
        </InlineAlert>
      }

      {data.frozen &&
      <p className="mt-4 flex items-start gap-2 rounded-md bg-danger-soft px-4 py-3 text-label text-danger" role="alert">
          <ShieldAlertIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Payouts are paused by KUBICU.</span> {data.frozen.reason} Sales still arrive as normal. Contact support from Help if you think this is a mistake.
          </span>
        </p>
      }
      {b.available < 0 &&
      <p className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-soft px-4 py-3 text-label text-warning" role="alert">
          <span className="flex items-center gap-2">
            <AlertTriangleIcon size={16} aria-hidden /> Refunds took your available balance to {formatNgn(b.available)}. Top up to cover it — payouts are paused until then.
          </span>
          <Button size="sm" variant="secondary" onClick={() => setDialog('topup')}>
            Top up {formatNgn(-b.available)}
          </Button>
        </p>
      }

      <section aria-label="Balances" className="mt-6 rounded-lg border border-line bg-raised p-5 md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <dl>
            <Stat primary label="Available to pay out" value={formatNgn(Math.max(0, b.available))} hint={blocker && b.available >= 1000 ? blocker : `Up to ${formatNgn(Math.max(0, tier.dailyPayoutNgn - usedToday))} more today`} />
          </dl>
          <StatGroup columns={3} className="lg:min-w-[480px]">
            <Stat label="Settling" value={formatNgn(b.pending)} hint="Available within 24 hours" />
            <Stat label="Held in escrow" value={formatNgn(b.held)} hint="Released after delivery" />
            <Stat label="Reserved" value={formatNgn(b.reserved)} hint="Open disputes" />
          </StatGroup>
        </div>
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <WalletLedger data={data} />

        <div className="flex flex-col gap-6">
          <Card
            title="Bank accounts"
            body="flush"
            actions={
            <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={guard(() => setDialog('bank'))}>
                Add
              </Button>
            }>
            
            {data.banks.length === 0 ?
            <p className="px-5 pb-5 text-label text-fg-muted md:px-6">Add an account in your business’s name to start paying out.</p> :

            <ul className="divide-y divide-line border-t border-line">
                {data.banks.map((bank) => {
                const waiting = !usableBanks(data).some((u) => u.id === bank.id) && bank.nameMatch !== 'mismatch';
                return (
                  <li key={bank.id} className="flex items-start gap-3 px-5 py-3.5 md:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                          {bank.bankName} ····{bank.last4}
                          {bank.primary && <Badge tone="action">Main</Badge>}
                        </span>
                        <span className="block truncate text-caption text-fg-subtle">{bank.accountName}</span>
                        <span className={cn('mt-1 flex items-center gap-1 text-caption', waiting ? 'text-warning' : bank.nameMatch === 'match' ? 'text-success' : 'text-warning')}>
                          {waiting ? `Safety wait — usable ${formatRelative(bank.usableAt)}` : bank.nameMatch === 'match' ?
                        <>
                              <BadgeCheckIcon size={13} aria-hidden /> Name matches your business
                            </> :

                        'Name partly matches — payouts may be checked'
                        }
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-1">
                        {!bank.primary &&
                      <Button size="sm" variant="tertiary" leadingIcon={StarIcon} aria-label={`Make ${bank.bankName} ····${bank.last4} your main account`} onClick={guard(() => update((d) => ({ ...d, banks: d.banks.map((x) => ({ ...x, primary: x.id === bank.id })) })))}>
                            Main
                          </Button>
                      }
                        {data.banks.length > 1 &&
                      <Button
                        size="sm"
                        variant="tertiary"
                        leadingIcon={Trash2Icon}
                        aria-label={`Remove ${bank.bankName} ····${bank.last4}`}
                        onClick={guard(() => {
                          update((d) => {
                            const rest = d.banks.filter((x) => x.id !== bank.id);
                            return { ...d, banks: bank.primary && rest.length ? rest.map((x, i) => ({ ...x, primary: i === 0 })) : rest };
                          });
                          toast('Bank account removed');
                        })} />

                      }
                      </span>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card title="Automatic payouts" description="Scheduled payouts are free and go to your main account.">
            <div className="flex flex-col gap-4">
              <SelectInput id="auto-mode" label="Pay out" value={data.autoPayout.mode} options={autoOptions} onChange={setAuto} disabled={!canPayout} />
              {data.autoPayout.mode === 'threshold' &&
              <div className="flex items-end gap-2">
                  <TextInput id="auto-threshold" label="When available reaches" prefix="₦" inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))} fieldClassName="flex-1" />
                  <Button variant="secondary" onClick={guard(saveThreshold)}>
                    Save
                  </Button>
                </div>
              }
              {data.autoPayout.lastRunAt && data.autoPayout.mode !== 'off' && <p className="text-caption text-fg-subtle">Last checked {formatTimestamp(data.autoPayout.lastRunAt)}</p>}
            </div>
          </Card>

          <Card title="Verification & limits">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-label font-semibold text-fg">{tier.label}</span>
                  <span className="block text-caption text-fg-subtle">{tier.checks}</span>
                </span>
                {verified ?
                <Badge tone="success" icon={BadgeCheckIcon}>
                    Verified
                  </Badge> :

                <Badge tone={statusTones[data.kyc.status]}>{statusLabels[data.kyc.status]}</Badge>
                }
              </div>
              {verified ?
              <>
                  <Meter label="Paid out today" value={`${formatNgn(usedToday)} of ${formatNgn(tier.dailyPayoutNgn)}`} pct={usedPct} />
                  {tier.balanceCapNgn && <Meter label="Wallet balance" value={`${formatNgn(total)} of ${formatNgn(tier.balanceCapNgn)}`} pct={capPct} />}
                </> :

              tier.balanceCapNgn && <Meter label="Wallet balance before verifying" value={`${formatNgn(total)} of ${formatNgn(tier.balanceCapNgn)}`} pct={capPct} />
              }
              <Link to="/app/commerce/verification" className="inline-flex h-10 items-center justify-center rounded-md border border-line-strong bg-raised px-4 text-label font-medium text-fg transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {verified ? 'View verification' : data.kyc.status === 'in_review' ? 'See review status' : data.kyc.status === 'needs_info' ? 'Fix what was asked' : data.kyc.status === 'not_started' ? 'Verify your business' : 'Continue verification'}
              </Link>
            </div>
          </Card>

          <Card title="Who can pay out">
            <Switch
              id="admins-payout"
              checked={data.adminsCanPayout}
              disabled={role !== 'owner'}
              onChange={(v) => {
                update((d) => ({ ...d, adminsCanPayout: v }));
                toast.success(v ? 'Admins can now pay out' : 'Only you can pay out');
              }}
              label="Let Admins pay out"
              description="Every payout and bank change still needs the person’s password and two-step code. Only the Owner can change this." />
            
          </Card>
        </div>
      </div>

      <PayoutDialog open={dialog === 'payout'} onClose={() => setDialog(null)} data={data} update={update} by={actor} />
      <BankAccountDialog open={dialog === 'bank'} onClose={() => setDialog(null)} data={data} update={update} businessName={current.name} />
      <TopUpDialog open={dialog === 'topup'} onClose={() => setDialog(null)} update={update} businessName={current.name} workspaceId={current.id} suggested={b.available < 0 ? -b.available : undefined} />
    </>);

}

function Meter({ label, value, pct }: {label: string;value: string;pct: number;}) {
  const state = pct >= 100 ? 'Full' : pct >= 80 ? 'Nearly full' : null;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-caption">
        <span className="text-fg-muted">{label}</span>
        <span className="tabular-nums text-fg">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${pct}% used${state ? ` · ${state}` : ''}`}>
        <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-action')} style={{ width: `${pct}%` }} />
      </div>
    </div>);

}