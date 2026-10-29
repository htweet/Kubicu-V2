import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, MinusIcon, PlusIcon, ShieldCheckIcon, XCircleIcon } from 'lucide-react';
import type { MoneyData, PaymentLink } from '../types/money';
import type { PageTheme } from '../types/page';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { buyerEscrowFee, inspectionDays, linkMethod, linkView, MONEY_EVENT, readMoney, recordLinkPayment, writeMoney } from '../utils/money/store';
import { formatNgn, formatTimestamp } from '../utils/format';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote, ThemedField } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';
import { useVisitorLang } from '../hooks/useVisitorLang';
import { LocaleProvider, translatorFor, useT } from '../contexts/LocaleContext';
import { isStaged, linkStageAmounts, nextLinkStage, stagePaidOn } from '../utils/money/linkStages';
import { isNaira } from '../utils/currency';
import { UssdPay } from '../components/checkout/UssdPay';
import { fundraiserBlocked, fundraiserTerms } from '../utils/fundraiser';
import { readAdminStore } from '../utils/admin/store';
import { ClockIcon, CreditCardIcon, ExternalLinkIcon, HashIcon, LandmarkIcon } from 'lucide-react';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { shopClosedMessage, shopSettingsOf, vatRateLabel } from '../utils/commerce/shopSettings';
import { transferAccounts } from '../utils/commerce/bankTransfer';
import { addPendingTransfer, linkPayWays, linkVat, payerFeeFor, safeRedirect } from '../utils/money/linkCheckout';
import { isValidEmail } from '../utils/validation';
import { MediaImage } from '../components/media/MediaImage';
import { ReceiptBusinessFooter } from '../components/checkout/ReceiptBusinessFooter';
import { TransferAccountPay, transferAccountFor } from '../components/checkout/TransferAccountPay';

type Step = 'details' | 'pay' | 'done' | 'declined' | 'awaiting';
type PayBy = 'card' | 'account' | 'transfer' | 'ussd';
type CardOutcome = 'success' | 'declined';

