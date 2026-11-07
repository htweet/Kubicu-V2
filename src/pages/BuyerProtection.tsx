import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, GavelIcon, LockIcon, PaperclipIcon, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
import type { PageTheme } from '../types/page';
import type { EscrowCase, EscrowIssue } from '../types/escrow';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { useMoney } from '../hooks/useMoney';
import { acceptOffer, caseSummary, confirmReceived, escalate, issueLabels, MAX_FILES, openDispute, RESPOND_HOURS, withdrawDispute } from '../utils/money/escrow';
import { readCommerce } from '../utils/commerce/storage';
import { formatNgn, formatTimestamp } from '../utils/format';
import { withSymbol } from '../utils/currency';
import { PageSurface } from '../components/blocks/PageSurface';
import { VisitorLanguageRow } from '../components/blocks/VisitorLanguageRow';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote, ThemedField } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';
import { useVisitorLang } from '../hooks/useVisitorLang';
import { LocaleProvider, useT } from '../contexts/LocaleContext';

/** Buyer protection page for an escrow order (D94): confirm delivery, report a problem, follow the case. */
export function BuyerProtection() {
  const { handle = '', orderId = '' } = useParams();
  const page = useResolvedPage(handle);
  // Visitor language (D133): the buyer's pick on this device, else the page's language.
  const [lang, setLang] = useVisitorLang(page?.doc.language);
  if (!page?.workspaceId) return <Unavailable handle={handle} />;
  return (
    <LocaleProvider lang={lang} setLang={setLang}>
      <Body workspaceId={page.workspaceId} handle={handle} orderId={orderId} theme={page.doc.theme} business={page.doc.title} />
    </LocaleProvider>
  );
}

function Body({ workspaceId, handle, orderId, theme: t, business }: { workspaceId: string; handle: string; orderId: string; theme: PageTheme; business: string }) {
  const { data, update } = useMoney(workspaceId);
  const { t: tx } = useT();
  const c = data.escrow.find((x) => x.orderId === orderId);
  const order = readCommerce(workspaceId)?.orders.find((o) => o.id === orderId);
  const [unlocked, setUnlocked] = useState(false);
  const muted = { color: t.mutedText };

  if (!c || !order) return <Unavailable handle={handle} title={tx('This order isn’t protected by escrow')} body={tx('Only orders paid into escrow have a protection page. Your order page has the seller’s contact details.')} />;

  const phoneDigits = order.customer.phone.replace(/\D/g, '').slice(-4);

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t} header={<VisitorLanguageRow theme={t} />}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}/order/${orderId}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {tx('Order #{n}', { n: c.orderNumber })}
          </Link>
          <div className="flex flex-col items-start gap-3">
            {c.stage === 'disputed' || c.stage === 'escalated' ? <ShieldAlertIcon size={30} aria-hidden /> : <ShieldCheckIcon size={30} aria-hidden />}
            <CheckoutHeading theme={t} level={1} sub={caseSummary(c)}>
              {headline(c, business, tx)}
            </CheckoutHeading>
          </div>

          <section aria-label={tx('Protected payment')} className="flex flex-col gap-2 p-5 text-[14.5px]" style={{ ...cardStyle(t), color: t.text }}>
            <Row label="You paid" value={formatNgn(c.grossNgn)} strong />
            <Row label="Paid" value={formatTimestamp(c.heldAt)} />
            {c.deliveredAt && <Row label="Marked delivered" value={formatTimestamp(c.deliveredAt)} />}
            {c.stage === 'delivered' && c.inspectUntil && <Row label="Released to seller" value={formatTimestamp(c.inspectUntil)} />}
            {c.deliveryNote && (
              <p className="mt-1 text-[13.5px]" style={muted}>
                {tx('Seller’s note:')} “{c.deliveryNote}”
              </p>
            )}
            {c.proof.length > 0 && <Files theme={t} label="Seller’s proof of delivery" names={c.proof.map((f) => f.name)} />}
            <p className="mt-2 border-t pt-3 text-[12.5px] leading-relaxed" style={{ ...muted, borderColor: mix(t.text, 12) }}>
              {tx('Your money is held by our licensed payment partner, not by {business}. It’s only released when you confirm, when the checking window ends, or when KUBICU decides a reported problem.', { business })}
            </p>
          </section>

          {c.stage !== 'closed' && c.stage !== 'awaiting_goal' && !unlocked && <Unlock theme={t} digits={phoneDigits} onUnlock={() => setUnlocked(true)} />}
          {unlocked && <Actions c={c} theme={t} business={business} workspaceId={workspaceId} update={update} />}

          {c.stage === 'closed' && c.dispute?.decision && (
            <section aria-label={tx('KUBICU’s decision')} className="flex flex-col gap-2 p-5" style={{ ...cardStyle(t), color: t.text }}>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                <GavelIcon size={16} aria-hidden /> {tx('KUBICU’s decision')}
              </p>
              <p className="text-[14px]" style={muted}>
                “{c.dispute.decision.note}”
              </p>
            </section>
          )}

          <TestModeNote theme={t} />
        </main>
      </PageSurface>
    </div>
  );
}

