import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BadgeCheckIcon, CheckCircle2Icon, LandmarkIcon, LockIcon, PhoneIcon, ShieldCheckIcon } from 'lucide-react';
import type { Partnership } from '../types/partnership';
import { useLocalStore } from '../hooks/useLocalStore';
import { acceptInvite, answerChange, declineInvite, emptyPartnerships, ev, findByToken, guestReady, isExpired, partnershipKey, statusLabels } from '../utils/partnerships';
import { isMobileNumber } from '../utils/members';
import { splitPhone } from '../utils/phone';
import { accountNumberIssue, countryInfo } from '../utils/country';
import { kycRules } from '../utils/money/kyc';
import { formatDate } from '../utils/format';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { InlineAlert } from '../components/ui/InlineAlert';
import { Badge } from '../components/ui/Badge';
import { AgreementSummary } from '../components/partners/AgreementSummary';
import { PartnerAvatar } from '../components/partners/PartnerAvatar';
import { SplitExplainer } from '../components/partners/SplitExplainer';
import { PartnerSales } from '../components/partners/PartnerSales';
import { readCommerce } from '../utils/commerce/storage';

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'Kuda', 'Moniepoint', 'OPay', 'PalmPay', 'Stanbic IBTC', 'UBA', 'Wema Bank', 'Zenith Bank'];

/** A guest partner's page, from their invite link (D120). No KUBICU account needed. */
export function PartnerPortal() {
  const { token = '' } = useParams();
  const found = useMemo(() => findByToken(token), [token]);
  if (!found) return <Shell><NotFoundCard /></Shell>;
  return <Portal workspaceId={found.workspaceId} token={token} />;
}

function Portal({ workspaceId, token }: {workspaceId: string;token: string;}) {
  const store = useLocalStore(partnershipKey(workspaceId), emptyPartnerships);
  const p = store.data.partnerships.find((x) => x.token === token);
  const leadName = useMemo(() => {
    try {
      const raw = window.localStorage.getItem('kubicu.workspaces');
      const list = raw ? JSON.parse(raw) as {id: string;name: string;}[] : [];
      return list.find((w) => w.id === workspaceId)?.name ?? 'Your partner';
    } catch {
      return 'Your partner';
    }
  }, [workspaceId]);

  if (!p) return <Shell><NotFoundCard /></Shell>;
  // The lead's orders, read-only, so the guest can see their share of bundle sales (D122).
  const lead = readCommerce(workspaceId);
  const save = (next: Partnership) => store.update((d) => ({ ...d, partnerships: d.partnerships.map((x) => x.id === next.id ? next : x) }));
  const expired = isExpired(p);

  return (
    <Shell>
      <header className="flex items-center gap-4">
        <PartnerAvatar partner={{ name: leadName, verified: true }} size="lg" />
        <div className="min-w-0">
          <p className="text-caption text-fg-muted">Partner page</p>
          <h1 className="text-title font-semibold text-fg">
            {leadName} × {p.partner.name}
          </h1>
          <p className="text-caption text-fg-muted">For {p.contactName} · {statusLabels[p.status]}</p>
        </div>
      </header>

      {p.status === 'invited' && !expired &&
      <section aria-labelledby="pp-invite" className="flex flex-col gap-5 rounded-lg border border-line bg-raised p-5">
          <h2 id="pp-invite" className="text-heading font-semibold text-fg">
            {leadName} wants to work with you
          </h2>
          <p className="text-label text-fg-muted">You’d sell together on one page and each be paid your own part straight away. You don’t need a KUBICU account. Read what you’re agreeing to:</p>
          <SplitExplainer leadName={leadName} partnerName={p.partner.name} leadSharePct={p.agreement.leadSharePct} viewer="partner" />
          <p className="text-caption text-fg-muted">{leadName} suggested this split. If it doesn’t feel right, talk to them before accepting — they can send new terms, and nothing changes until you both agree.</p>
          <AgreementSummary agreement={p.agreement} leadName={leadName} partnerName={p.partner.name} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => {save(acceptInvite(p));toast.success('You’re working together', { description: 'Next, confirm your phone and add your bank so you can be paid.' });}}>Accept and continue</Button>
            <Button variant="tertiary" onClick={() => {save(declineInvite(p));toast('Invite declined');}}>No, thanks</Button>
          </div>
        </section>
      }
      {expired && <InlineAlert tone="warning" title="This invite link has expired">Ask {leadName} to send you a new one on WhatsApp.</InlineAlert>}
      {p.status === 'declined' && <InlineAlert tone="info" title="You declined this invite">If you change your mind, ask {leadName} to invite you again.</InlineAlert>}
      {p.status === 'ended' && <InlineAlert tone="info" title="This partnership has ended">{p.endReason ?? ''} Money already paid to you still settles normally.</InlineAlert>}
      {p.status === 'ending' && p.endsAt && <InlineAlert tone="warning" title={`Ending on ${formatDate(p.endsAt)}`}>{p.endReason}.</InlineAlert>}

      {(p.status === 'active' || p.status === 'ending') &&
      <>
          {p.pending && p.pending.by === 'lead' &&
        <section aria-label="New terms" className="flex flex-col gap-4 rounded-lg border border-warning/40 bg-warning-soft/40 p-5">
              <p className="text-label font-semibold text-fg">{leadName} proposed new terms</p>
              <AgreementSummary agreement={p.pending.agreement} leadName={leadName} partnerName={p.partner.name} title="Proposed" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => {save(answerChange(p, 'partner', true));toast.success('New terms accepted');}}>Accept</Button>
                <Button size="sm" variant="tertiary" onClick={() => {save(answerChange(p, 'partner', false));toast('Proposal turned down');}}>Turn down</Button>
              </div>
            </section>
        }
          <GettingPaid p={p} save={save} />
          <section aria-labelledby="pp-agreement" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="pp-agreement" className="sr-only">
              Agreement
            </h2>
            <SplitExplainer leadName={leadName} partnerName={p.partner.name} leadSharePct={p.agreement.leadSharePct} viewer="partner" compact className="mb-5" />
            <AgreementSummary agreement={p.agreement} leadName={leadName} partnerName={p.partner.name} />
          </section>
          <section aria-labelledby="pp-sales" className="flex flex-col gap-4 rounded-lg border border-line bg-raised p-5">
            <div>
              <h2 id="pp-sales" className="text-label font-semibold text-fg">
                Your sales and payouts
              </h2>
              <p className="mt-1 text-caption text-fg-muted">Your share is split off the moment a customer pays and sent to your bank once delivery is confirmed.</p>
            </div>
            <PartnerSales partnershipId={p.id} orders={lead?.orders ?? []} products={lead?.products ?? []} leadName={leadName} partnerName={p.partner.name} viewer="partner" />
          </section>
        </>
      }
    </Shell>);

}

