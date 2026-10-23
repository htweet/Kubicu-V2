import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, CreditCardIcon, PauseCircleIcon, RepeatIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import type { CommerceData } from '../types/commerce';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote, ThemedField } from '../components/checkout/checkoutUi';
import { canSelfCancel, cancelSub, intervalWord, pauseSub, priceLine, resumeSub, skipNextCycle, subDate, subStatusLabels, switchPlan, undoCancel, updateCard, SUB_RETRY_DAYS } from '../utils/commerce/subscriptions';
import { cardBrand, cardOutcome, digitsOnly } from '../utils/billing';
import { formatNgn } from '../utils/format';
import { Unavailable } from './PublicPage';

type Panel = null | 'pause' | 'switch' | 'card' | 'cancel';

/** The subscriber's own page: next charge, payments and self-serve changes (D69). */
export function SubscriptionPortal() {
  const { handle = '', token = '' } = useParams();
  const [params] = useSearchParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const sub = commerce.data?.subscriptions.find((s) => s.token === token);
  const [panel, setPanel] = useState<Panel>(null);
  const [cycles, setCycles] = useState(1);
  const [switchTo, setSwitchTo] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardErr, setCardErr] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<string | null>(params.get('welcome') ? 'welcome' : null);

  if (!page) return <Unavailable handle={handle} />;
  if (!sub || !commerce.data) return <Unavailable handle={handle} title="We can’t find that subscription" body="The link may be incomplete. Use the link from your confirmation or receipt, or contact the seller." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const data = commerce.data;
  const plan = data.subPlans.find((p) => p.id === sub.planId);
  const pending = sub.pendingPlanId ? data.subPlans.find((p) => p.id === sub.pendingPlanId) : undefined;
  const rules = plan?.rules;
  const deliveryFee = sub.delivery?.method === 'delivery' ? sub.delivery.feeNgn : 0;
  const nextAmount = (pending ?? plan)?.priceNgn ?? 0;
  const others = data.subPlans.filter((p) => p.status === 'active' && p.id !== sub.planId && p.kind === plan?.kind);
  const cancelCheck = canSelfCancel(sub, plan);
  const live = sub.status !== 'ended';
  // Renewal outcomes in the portal follow a fresh card (always succeeds in test mode).
  const act = (fn: (d: CommerceData) => CommerceData, msg: string) => {
    if (commerce.apply(fn)) {
      setPanel(null);
      setNotice(msg);
    }
  };

  const Icon = sub.status === 'ended' ? XCircleIcon : sub.status === 'past_due' ? AlertTriangleIcon : sub.status === 'paused' ? PauseCircleIcon : CheckCircle2Icon;
  const title =
  notice === 'welcome' ?
  sub.status === 'trialing' ?
  'Your free trial has started' :
  'You’re subscribed' :
  sub.status === 'ended' ?
  'Subscription ended' :
  sub.status === 'past_due' ?
  'Your last payment didn’t go through' :
  plan?.name ?? 'Your subscription';
  const sub_ =
  sub.status === 'trialing' ?
  `Free until ${subDate(sub.periodEnd)}. Your first charge of ${formatNgn(nextAmount + deliveryFee)} is on ${subDate(sub.periodEnd)} — cancel before then and you pay nothing.` :
  sub.status === 'past_due' ?
  `We’ll try again automatically (days ${SUB_RETRY_DAYS.join(', ')}). Update your card to fix it now. Your subscription ends on ${sub.graceEndsAt ? subDate(sub.graceEndsAt) : 'soon'} if it isn’t paid.` :
  sub.status === 'cancelling' ?
  `Cancelled. You keep everything until ${subDate(sub.periodEnd)}, then it ends. You won’t be charged again.` :
  sub.status === 'paused' ?
  `Paused. Charges start again on ${subDate(sub.periodEnd)}.` :
  sub.status === 'ended' ?
  `Ended ${sub.endedAt ? subDate(sub.endedAt) : ''}. You won’t be charged again.` :
  `Next charge ${formatNgn(nextAmount + deliveryFee)} on ${subDate(sub.periodEnd)}${pending ? ` — switching to ${pending.name}` : ''}.`;

  const panelBox = (children: React.ReactNode) =>
  <section className="flex flex-col gap-3 p-5" style={cardStyle(t)}>
      {children}
    </section>;


  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> Back to {page.doc.title}
          </Link>
          <div className="flex flex-col items-start gap-3">
            <Icon size={30} aria-hidden />
            <CheckoutHeading level={1} theme={t} sub={sub_}>
              {title}
            </CheckoutHeading>
          </div>
          {notice && notice !== 'welcome' &&
          <p role="status" className="rounded-md px-3 py-2 text-[13.5px] font-medium" style={{ background: mix(t.text, 8, t.background), color: t.text }}>
              {notice}
            </p>
          }
          <TestModeNote theme={t} />

          <section className="flex flex-col gap-2 p-5 text-[14px]" style={cardStyle(t)} aria-label="Subscription">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[16px] font-semibold">{plan?.name ?? 'Plan no longer offered'}</p>
              <p className="text-[12.5px] font-medium" style={muted}>
                {subStatusLabels[sub.status]}
              </p>
            </div>
            {plan && <p style={muted}>{priceLine(plan)}{deliveryFee ? ` + ${formatNgn(deliveryFee)} delivery` : ''}</p>}
            <dl className="mt-2 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: mix(t.text, 12) }}>
              <Row label="Subscriber" muted={muted}>{sub.customer.name}</Row>
              <Row label="Card" muted={muted}>
                {sub.card.brand} •••• {sub.card.last4}
              </Row>
              {sub.delivery && <Row label="Box" muted={muted}>{sub.delivery.method === 'delivery' ? `${sub.delivery.zoneName} · ${sub.delivery.address}` : 'Pickup'}</Row>}
              <Row label="Since" muted={muted}>{subDate(sub.startedAt)}</Row>
            </dl>
          </section>

          {live && rules &&
          <nav aria-label="Manage subscription" className="flex flex-col gap-2">
              {sub.status === 'cancelling' ?
            <PrimaryButton theme={t} onClick={() => act((d) => undoCancel(d, sub.id, 'customer'), 'Welcome back — your subscription carries on.')}>
                  Keep my subscription
                </PrimaryButton> :
            sub.status === 'paused' ?
            <PrimaryButton theme={t} onClick={() => act((d) => resumeSub(d, sub.id, 'customer'), 'Resumed. Your next charge date is shown above.')}>
                  Resume now
                </PrimaryButton> :

            <>
                  {sub.status === 'past_due' &&
              <PrimaryButton theme={t} onClick={() => setPanel('card')}>
                      Update card and pay
                    </PrimaryButton>
              }
                  {sub.status === 'active' && rules.pause && <SecondaryButton theme={t} onClick={() => setPanel('pause')}>Pause</SecondaryButton>}
                  {sub.status === 'active' && rules.skip &&
              <SecondaryButton theme={t} onClick={() => act((d) => skipNextCycle(d, sub.id, 'customer'), `Skipped. You won’t be charged on ${subDate(sub.periodEnd)}.`)}>
                      Skip the next {plan ? intervalWord[plan.interval] : 'cycle'}
                    </SecondaryButton>
              }
                  {rules.switchPlan && others.length > 0 && sub.status !== 'past_due' && <SecondaryButton theme={t} onClick={() => {setSwitchTo(others[0].id);setPanel('switch');}}>Change plan</SecondaryButton>}
                  {sub.status !== 'past_due' && <SecondaryButton theme={t} onClick={() => setPanel('card')}>Update card</SecondaryButton>}
                </>
            }
              {sub.status !== 'cancelling' &&
            <button type="button" onClick={() => setPanel('cancel')} className="mt-1 h-11 text-[14px] font-medium underline underline-offset-4" style={muted}>
                  Cancel subscription
                </button>
            }
            </nav>
          }

          {panel === 'pause' && plan &&
          panelBox(
            <>
                <p className="text-[15px] font-semibold">Pause for</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pause length">
                  {Array.from({ length: rules?.maxPauseCycles ?? 1 }, (_, i) => i + 1).map((n) =>
                <button key={n} type="button" role="radio" aria-checked={cycles === n} onClick={() => setCycles(n)} className="h-10 px-4 text-[14px]" style={{ ...cardStyle(t), border: `1.5px solid ${cycles === n ? t.text : mix(t.text, 12)}` }}>
                      {n} {intervalWord[plan.interval]}{n === 1 ? '' : 's'}
                    </button>
                )}
                </div>
                <p className="text-[13px]" style={muted}>No charges until then. {plan.kind === 'box' ? 'No boxes are sent while paused.' : ''}</p>
                <PrimaryButton theme={t} onClick={() => act((d) => pauseSub(d, sub.id, cycles, 'customer'), `Paused for ${cycles} ${intervalWord[plan.interval]}${cycles === 1 ? '' : 's'}.`)}>
                  Pause
                </PrimaryButton>
              </>
          )}

          {panel === 'switch' &&
          panelBox(
            <>
                <p className="text-[15px] font-semibold">Change plan</p>
                {others.map((p) => {
                const diff = p.priceNgn - (plan?.priceNgn ?? 0);
                return (
                  <label key={p.id} className="flex items-center gap-3 p-3 text-[14px]" style={{ ...cardStyle(t), border: `1.5px solid ${switchTo === p.id ? t.text : mix(t.text, 12)}` }}>
                      <input type="radio" name="switch" checked={switchTo === p.id} onChange={() => setSwitchTo(p.id)} style={{ accentColor: t.text }} />
                      <span className="flex-1">
                        {p.name}
                        <span className="block text-[12.5px]" style={muted}>
                          {priceLine(p)} · {diff === 0 ? 'same price' : diff > 0 ? `${formatNgn(diff)} more` : `${formatNgn(-diff)} less`}
                        </span>
                      </span>
                    </label>);

              })}
                <p className="text-[13px]" style={muted}>The change starts at your next charge on {subDate(sub.periodEnd)}. Nothing is charged today.</p>
                <PrimaryButton theme={t} disabled={!switchTo} onClick={() => act((d) => switchPlan(d, sub.id, switchTo, 'customer'), `Switching on ${subDate(sub.periodEnd)}.`)}>
                  Confirm change
                </PrimaryButton>
              </>
          )}

          {panel === 'card' &&
          panelBox(
            <form
              className="flex flex-col gap-3"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const n = digitsOnly(cardNo);
                if (n.length < 12) return setCardErr('Enter the full card number.');
                const o = cardOutcome(n);
                if (o === 'declined' || o === 'expired') return setCardErr(o === 'declined' ? 'This test card is declined. Try 4242 4242 4242 4242.' : 'This test card has expired.');
                setCardErr(undefined);
                act((d) => updateCard(d, sub.id, { brand: cardBrand(n), last4: n.slice(-4) }, 'succeeds', page.plan.id, 'customer'), sub.status === 'past_due' ? 'Card updated and payment taken. You’re all set.' : 'Card updated for future charges.');
                setCardNo('');
              }}>
              
                <p className="flex items-center gap-2 text-[15px] font-semibold">
                  <CreditCardIcon size={16} aria-hidden /> New card
                </p>
                <ThemedField theme={t} label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={cardNo} error={cardErr} onChange={setCardNo} />
                {sub.status === 'past_due' && <p className="text-[13px]" style={muted}>We’ll take the missed {formatNgn(nextAmount + deliveryFee)} straight away.</p>}
                <PrimaryButton theme={t} type="submit">
                  {sub.status === 'past_due' ? `Save and pay ${formatNgn(nextAmount + deliveryFee)}` : 'Save card'}
                </PrimaryButton>
              </form>
          )}

          {panel === 'cancel' &&
          panelBox(
            cancelCheck.ok ?
            <>
                  <p className="text-[15px] font-semibold">Cancel {plan?.name}?</p>
                  <p className="text-[13.5px]" style={muted}>
                    {sub.status === 'trialing' ? 'Your trial ends now and you won’t be charged.' : sub.status === 'past_due' ? 'It ends now. The missed payment won’t be taken.' : `You keep everything until ${subDate(sub.periodEnd)}. You won’t be charged again, and you can change your mind before then.`}
                  </p>
                  {rules?.pause && sub.status === 'active' &&
              <button type="button" onClick={() => setPanel('pause')} className="self-start text-[13.5px] font-medium underline underline-offset-4">
                      Pause instead?
                    </button>
              }
                  <ThemedField theme={t} label="Why are you leaving?" optional value={reason} onChange={setReason} />
                  <PrimaryButton theme={t} onClick={() => act((d) => cancelSub(d, sub.id, reason.trim(), 'customer'), 'Cancelled. Nothing more will be charged.')}>
                    Cancel subscription
                  </PrimaryButton>
                  <SecondaryButton theme={t} onClick={() => setPanel(null)}>
                    Keep it
                  </SecondaryButton>
                </> :

            <p className="text-[13.5px]">{cancelCheck.reason}</p>

          )}

          <section aria-labelledby="pay-h" className="flex flex-col gap-2">
            <h2 id="pay-h" className="flex items-center gap-2 text-[15px] font-semibold">
              <RepeatIcon size={15} aria-hidden /> Payments
            </h2>
            {sub.payments.length === 0 ?
            <p className="text-[13.5px]" style={muted}>
                No payments yet.
              </p> :

            <ul className="flex flex-col text-[14px]" style={cardStyle(t)}>
                {sub.payments.map((p, i) =>
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5" style={i ? { borderTop: `1px solid ${mix(t.text, 10)}` } : undefined}>
                    <span>
                      {p.label}
                      <span className="block text-[12px]" style={muted}>
                        {subDate(p.at)} · {p.status === 'paid' ? 'Paid' : p.status === 'failed' ? 'Failed' : 'Refunded'}
                      </span>
                    </span>
                    <span className="tabular-nums" style={p.status === 'paid' ? undefined : { ...muted, textDecoration: 'line-through' }}>
                      {formatNgn(p.amountNgn)}
                    </span>
                  </li>
              )}
              </ul>
            }
            <p className="text-[12.5px]" style={muted}>
              Keep this link private — anyone with it can manage this subscription.
            </p>
          </section>
        </main>
      </PageSurface>
    </div>);

}

function Row({ label, muted, children }: {label: string;muted: React.CSSProperties;children: React.ReactNode;}) {
  return (
    <div className="flex justify-between gap-3">
      <dt style={muted}>{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>);

}