function headline(c: EscrowCase, business: string, tx: (s: string, v?: Record<string, string | number>) => string): string {
  switch (c.stage) {
    case 'awaiting_goal':
      return tx('Your payment is protected');
    case 'held':
      return tx('Waiting for {business} to deliver', { business });
    case 'delivered':
      return tx('Did everything arrive as expected?');
    case 'disputed':
      return tx('You reported a problem');
    case 'escalated':
      return tx('KUBICU is reviewing your case');
    case 'closed':
      return tx(c.outcome === 'released' ? 'Payment released' : c.outcome === 'refunded' ? 'You’ve been refunded' : 'Partly refunded');
  }
}

/** A light check that this is the buyer: the last four digits of the phone used at checkout. */
function Unlock({ theme: t, digits, onUnlock }: { theme: PageTheme; digits: string; onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { t: tx } = useT();
  return (
    <form
      className="flex flex-col gap-3 p-5"
      style={cardStyle(t)}
      onSubmit={(e) => {
        e.preventDefault();
        if (value === digits) onUnlock();
        else setError(tx('That doesn’t match the phone number on this order.'));
      }}
    >
      <p className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: t.text }}>
        <LockIcon size={16} aria-hidden /> {tx('Confirm it’s you')}
      </p>
      <ThemedField theme={t} label="Last 4 digits of the phone you ordered with" inputMode="numeric" value={value} onChange={(v) => setValue(v.replace(/\D/g, '').slice(0, 4))} error={error} />
      <PrimaryButton theme={t} type="submit" disabled={value.length < 4}>
        Continue
      </PrimaryButton>
    </form>
  );
}