function GettingPaid({ p, save }: {p: Partnership;save: (p: Partnership) => void;}) {
  // A guest has no workspace: their country comes from their phone number's code (D428), so banks, account
  // length and the ID check are their own country's, using the same rules as seller verification.
  const country = splitPhone(p.phone).country;
  const info = countryInfo(country);
  const rules = kycRules(country);
  const banks = country === 'NG' ? BANKS : info.banks;
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [bank, setBank] = useState(country === 'NG' ? BANKS[2] : info.banks[0]);
  const [account, setAccount] = useState('');
  const [bvn, setBvn] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const phoneOk = !!p.guest?.phoneVerifiedAt;

  const confirmPhone = () => {
    if (!/^\d{6}$/.test(code) || code === '000000') return setErr('That code didn’t work. Check the text and try again.');
    setErr(null);
    save({ ...p, guest: { ...p.guest, phoneVerifiedAt: new Date().toISOString() }, events: [ev('partner', 'Confirmed their phone'), ...p.events] });
    toast.success('Phone confirmed');
  };

  const addBank = () => {
    const acctIssue = accountNumberIssue(account, country);
    if (country === 'NG' ? !/^\d{10}$/.test(account) : acctIssue) return setErr(country === 'NG' ? 'Account numbers have 10 digits.' : acctIssue ?? '');
    if (country === 'NG' ? !/^\d{11}$/.test(bvn) : !rules.primary.pattern.test(bvn.trim())) return setErr(country === 'NG' ? 'Your BVN has 11 digits. Dial *565*0# to get it.' : rules.primary.formatError);
    setErr(null);
    setBusy(true);
    // Simulated name lookup: the account name comes back as the invited person's name.
    window.setTimeout(() => {
      const accountName = p.contactName.toUpperCase();
      save({ ...p, guest: { ...p.guest, bank: { bankName: bank, last4: account.slice(-4), accountName, bvnLast4: bvn.replace(/[^0-9A-Z]/gi, '').slice(-4), verifiedAt: new Date().toISOString() } }, events: [ev('partner', `Added ${bank} ····${account.slice(-4)} for payouts`), ...p.events] });
      setBusy(false);
      toast.success('Bank added', { description: country === 'NG' ? `${accountName} matches your BVN.` : `${accountName} matches your ${rules.primary.label}.` });
    }, 700);
  };

  if (guestReady(p))
  return (
    <InlineAlert tone="success" title="You’re ready to be paid">
        Payouts go to {p.guest?.bank?.bankName} ····{p.guest?.bank?.last4} ({p.guest?.bank?.accountName}).
      </InlineAlert>);


  return (
    <section aria-labelledby="pp-paid" className="flex flex-col gap-5 rounded-lg border border-line bg-raised p-5">
      <div>
        <h2 id="pp-paid" className="text-heading font-semibold text-fg">
          Get ready to be paid
        </h2>
        <p className="mt-1 text-label text-fg-muted">Two quick steps. Your money is held by our licensed payment partner until it’s sent to your bank.</p>
      </div>
      {err && <InlineAlert tone="danger" title={err} />}

      <div className="flex gap-4">
        <StepIcon done={phoneOk} icon={PhoneIcon} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-label font-semibold text-fg">Confirm your phone</p>
          {phoneOk ?
          <p className="text-caption text-fg-muted">{p.phone} confirmed</p> :
          !codeSent ?
          <Button size="sm" variant="secondary" className="self-start" disabled={!isMobileNumber(p.phone)} onClick={() => {setCodeSent(true);toast(`Code sent to ${p.phone}`, { description: 'Prototype: any 6 digits except 000000.' });}}>
              Text me a code
            </Button> :

          <div className="flex flex-wrap items-end gap-2">
              <TextInput id="pp-code" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} fieldClassName="w-40" />
              <Button onClick={confirmPhone}>Confirm</Button>
            </div>
          }
        </div>
      </div>

      <div className="flex gap-4 border-t border-line pt-5">
        <StepIcon done={!!p.guest?.bank} icon={LandmarkIcon} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-label font-semibold text-fg">Add the bank account to pay you</p>
          {!phoneOk ?
          <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
              <LockIcon size={12} aria-hidden /> Confirm your phone first
            </p> :

          <>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput<string> id="pp-bank" label="Bank" value={bank} onChange={setBank} options={banks.map((b) => ({ value: b, label: b }))} required />
                <TextInput id="pp-acct" label="Account number" inputMode="numeric" maxLength={info.accountNumber.max} value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))} />
              </div>
              <TextInput
              id="pp-bvn"
              label={rules.primary.label}
              inputMode={rules.primary.numeric ? 'numeric' : 'text'}
              maxLength={rules.primary.maxLength}
              placeholder={rules.primary.placeholder || undefined}
              value={bvn}
              onChange={(e) => setBvn(rules.primary.numeric ? e.target.value.replace(/\D/g, '') : e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              hint="Used once to check the account is in your name. We never see your bank balance." />
            
              <Button className="self-start" loading={busy} onClick={addBank}>
                Check and add
              </Button>
            </>
          }
        </div>
      </div>
    </section>);

}