/** What a payer opens from a payment link (D92): amount, details, test card, receipt. */
export function PayLinkPage() {
  const { handle = '', slug = '' } = useParams();
  const page = useResolvedPage(handle);
  const workspaceId = page?.workspaceId ?? null;
  const [money, setMoney] = useState<MoneyData | null>(null);
  const [step, setStep] = useState<Step>('details');
  // Support blocks (D124) open the link with ?amount= filled in; the payer can still change it.
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState(() => (searchParams.get('amount') ?? '').replace(/\D/g, ''));
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  // Fundraisers (D179): supporters are anonymous unless they choose otherwise.
  const [showName, setShowName] = useState(false);
  const [outcome, setOutcome] = useState<CardOutcome>('success');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ussd, setUssd] = useState(false);
  const [receipt, setReceipt] = useState<{number: string;at: string;amount: number;stage?: string;fee?: number;vat?: number;vatInclusive?: boolean;vatRate?: number;} | null>(null);
  // Standard links (D224): more details, own questions, ways to pay.
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [payByChoice, setPayBy] = useState<PayBy>('card');
  const [accountOpen, setAccountOpen] = useState(false);
  const [ownIdx, setOwnIdx] = useState(0);
  const commerce = usePageCommerce(workspaceId, !!page?.isOwn);
  // Visitor language (D133): the payer's pick on this device, else the page's language.
  const [lang] = useVisitorLang(page?.doc.language);
  const tx = translatorFor(lang);

  useEffect(() => {
    if (!workspaceId) return;
    const load = () => setMoney(readMoney(workspaceId));
    load();
    window.addEventListener(MONEY_EVENT, load);
    return () => window.removeEventListener(MONEY_EVENT, load);
  }, [workspaceId]);

  const link: PaymentLink | null = money?.links.find((l) => l.slug === slug) ?? null;

  // Count one view per visit.
  useEffect(() => {
    if (!workspaceId || !link) return;
    const seen = `kubicu.paylink.view.${link.id}`;
    if (window.sessionStorage.getItem(seen)) return;
    window.sessionStorage.setItem(seen, '1');
    const d = readMoney(workspaceId);
    writeMoney(workspaceId, { ...d, links: d.links.map((l) => l.id === link.id ? { ...l, views: l.views + 1 } : l) });
  }, [workspaceId, link?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stage = link && isStaged(link) ? nextLinkStage(link) : null;
  const stageAmounts = link && isStaged(link) ? linkStageAmounts(link) : {};

  // Later stages: the same payer, so carry their details over.
  useEffect(() => {
    const first = link && isStaged(link) ? link.payments.find((p) => p.stageId) : undefined;
    if (!first) return;
    setName((n) => n || first.payerName);
    setPhone((p) => p || first.payerPhone);
  }, [link?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = useMemo(() => {
    if (!link) return 0;
    if (link.kind === 'fixed' && stage) return stageAmounts[stage.id] ?? 0;
    if (link.kind === 'fixed') return link.amountNgn;
    if (link.kind === 'open') return Number(amount) || 0;
    return link.items.reduce((s, i) => s + (qty[i.id] ?? 0) * i.unitNgn, 0);
  }, [link, amount, qty, stage?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page) return <Unavailable handle={handle} />;
  if (!money || !workspaceId) return null;
  if (!link || link.status === 'archived') return <Unavailable handle={handle} title={tx('We can’t find this payment link')} body={tx('The link may be mistyped or no longer used. Ask the business for a new one.')} />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const business = page.doc.title;
  const view = linkView(link);
  const method = linkMethod(money, link);
  // Commerce settings (D222) and the link's own options (D224).
  const shop = shopSettingsOf(commerce.data);
  const ownAccounts = transferAccounts(workspaceId, shop.business.tradingName || business);
  const ways = linkPayWays(link, shop, isNaira(), ownAccounts.length);
  const vat = linkVat(link, shop, subtotal);
  const vatAdded = vat?.addedNgn ?? 0;
  const payerFee = link.payerCoversFee && !link.fundraiser ? payerFeeFor(subtotal + vatAdded) : 0;
  const charged = subtotal + vatAdded + payerFee;
  const buyerFee = method === 'escrow' ? buyerEscrowFee(money, charged) : 0;
  const total = charged + buyerFee;
  const ask = link.fundraiser ? { email: 'off' as const, address: 'off' as const } : link.ask ?? { email: 'off' as const, address: 'off' as const };
  const questions = link.fundraiser ? [] : link.questions ?? [];
  const payOptions: PayBy[] = [...(ways.card ? ['card'] as const : []), ...(ways.account ? ['account'] as const : []), ...(ways.own ? ['transfer'] as const : []), ...(ways.ussd && total > 0 ? ['ussd'] as const : [])];
  const payBy: PayBy = payOptions.includes(payByChoice) ? payByChoice : payOptions[0] ?? 'card';
  const own = ownAccounts[Math.min(ownIdx, ownAccounts.length - 1)];

  const errors = {
    amount:
    link.kind === 'open' && subtotal < link.minNgn ?
    tx('Enter at least {amount}.', { amount: formatNgn(link.minNgn) }) :
    link.kind === 'open' && link.maxNgn && subtotal > link.maxNgn ?
    tx('The most you can pay here is {amount}.', { amount: formatNgn(link.maxNgn) }) :
    link.kind === 'items' && subtotal === 0 ?
    tx('Choose at least one item.') :
    undefined,
    name: link.fields.name && name.trim().length < 2 ? tx('Enter your name.') : undefined,
    phone: link.fields.phone && phone.replace(/\D/g, '').length < 10 ? tx('Enter a phone number the business can reach you on.') : undefined,
    email: ask.email !== 'off' && (ask.email === 'required' || email.trim()) && !isValidEmail(email) ? tx('Enter a valid email.') : undefined,
    address: ask.address === 'required' && address.trim().length < 4 ? tx('Enter your address.') : undefined,
    questions: questions.some((q) => q.required && !(answers[q.id] ?? '').trim()) ? tx('Answer the required questions.') : undefined
  };
  const paymentBase = () => ({
    amountNgn: charged,
    payerName: name.trim(),
    payerPhone: phone.trim(),
    note: note.trim(),
    items: link.kind === 'items' ? link.items.filter((i) => (qty[i.id] ?? 0) > 0).map((i) => ({ label: i.label, qty: qty[i.id], unitNgn: i.unitNgn })) : undefined,
    stageId: stage?.id,
    showName: link.fundraiser ? showName : undefined,
    payerEmail: email.trim() || undefined,
    payerAddress: address.trim() || undefined,
    answers: questions.length ? questions.map((q) => ({ label: q.label, value: (answers[q.id] ?? '').trim() })).filter((a) => a.value) : undefined,
    feeNgn: payerFee || undefined,
    vatNgn: vat?.amountNgn || undefined
  });

  const next = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setStep('pay');
  };

  const pay = (via: PayBy = 'card') => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      // USSD and transfer accounts confirm on their own; only the test card can be declined (D136, D224).
      if (via === 'card' && outcome === 'declined') return setStep('declined');
      const d = readMoney(workspaceId);
      if (link.fundraiser && fundraiserBlocked(link, d, readAdminStore())) return setStep('declined');
      const res = recordLinkPayment(d, link.id, { ...paymentBase(), payBy: via });
      if (!res) return setStep('declined');
      writeMoney(workspaceId, res.data);
      setReceipt({ number: res.payment.receipt, at: res.payment.at, amount: total, stage: stage?.label, fee: payerFee, vat: vat?.amountNgn, vatInclusive: vat?.inclusive, vatRate: vat?.ratePct });
      setStep('done');
    }, 1100);
  };

  // Transfer to the seller's own account: waits for the seller to confirm (D224).
  const sentToOwn = () => {
    if (!own) return;
    const d = readMoney(workspaceId);
    writeMoney(workspaceId, addPendingTransfer(d, link.id, { ...paymentBase(), payBy: 'transfer', transferTo: own }).data);
    setStep('awaiting');
  };

  const blocked = link.fundraiser ? fundraiserBlocked(link, money, readAdminStore()) : null;
  const shopPaused = !link.fundraiser && shop.status.paused && shop.status.pauseLinks ? shopClosedMessage(shop) : '';
  const closedCopy = blocked ?
  tx(blocked) :
  shopPaused ?
  shopPaused :
  view === 'paused' ?
  tx('{business} isn’t taking payments on this link right now.', { business }) :
  view === 'expired' ?
  tx('This link closed on {when}.', { when: link.expiresAt ? formatTimestamp(link.expiresAt) : tx('its end date') }) :
  view === 'used_up' ?
  tx(isStaged(link) ? 'Every stage is paid — thank you. Nothing more is due on this link.' : 'This link has reached its limit and is closed.') :
  null;

  return (
    <LocaleProvider lang={lang}>
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {business}
          </Link>

          {step === 'done' && receipt ?
            <>
              <CheckCircle2Icon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub={tx('{business} has been told. Keep this page as your receipt.', { business })}>
                Payment received
              </CheckoutHeading>
              <section aria-label={tx('Receipt')} className="flex flex-col gap-2 p-5 text-[14.5px]" style={{ ...cardStyle(t), color: t.text }}>
                <Row label="For" value={receipt.stage ? `${link.title} · ${receipt.stage}` : link.title} />
                {!!receipt.vat && !receipt.vatInclusive && <Row label={`VAT (${vatRateLabel(receipt.vatRate ?? 0)})`} value={formatNgn(receipt.vat)} />}
                {!!receipt.fee && <Row label="Processing fee" value={formatNgn(receipt.fee)} />}
                <Row label="Amount" value={formatNgn(receipt.amount)} strong />
                {!!receipt.vat && receipt.vatInclusive && <Row label={`Includes VAT (${vatRateLabel(receipt.vatRate ?? 0)})`} value={formatNgn(receipt.vat)} />}
                <Row label="Receipt" value={receipt.number} />
                <Row label="Paid" value={formatTimestamp(receipt.at)} />
                {method === 'escrow' &&
                <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed" style={muted}>
                    <ShieldCheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden /> {tx('Your money is held by our licensed payment partner and released to {business} after {n} days, unless you report a problem.', { business, n: inspectionDays.links })}
                  </p>
                }
                <ReceiptBusinessFooter business={shop.business} fallbackName={business} muted={muted} borderColor={mix(t.text, 12)} />
              </section>
              {link.after?.message &&
              <p className="whitespace-pre-line rounded-md px-4 py-3 text-[14.5px] leading-relaxed" style={{ background: mix(t.text, 6), color: t.text }}>
                  {link.after.message}
                </p>
              }
              {link.after?.redirectUrl && safeRedirect(link.after.redirectUrl) &&
              <a href={safeRedirect(link.after.redirectUrl)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}>
                  {tx('Continue')} <ExternalLinkIcon size={15} aria-hidden />
                </a>
              }
              {isStaged(link) && <StagePlan link={link} amounts={stageAmounts} theme={t} />}
              {isStaged(link) && nextLinkStage(link) &&
              <SecondaryButton theme={t} onClick={() => {setReceipt(null);setStep('details');setTried(false);}}>
                  Pay the next stage now
                </SecondaryButton>
              }
              <TestModeNote theme={t} />
            </> :
            step === 'awaiting' && own ?
            <>
              <ClockIcon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub={tx('{business} will confirm when the money arrives. You’ll get a receipt then.', { business })}>
                Transfer sent — waiting for confirmation
              </CheckoutHeading>
              <section aria-label={tx('Transfer details')} className="flex flex-col gap-2 p-5 text-[14.5px]" style={{ ...cardStyle(t), color: t.text }}>
                <Row label="For" value={link.title} />
                <Row label="Amount" value={formatNgn(charged)} strong />
                <Row label="Sent to" value={`${own.bank} · ${own.account}`} />
                <Row label="Account name" value={own.accountName} />
              </section>
              <p className="text-[13px] leading-relaxed" style={muted}>
                {tx('Only transfer to the account shown here. KUBICU doesn’t hold this money and can’t refund a transfer to the wrong account.')}
              </p>
              <TestModeNote theme={t} />
            </> :
            step === 'declined' ?
            <>
              <XCircleIcon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub="Your card was declined (test). Nothing was charged.">
                Payment didn’t go through
              </CheckoutHeading>
              <PrimaryButton theme={t} onClick={() => setStep('pay')}>
                Try again
              </PrimaryButton>
            </> :

            <>
              <CheckoutHeading theme={t} level={1} sub={closedCopy ?? tx('Pay {business} securely. You don’t need an account.', { business })}>
                {link.title}
              </CheckoutHeading>
              {link.imageUrl && !link.fundraiser && <MediaImage src={link.imageUrl} alt="" className="aspect-video w-full object-cover" style={{ borderRadius: 16 }} />}
              {link.description &&
              <p className="whitespace-pre-line text-[14.5px] leading-relaxed" style={muted}>
                  {link.description}
                </p>
              }

              {isStaged(link) && <StagePlan link={link} amounts={stageAmounts} theme={t} />}

              {!closedCopy && step === 'details' &&
              <section aria-label={tx('Payment details')} className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
                  {link.kind === 'fixed' && stage && <Row label={tx('Now: {stage}', { stage: stage.label })} value={formatNgn(subtotal)} strong color={t.text} />}
                  {link.kind === 'fixed' && !stage && <Row label="Amount" value={formatNgn(link.amountNgn)} strong color={t.text} />}
                  {link.kind === 'open' && !!link.suggested?.length &&
                <div role="group" aria-label={tx('Choose an amount')} className="flex flex-wrap gap-2">
                      {link.suggested.map((a) => {
                    const on = Number(amount) === a;
                    return (
                      <button key={a} type="button" aria-pressed={on} onClick={() => setAmount(String(a))} className="min-h-[44px] px-4 text-[14.5px] font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ borderRadius: 999, border: `1.5px solid ${on ? t.text : mix(t.text, 16)}`, background: on ? mix(t.text, 8) : 'transparent', color: t.text }}>
                            {formatNgn(a)}
                          </button>);

                  })}
                    </div>
                }
                  {link.kind === 'open' && <ThemedField theme={t} label={link.maxNgn ? tx('Amount ({min}–{max})', { min: formatNgn(link.minNgn), max: formatNgn(link.maxNgn) }) : tx('Amount (from {amount})', { amount: formatNgn(link.minNgn) })} inputMode="numeric" value={amount} onChange={(v) => setAmount(v.replace(/\D/g, ''))} error={tried ? errors.amount : undefined} placeholder="0" />}
                  {link.kind === 'items' &&
                <ul className="flex flex-col">
                      {link.items.map((i) => {
                    const n = qty[i.id] ?? 0;
                    return (
                      <li key={i.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0" style={{ borderColor: mix(t.text, 10) }}>
                            <span style={{ color: t.text }}>
                              <span className="block text-[14.5px] font-medium">{i.label}</span>
                              <span className="block text-[13px]" style={muted}>
                                {formatNgn(i.unitNgn)}
                              </span>
                            </span>
                            <span className="flex items-center gap-2" style={{ color: t.text }}>
                              <QtyButton label={tx('One less {item}', { item: i.label })} onClick={() => setQty({ ...qty, [i.id]: Math.max(0, n - 1) })} disabled={n === 0} theme={t}>
                                <MinusIcon size={15} aria-hidden />
                              </QtyButton>
                              <span className="w-6 text-center tabular-nums" aria-live="polite">
                                {n}
                              </span>
                              <QtyButton label={tx('One more {item}', { item: i.label })} onClick={() => setQty({ ...qty, [i.id]: Math.min(i.maxQty, n + 1) })} disabled={n >= i.maxQty} theme={t}>
                                <PlusIcon size={15} aria-hidden />
                              </QtyButton>
                            </span>
                          </li>);

                  })}
                      {tried && errors.amount &&
                  <li className="pt-2 text-[12.5px] font-medium" style={{ color: t.text }} role="alert">
                          {errors.amount}
                        </li>
                  }
                    </ul>
                }
                  {link.fields.name && <ThemedField theme={t} label="Your name" autoComplete="name" value={name} onChange={setName} error={tried ? errors.name : undefined} />}
                  {link.fields.phone && <ThemedField theme={t} label="Phone or WhatsApp" type="tel" autoComplete="tel" value={phone} onChange={setPhone} error={tried ? errors.phone : undefined} />}
                  {ask.email !== 'off' && <ThemedField theme={t} label="Email" type="email" inputMode="email" autoComplete="email" optional={ask.email === 'optional'} value={email} onChange={setEmail} error={tried ? errors.email : undefined} />}
                  {ask.address !== 'off' && <ThemedField theme={t} label="Address" autoComplete="street-address" optional={ask.address === 'optional'} value={address} onChange={setAddress} error={tried ? errors.address : undefined} />}
                  {questions.map((q) =>
                q.type === 'choice' ?
                <fieldset key={q.id} className="flex flex-col gap-2" style={{ color: t.text }}>
                        <legend className="mb-1 text-[14px] font-semibold">
                          {q.label}
                          {!q.required && <span className="font-normal" style={muted}> · {tx('optional')}</span>}
                        </legend>
                        {q.options.map((o) =>
                  <label key={o} className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-[14px]" style={{ border: `1px solid ${mix(t.text, answers[q.id] === o ? 40 : 14)}` }}>
                            <input type="radio" name={`plq-${q.id}`} checked={answers[q.id] === o} onChange={() => setAnswers({ ...answers, [q.id]: o })} style={{ accentColor: t.text }} />
                            {o}
                          </label>
                  )}
                      </fieldset> :

                <ThemedField key={q.id} theme={t} label={q.label} type={q.type === 'date' ? 'date' : 'text'} optional={!q.required} value={answers[q.id] ?? ''} onChange={(v) => setAnswers({ ...answers, [q.id]: v.slice(0, 200) })} />

                )}
                  {tried && errors.questions &&
                <p className="text-[12.5px] font-medium" style={{ color: t.text }} role="alert">
                      {errors.questions}
                    </p>
                }
                  {link.fields.note && <ThemedField theme={t} label={link.fundraiser ? 'Message for the organiser' : 'Note for the business'} optional value={note} onChange={setNote} />}
                  {link.fundraiser &&
                <label className="flex cursor-pointer items-start gap-2.5 text-[14px]" style={{ color: t.text }}>
                      <input type="checkbox" className="mt-0.5 h-4 w-4" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                      <span>
                        {tx('Show my first name on the fundraiser')}
                        <span className="block text-[12.5px]" style={muted}>
                          {tx('Otherwise you appear as Anonymous. Your amount is shown either way.')}
                        </span>
                      </span>
                    </label>
                }
                  {link.fundraiser &&
                <p className="text-[12.5px] leading-relaxed" style={muted}>
                      {fundraiserTerms(link.fundraiser.organiser)}
                    </p>
                }
                  <PrimaryButton theme={t} onClick={next}>
                    {tx('Continue')}{subtotal > 0 ? ` · ${formatNgn(total)}` : ''}
                  </PrimaryButton>
                </section>
              }

              {!closedCopy && step === 'pay' && ussd &&
              <section aria-label={tx('Pay with USSD')} className="flex flex-col gap-4 p-5" style={{ ...cardStyle(t), color: t.text }}>
                  <UssdPay inline theme={t} amount={total} onBack={() => setUssd(false)} onPaid={() => (setUssd(false), pay('ussd'))} />
                </section>
              }

              {!closedCopy && step === 'pay' && accountOpen &&
              <section aria-label={tx('Pay by bank transfer')} className="flex flex-col gap-4 p-5" style={{ ...cardStyle(t), color: t.text }}>
                  <TransferAccountPay theme={t} amount={total} account={transferAccountFor(`${link.id}:${name}:${phone}`)} onBack={() => setAccountOpen(false)} onPaid={() => (setAccountOpen(false), pay('account'))} />
                </section>
              }

              {!closedCopy && step === 'pay' && !ussd && !accountOpen &&
              <section aria-label={tx('Pay')} className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
                  <div className="flex flex-col gap-1.5 text-[14.5px]" style={{ color: t.text }}>
                    <Row label={stage ? stage.label : 'Subtotal'} value={formatNgn(subtotal)} />
                    {vat && !vat.inclusive && <Row label={`VAT (${vatRateLabel(vat.ratePct)})`} value={formatNgn(vat.amountNgn)} />}
                    {payerFee > 0 && <Row label="Processing fee" value={formatNgn(payerFee)} />}
                    {buyerFee > 0 && <Row label="Escrow protection fee" value={formatNgn(buyerFee)} />}
                    <Row label="You pay" value={formatNgn(total)} strong />
                    {vat?.inclusive && <Row label={`Includes VAT (${vatRateLabel(vat.ratePct)})`} value={formatNgn(vat.amountNgn)} />}
                  </div>
                  {payOptions.length === 0 &&
                <p className="rounded-md px-3 py-2.5 text-[13.5px] font-semibold" style={{ background: mix(t.text, 6), color: t.text }} role="alert">
                      {tx('{business} hasn’t turned on a way to pay online yet.', { business })}
                    </p>
                }
                  {payOptions.length > 1 &&
                <fieldset className="flex flex-col gap-2">
                      <legend className="mb-1 text-[14px] font-semibold" style={{ color: t.text }}>
                        {tx('Pay with')}
                      </legend>
                      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                        {payOptions.map((v) =>
                    <label key={v} className="flex min-h-[48px] cursor-pointer items-center gap-2.5 px-3 text-[14px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ ...cardStyle(t), color: t.text, border: `1.5px solid ${payBy === v ? t.text : mix(t.text, 12)}` }}>
                            <input type="radio" name="paylink-by" className="sr-only" checked={payBy === v} onChange={() => setPayBy(v)} />
                            {v === 'card' ? <CreditCardIcon size={17} aria-hidden /> : v === 'ussd' ? <HashIcon size={17} aria-hidden /> : <LandmarkIcon size={17} aria-hidden />}
                            {v === 'card' ? tx('Card') : v === 'ussd' ? tx('USSD code') : v === 'account' ? ways.own ? tx('Transfer account') : tx('Bank transfer') : tx('Seller’s account')}
                          </label>
                    )}
                      </div>
                    </fieldset>
                }
                  {payBy === 'transfer' && own &&
                <div className="flex flex-col gap-2 rounded-md p-3 text-[14px]" style={{ background: mix(t.text, 4), color: t.text }}>
                      {ownAccounts.length > 1 &&
                  <div role="radiogroup" aria-label={tx('Choose an account')} className="flex flex-col gap-1.5">
                          {ownAccounts.map((a, i) =>
                    <label key={`${a.bank}-${a.account}`} className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                              <input type="radio" name="paylink-own" checked={own === a} onChange={() => setOwnIdx(i)} style={{ accentColor: t.text }} />
                              {a.bank} · {a.account.slice(-4).padStart(4, '•')}
                            </label>
                    )}
                        </div>
                  }
                      <Row label="Bank" value={own.bank} />
                      <Row label="Account number" value={own.account} />
                      <Row label="Account name" value={own.accountName} />
                      <p className="text-[12.5px] leading-snug" style={muted}>
                        {tx('Transfer {amount}, then tap “I’ve sent it”. {business} confirms when it arrives.', { amount: formatNgn(charged), business })}
                      </p>
                    </div>
                }
                  {method === 'escrow' &&
                <p className="flex items-start gap-2 rounded-md px-3 py-2 text-[13px] leading-relaxed" style={{ background: mix(t.text, 6), color: t.text }}>
                      <ShieldCheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden /> {tx('Protected by escrow: your money is held by our licensed partner for {n} days before {business} receives it.', { n: inspectionDays.links, business })}
                    </p>
                }
                  {payBy === 'card' && payOptions.length > 0 &&
                <fieldset className="flex flex-col gap-2">
                      <legend className="mb-1 text-[13px] font-medium" style={{ color: t.text }}>
                        {tx('Test card')}
                      </legend>
                      {(['success', 'declined'] as const).map((o) =>
                  <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={{ border: `1px solid ${mix(t.text, outcome === o ? 40 : 14)}`, color: t.text }}>
                          <input type="radio" name="paylink-card" checked={outcome === o} onChange={() => setOutcome(o)} />
                          {o === 'success' ? `4242 4242 4242 4242 — ${tx('payment works')}` : `4000 0000 0000 0002 — ${tx('declined')}`}
                        </label>
                  )}
                    </fieldset>
                }
                  <TestModeNote theme={t} />
                  {payOptions.length > 0 &&
                <PrimaryButton theme={t} onClick={() => payBy === 'ussd' ? setUssd(true) : payBy === 'account' ? setAccountOpen(true) : payBy === 'transfer' ? sentToOwn() : pay('card')} disabled={busy}>
                      {busy ?
                  tx('Paying…') :
                  payBy === 'ussd' ?
                  tx('Get a USSD code for {amount}', { amount: formatNgn(total) }) :
                  payBy === 'account' ?
                  tx('Get account details for {amount}', { amount: formatNgn(total) }) :
                  payBy === 'transfer' ?
                  tx('I’ve sent it') :
                  tx('Pay {amount}', { amount: formatNgn(total) })}
                    </PrimaryButton>
                }
                  <SecondaryButton theme={t} onClick={() => setStep('details')}>
                    Back
                  </SecondaryButton>
                </section>
              }
            </>
            }

          <p className="text-[12.5px] leading-relaxed" style={muted}>
            {tx('Payment link from {business}, powered by KUBICU. Money is handled by our licensed payment partner.', { business })}
          </p>
        </main>
      </PageSurface>
    </div>
    </LocaleProvider>);

}

function Row({ label, value, strong, color }: {label: string;value: string;strong?: boolean;color?: string;}) {
  label = useT().t(label);
  return (
    <div className={strong ? 'flex items-baseline justify-between gap-4 text-[16px] font-semibold' : 'flex items-baseline justify-between gap-4'} style={color ? { color } : undefined}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>);

}

/** The whole plan for a staged link: what's paid and what's next. */
function StagePlan({ link, amounts, theme }: {link: PaymentLink;amounts: Record<string, number>;theme: PageTheme;}) {
  const next = nextLinkStage(link);
  const { t: tx } = useT();
  const paidTotal = (link.stages ?? []).reduce((s, x) => s + (stagePaidOn(link, x.id) ? amounts[x.id] ?? 0 : 0), 0);
  return (
    <section aria-labelledby="stage-plan-h" className="flex flex-col gap-3 p-5" style={{ ...cardStyle(theme), color: theme.text }}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="stage-plan-h" className="text-[14.5px] font-semibold">
          {tx('Paid in {n} stages', { n: link.stages?.length ?? 0 })}
        </h2>
        <span className="text-[13px] tabular-nums" style={{ color: theme.mutedText }}>
          {tx('{paid} of {total}', { paid: formatNgn(paidTotal), total: formatNgn(link.amountNgn) })}
        </span>
      </div>
      <ol className="flex flex-col">
        {(link.stages ?? []).map((s) => {
          const paid = stagePaidOn(link, s.id);
          const current = next?.id === s.id;
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 border-t py-2.5 text-[14px]" style={{ borderColor: mix(theme.text, 10) }}>
              <span className="flex min-w-0 items-center gap-2">
                {paid ? <CheckCircle2Icon size={15} aria-hidden className="shrink-0" /> : <span aria-hidden className="h-[15px] w-[15px] shrink-0 rounded-full" style={{ border: `1.5px solid ${mix(theme.text, current ? 70 : 25)}` }} />}
                <span className={current ? 'font-semibold' : undefined}>
                  {s.label} <span style={{ color: theme.mutedText }}>· {s.pct}%</span>
                </span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                {formatNgn(amounts[s.id] ?? 0)}
                <span className="block text-[12px]" style={{ color: theme.mutedText }}>
                  {paid ? tx('Paid {when}', { when: formatTimestamp(paid.at) }) : tx(current ? 'Due now' : 'Later')}
                </span>
              </span>
            </li>);

        })}
      </ol>
    </section>);

}

function QtyButton({ label, onClick, disabled, theme, children }: {label: string;onClick: () => void;disabled: boolean;theme: {text: string;};children: React.ReactNode;}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40" style={{ border: `1px solid ${mix(theme.text, 20)}` }}>
      {children}
    </button>);

}