function Actions({ c, theme: t, business, workspaceId, update }: { c: EscrowCase; theme: PageTheme; business: string; workspaceId: string; update: ReturnType<typeof useMoney>['update'] }) {
  const [mode, setMode] = useState<'idle' | 'confirm' | 'report' | 'escalate'>('idle');
  const { t: tx } = useT();
  const muted = { color: t.mutedText };
  const d = c.dispute;

  if (mode === 'report') return <ReportForm c={c} theme={t} onCancel={() => setMode('idle')} onSubmit={(input) => update((m) => openDispute(m, c.id, input))} />;

  return (
    <section aria-label={tx('What would you like to do?')} className="flex flex-col gap-3 p-5" style={{ ...cardStyle(t), color: t.text }}>
      {(c.stage === 'held' || c.stage === 'delivered') && mode === 'idle' && (
        <>
          {c.stage === 'delivered' && <PrimaryButton theme={t} onClick={() => setMode('confirm')}>Yes, I got it — release payment</PrimaryButton>}
          {c.stage === 'held' && (
            <p className="text-[14px]" style={muted}>
              {tx('Nothing to do yet. If it never arrives, you can report it here.')}
            </p>
          )}
          <SecondaryButton theme={t} onClick={() => setMode('report')}>
            Report a problem
          </SecondaryButton>
        </>
      )}

      {mode === 'confirm' && (
        <>
          <p className="text-[14.5px] font-semibold">{tx('Release {amount} to {business}?', { amount: formatNgn(c.grossNgn), business })}</p>
          <p className="text-[13.5px]" style={muted}>
            {tx('Only do this if you have everything and it’s as described. Once released, problems go to the seller directly.')}
          </p>
          <PrimaryButton theme={t} onClick={() => update((m) => confirmReceived(m, c.id))}>
            Release payment
          </PrimaryButton>
          <SecondaryButton theme={t} onClick={() => setMode('idle')}>
            Not yet
          </SecondaryButton>
        </>
      )}

      {d && (c.stage === 'disputed' || c.stage === 'escalated') && (
        <>
          <div>
            <p className="text-[14.5px] font-semibold">{tx(issueLabels[d.issue])}</p>
            <p className="text-[13px]" style={muted}>
              {d.wants === 'full'
                ? tx('Reported {date} · you asked for a full refund', { date: formatTimestamp(d.openedAt) })
                : tx('Reported {date} · you asked for {amount} back', { date: formatTimestamp(d.openedAt), amount: formatNgn(d.partialNgn ?? 0) })}
            </p>
          </div>
          {!d.response && c.stage === 'disputed' && (
            <p className="rounded-md px-3 py-2 text-[13.5px]" style={{ background: mix(t.text, 6) }}>
              {tx('{business} has until {date} to reply. If they don’t, KUBICU takes over automatically.', { business, date: formatTimestamp(d.respondBy) })}
            </p>
          )}
          {d.response && d.response.kind !== 'full_refund' && (
            <div className="rounded-md px-3 py-2.5" style={{ background: mix(t.text, 6) }}>
              <p className="text-[14px] font-semibold">{d.response.kind === 'partial' ? tx('{business} offers {amount} back', { business, amount: formatNgn(d.response.partialNgn ?? 0) }) : tx('{business} disagrees', { business })}</p>
              <p className="mt-1 text-[13.5px]" style={muted}>
                “{d.response.text}”
              </p>
              {d.response.evidence.length > 0 && <Files theme={t} label="Seller’s evidence" names={d.response.evidence.map((f) => f.name)} />}
            </div>
          )}
          {c.stage === 'disputed' && d.response?.kind === 'partial' && mode === 'idle' && (
            <PrimaryButton theme={t} onClick={() => update((m) => acceptOffer(workspaceId, m, c.id))}>
              {tx('Accept {amount} refund', { amount: formatNgn(d.response.partialNgn ?? 0) })}
            </PrimaryButton>
          )}
          {c.stage === 'disputed' && d.response && mode === 'idle' && (
            <SecondaryButton theme={t} onClick={() => setMode('escalate')}>
              Ask KUBICU to decide
            </SecondaryButton>
          )}
          {mode === 'escalate' && <EscalateForm theme={t} onCancel={() => setMode('idle')} onSubmit={(note) => update((m) => escalate(m, c.id, 'buyer', note))} />}
          {mode === 'idle' && (
            <button type="button" className="self-start text-[13.5px] font-medium underline" style={muted} onClick={() => update((m) => withdrawDispute(m, c.id))}>
              {tx('Problem solved — withdraw and release payment')}
            </button>
          )}
        </>
      )}
    </section>
  );
}