function StepIcon({ done, icon: Icon }: {done: boolean;icon: typeof PhoneIcon;}) {
  return (
    <span className={done ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-fg-muted'} aria-hidden>
      {done ? <CheckCircle2Icon size={18} /> : <Icon size={18} />}
    </span>);

}

function NotFoundCard() {
  return (
    <div className="rounded-lg border border-line bg-raised p-6 text-center">
      <h1 className="text-heading font-semibold text-fg">We can’t find this partner page</h1>
      <p className="mt-2 text-label text-fg-muted">The link may be incomplete or replaced by a newer one. Ask the business that invited you to send it again.</p>
    </div>);

}

function Shell({ children }: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen w-full bg-canvas">
      <div className="border-b border-line bg-raised">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
          <span className="font-display text-label font-bold tracking-tight text-fg">KUBICU</span>
          <Badge tone="neutral" icon={ShieldCheckIcon}>
            Test mode
          </Badge>
        </div>
      </div>
      <main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
        {children}
      </main>
      <p className="mx-auto flex max-w-2xl items-center gap-1.5 px-5 pb-10 text-caption text-fg-subtle">
        <BadgeCheckIcon size={12} aria-hidden /> Payments are held by our licensed payment partner. Phone codes and bank checks are simulated in this prototype.
      </p>
    </div>);

}