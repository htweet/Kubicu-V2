import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, FileTextIcon, XCircleIcon } from 'lucide-react';
import type { Quote } from '../types/serviceOs';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { depositOf, formatDay, lineTotal, quoteView, readServiceOs, SERVICE_OS_EVENT, vatSplit, writeServiceOs } from '../utils/serviceOs';
import { vatRateLabel } from '../utils/commerce/shopSettings';
import { formatNgn } from '../utils/format';
import { hasStages, invoicePayPath, requestDueStages, stageRows } from '../utils/milestones';
import { PageSurface } from '../components/blocks/PageSurface';
import { buttonStyle, cardStyle } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, ThemedField } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';

/** What the client opens from the quote link: read it, then accept (typing their name) or decline (D89). */
export function QuoteView() {
  const { handle = '', quoteId = '' } = useParams();
  const page = useResolvedPage(handle);
  const workspaceId = page?.workspaceId ?? null;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [mode, setMode] = useState<'view' | 'accept' | 'decline'>('view');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    const load = () => setQuote(readServiceOs(workspaceId).quotes.find((q) => q.id === quoteId) ?? null);
    load();
    window.addEventListener(SERVICE_OS_EVENT, load);
    return () => window.removeEventListener(SERVICE_OS_EVENT, load);
  }, [workspaceId, quoteId]);

  if (!page) return <Unavailable handle={handle} />;
  // Drafts stay private until the business gets the link.
  if (!quote || quote.status === 'draft' || !workspaceId) return <Unavailable handle={handle} title="We can’t find this quote" body="The link may be incomplete, or the business is still working on it. Ask them to send it again." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const business = page.doc.title;
  const view = quoteView(quote);
  const split = vatSplit(quote.items, quote.vat);
  const total = split.total;
  // With VAT added on top, stages and deposits are worked out before VAT and each invoice adds it (D257).
  const vatOnTop = !!quote.vat && !quote.vat.inclusive && split.vat > 0;
  const nameError = tried && name.trim().length < 2 ? 'Type your full name to accept.' : undefined;

  const staged = hasStages(quote);
  const decide = (patch: Partial<Quote>) => {
    const d = readServiceOs(workspaceId);
    let next = { ...d, quotes: d.quotes.map((q) => (q.id === quote.id ? { ...q, ...patch, decidedAt: new Date().toISOString() } : q)) };
    // Accepting a staged quote requests every stage due on acceptance, so the first pay link is ready straight away (D95).
    if (patch.status === 'accepted' && staged) next = requestDueStages(next, quote.id).data;
    writeServiceOs(workspaceId, next);
    setMode('view');
  };
  const sd = readServiceOs(workspaceId);
  const rows = staged ? stageRows(sd, quote) : [];
  const payable = rows.find((r) => r.invoice && (r.state === 'requested' || r.state === 'part_paid'));
  const accept = () => {
    setTried(true);
    if (name.trim().length < 2) return;
    decide({ status: 'accepted', acceptedBy: name.trim() });
  };

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {business}
          </Link>

          {view === 'accepted' ? <CheckCircle2Icon size={30} aria-hidden style={{ color: t.text }} /> : view === 'declined' ? <XCircleIcon size={30} aria-hidden style={{ color: t.text }} /> : <FileTextIcon size={30} aria-hidden style={{ color: t.text }} />}
          <CheckoutHeading
            theme={t}
            level={1}
            sub={
              view === 'accepted'
                ? `You accepted on ${quote.decidedAt ? formatDay(quote.decidedAt.slice(0, 10)) : 'this device'}. ${staged ? (payable ? 'Your first payment is ready below.' : `${business} will send each payment link when it’s due.`) : `${business} will be in touch${quote.depositPct ? ' with the deposit invoice' : ''}.`}`
                : view === 'declined'
                  ? `You declined this quote. ${business} has been told.`
                  : view === 'expired'
                    ? `This quote was valid until ${formatDay(quote.validUntil)}. Ask ${business} for a new one.`
                    : `From ${business} for ${quote.client.name}. Valid until ${formatDay(quote.validUntil)}.`
            }
          >
            {quote.title}
          </CheckoutHeading>

          <section aria-label="Quote details" className="flex flex-col p-5" style={cardStyle(t)}>
            <p className="text-[12.5px] font-medium" style={muted}>
              Quote {quote.number}
            </p>
            <ul className="mt-3 flex flex-col">
              {quote.items.map((i) => (
                <li key={i.id} className="flex items-baseline justify-between gap-4 border-b py-2.5 text-[14.5px]" style={{ borderColor: `${t.mutedText}33`, color: t.text }}>
                  <span className="min-w-0">
                    {i.label}
                    {i.qty > 1 && (
                      <span className="block text-[12.5px]" style={muted}>
                        {i.qty} × {formatNgn(i.unitNgn)}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatNgn(lineTotal(i))}</span>
                </li>
              ))}
            </ul>
            {quote.vat && split.vat > 0 && (
              <div className="mt-3 flex items-baseline justify-between text-[13.5px]" style={muted}>
                <span>
                  {quote.vat.inclusive ? 'Includes VAT' : 'VAT'} ({vatRateLabel(quote.vat.ratePct)})
                </span>
                <span className="tabular-nums">{formatNgn(split.vat)}</span>
              </div>
            )}
            <div className="mt-3 flex items-baseline justify-between text-[16px] font-semibold" style={{ color: t.text }}>
              <span>Total</span>
              <span className="tabular-nums">{formatNgn(total)}</span>
            </div>
            {staged && (
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-[13px] font-semibold" style={{ color: t.text }}>
                  Paid in {rows.length} stages{vatOnTop ? ' (plus VAT on each)' : ''}
                </p>
                <ol className="flex flex-col">
                  {rows.map((r, i) => (
                    <li key={r.m.id} className="flex items-baseline justify-between gap-4 py-1.5 text-[13.5px]" style={{ color: t.text }}>
                      <span className="min-w-0">
                        {i + 1}. {r.m.label} ({r.m.pct}%)
                        <span className="block text-[12.5px]" style={muted}>
                          {r.state === 'paid' ? 'Paid' : r.when}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">{formatNgn(r.amount)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {!staged && quote.depositPct > 0 && (
              <div className="mt-1 flex items-baseline justify-between text-[13.5px]" style={muted}>
                <span>
                  Deposit to book ({quote.depositPct}%){vatOnTop ? ' + VAT' : ''}
                </span>
                <span className="tabular-nums">{formatNgn(depositOf(quote))}</span>
              </div>
            )}
            {quote.note && (
              <p className="mt-4 whitespace-pre-line text-[13.5px] leading-relaxed" style={muted}>
                {quote.note}
              </p>
            )}
          </section>

          {view === 'accepted' && payable?.invoice && (
            <Link
              to={invoicePayPath(handle, payable.invoice.id)}
              className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
              style={buttonStyle(t, 'featured')}
            >
              Pay “{payable.m.label}” · {formatNgn(payable.amount - payable.paid)}
            </Link>
          )}

          {view === 'sent' && mode === 'view' && (
            <div className="flex flex-col gap-2.5">
              <PrimaryButton theme={t} onClick={() => setMode('accept')}>
                Accept quote
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('decline')}>
                Decline
              </SecondaryButton>
            </div>
          )}

          {view === 'sent' && mode === 'accept' && (
            <section aria-labelledby="qv-accept" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
              <h2 id="qv-accept" className="text-[15px] font-semibold" style={{ color: t.text }}>
                Accept {formatNgn(total)}
              </h2>
              <ThemedField theme={t} label="Your full name" value={name} onChange={setName} autoComplete="name" error={nameError} />
              <p className="text-[12.5px] leading-relaxed" style={muted}>
                Typing your name confirms you agree to this quote{staged ? ' and its payment plan' : ''}. Nothing is charged now{staged ? ' — you’ll pay each stage through its own link when it’s due' : quote.depositPct ? ' — the deposit comes as a separate invoice' : ''}.
              </p>
              <PrimaryButton theme={t} onClick={accept}>
                Accept quote
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Back
              </SecondaryButton>
            </section>
          )}

          {view === 'sent' && mode === 'decline' && (
            <section aria-labelledby="qv-decline" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
              <h2 id="qv-decline" className="text-[15px] font-semibold" style={{ color: t.text }}>
                Decline this quote
              </h2>
              <ThemedField theme={t} label="Tell them why" optional value={reason} onChange={setReason} placeholder="e.g. Over my budget, or the date changed" />
              <PrimaryButton theme={t} onClick={() => decide({ status: 'declined', declineReason: reason.trim() || undefined })}>
                Decline quote
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Back
              </SecondaryButton>
            </section>
          )}

          <p className="text-[12.5px] leading-relaxed" style={muted}>
            Sent with KUBICU on behalf of {business}. Questions? Reply to the message this link came in.
          </p>
        </main>
      </PageSurface>
    </div>
  );
}