function ReportForm({ c, theme: t, onCancel, onSubmit }: { c: EscrowCase; theme: PageTheme; onCancel: () => void; onSubmit: (input: { issue: EscrowIssue; details: string; wants: 'full' | 'partial'; partialNgn?: number; evidence: string[] }) => void }) {
  const [issue, setIssue] = useState<EscrowIssue>(c.stage === 'held' ? 'not_received' : 'not_as_described');
  const [details, setDetails] = useState('');
  const [wants, setWants] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const { t: tx } = useT();
  const partial = Number(amount) || 0;
  const errors = {
    details: details.trim().length < 20 ? tx('Tell us what happened in at least 20 characters.') : undefined,
    amount: wants === 'partial' && (partial <= 0 || partial >= c.grossNgn) ? tx('Enter an amount below {amount}.', { amount: formatNgn(c.grossNgn) }) : undefined,
  };
  const issues: EscrowIssue[] = c.stage === 'held' ? ['not_received', 'other'] : ['not_received', 'not_as_described', 'damaged', 'incomplete', 'other'];
  const radio = (on: boolean) => ({ border: `1px solid ${mix(t.text, on ? 40 : 14)}`, color: t.text });

  return (
    <form
      className="flex flex-col gap-4 p-5"
      style={{ ...cardStyle(t), color: t.text }}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (errors.details || errors.amount) return;
        onSubmit({ issue, details, wants, partialNgn: wants === 'partial' ? partial : undefined, evidence });
      }}
    >
      <CheckoutHeading theme={t} sub={tx('Your money stays reserved while this is sorted out. The seller has {hours} hours to reply.', { hours: RESPOND_HOURS })}>
        {tx('Report a problem')}
      </CheckoutHeading>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium">{tx('What went wrong?')}</legend>
        {issues.map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={radio(issue === i)}>
            <input type="radio" name="issue" checked={issue === i} onChange={() => setIssue(i)} />
            {tx(issueLabels[i])}
          </label>
        ))}
      </fieldset>
      <ThemedTextArea theme={t} label={tx('What happened?')} value={details} onChange={setDetails} error={tried ? errors.details : undefined} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium">{tx('What would make it right?')}</legend>
        {(['full', 'partial'] as const).map((w) => (
          <label key={w} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={radio(wants === w)}>
            <input type="radio" name="wants" checked={wants === w} onChange={() => setWants(w)} />
            {w === 'full' ? tx('A full refund ({amount})', { amount: formatNgn(c.grossNgn) }) : tx('Part of my money back')}
          </label>
        ))}
      </fieldset>
      {wants === 'partial' && <ThemedField theme={t} label={withSymbol('Amount (₦)')} inputMode="numeric" value={amount} onChange={(v) => setAmount(v.replace(/\D/g, ''))} error={tried ? errors.amount : undefined} />}
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium">
          {tx('Photos or documents')} <span style={{ color: t.mutedText, fontWeight: 400 }}>· {tx('optional, up to {n}', { n: MAX_FILES })}</span>
        </span>
        {evidence.length > 0 && <Files theme={t} names={evidence} />}
        {evidence.length < MAX_FILES && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-md px-3 py-2 text-[13.5px] font-medium" style={radio(false)}>
            <PaperclipIcon size={14} aria-hidden /> {tx('Add files')}
            <input type="file" multiple accept="image/*,.pdf" className="sr-only" onChange={(e) => setEvidence([...evidence, ...Array.from(e.target.files ?? []).map((f) => f.name)].slice(0, MAX_FILES))} />
          </label>
        )}
      </div>
      <PrimaryButton theme={t} type="submit">
        Send report
      </PrimaryButton>
      <SecondaryButton theme={t} onClick={onCancel}>
        Cancel
      </SecondaryButton>
    </form>
  );
}

function EscalateForm({ theme: t, onCancel, onSubmit }: { theme: PageTheme; onCancel: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('');
  const { t: tx } = useT();
  return (
    <div className="flex flex-col gap-3">
      <ThemedTextArea theme={t} label={tx('Anything KUBICU should know?')} optional value={note} onChange={setNote} />
      <PrimaryButton theme={t} onClick={() => onSubmit(note)}>
        Send to KUBICU
      </PrimaryButton>
      <SecondaryButton theme={t} onClick={onCancel}>
        Cancel
      </SecondaryButton>
    </div>
  );
}

function ThemedTextArea({ theme: t, label, value, onChange, error, optional }: { theme: PageTheme; label: string; value: string; onChange: (v: string) => void; error?: string; optional?: boolean }) {
  const id = React.useId();
  const { t: tx } = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium" style={{ color: t.text }}>
        {label}
        {optional && <span style={{ color: t.mutedText, fontWeight: 400 }}> · {tx('optional')}</span>}
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-3 text-[15px] outline-none focus:ring-2"
        style={{ background: mix(t.text, 4), color: t.text, border: `1px solid ${error ? '#c0392b' : mix(t.text, 16)}`, borderRadius: 12 }}
      />
      {error && (
        <p id={`${id}-err`} className="text-[12.5px] font-medium" style={{ color: t.text }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Files({ theme: t, label, names }: { theme: PageTheme; label?: string; names: string[] }) {
  const { t: tx } = useT();
  return (
    <div className="mt-1">
      {label && (
        <p className="text-[12.5px] font-semibold" style={{ color: t.mutedText }}>
          {tx(label)}
        </p>
      )}
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <li key={`${n}-${i}`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px]" style={{ background: mix(t.text, 6), color: t.text }}>
            <PaperclipIcon size={12} aria-hidden /> {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  label = useT().t(label);
  return (
    <div className={strong ? 'flex items-baseline justify-between gap-4 text-[16px] font-semibold' : 'flex items-baseline justify-between gap-4'}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
