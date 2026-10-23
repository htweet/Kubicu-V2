import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BellOffIcon, BellRingIcon, MailCheckIcon } from 'lucide-react';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageOps } from '../hooks/usePageOps';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton } from '../components/checkout/checkoutUi';
import { patchContact } from '../utils/ops/ops';
import { Unavailable } from './PublicPage';

const reasons = ['Too many messages', 'Not relevant to me', 'I never signed up', 'Other'];

/**
 * Visitor-facing preference centre (G14, D81). One link per contact, put at the bottom of every
 * marketing message. Only the person themselves can opt back in here (D45).
 */
export function EmailPreferences() {
  const { handle = '', contactId = '' } = useParams();
  const page = useResolvedPage(handle);
  const ops = usePageOps(page?.workspaceId ?? null, !!page?.isOwn);
  const [reason, setReason] = useState('');
  const [justChanged, setJustChanged] = useState<'out' | 'in' | null>(null);

  const contact = ops.data?.contacts.find((c) => c.id === contactId);
  if (!page) return <Unavailable handle={handle} />;
  if (!contact || !ops.data) return <Unavailable handle={handle} title="We can’t find your preferences" body="The link may be incomplete or out of date. Reply to any message from this business and ask them to remove you." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const business = page.doc.title;
  const subscribed = contact.consent === 'subscribed';

  const optOut = () => {
    if (ops.apply((d) => patchContact(d, contact.id, { consent: 'unsubscribed' }, { kind: 'consent', label: `Unsubscribed from marketing themselves${reason ? ` — ${reason}` : ''}` }))) setJustChanged('out');
  };
  const optIn = () => {
    if (ops.apply((d) => patchContact(d, contact.id, { consent: 'subscribed' }, { kind: 'consent', label: 'Opted back in to marketing themselves' }))) setJustChanged('in');
  };

  const Icon = justChanged === 'in' || subscribed ? BellRingIcon : justChanged === 'out' ? MailCheckIcon : BellOffIcon;

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> Back to {business}
          </Link>
          <Icon size={30} aria-hidden style={{ color: t.text }} />
          <CheckoutHeading
            theme={t}
            level={1}
            sub={
            justChanged === 'out' ?
            `You won’t get offers or updates from ${business} any more. It can take up to a day for messages already scheduled to stop.` :
            justChanged === 'in' ?
            `Welcome back. ${business} can send you offers and updates again.` :
            `Choose what ${business} can send you. Messages about your own orders and bookings always arrive.`
            }>
            
            {justChanged === 'out' ? 'You’re unsubscribed' : justChanged === 'in' ? 'You’re subscribed again' : 'Your message preferences'}
          </CheckoutHeading>

          <section aria-labelledby="pref-status" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="pref-status" className="text-[15px] font-semibold" style={{ color: t.text }}>
                  Offers and updates
                </h2>
                <p className="mt-0.5 text-[13.5px] leading-relaxed" style={muted}>
                  New products, sales, events and news, by email or WhatsApp.
                </p>
              </div>
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ color: t.text, border: `1px solid ${t.mutedText}` }}>
                {subscribed ? 'On' : 'Off'}
              </span>
            </div>

            {subscribed ?
            <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium" style={{ color: t.text }}>
                    Why are you leaving? (optional)
                  </span>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full rounded-[10px] px-3 text-[14.5px]" style={{ background: 'transparent', color: t.text, border: `1px solid ${t.mutedText}` }}>
                    <option value="">Choose…</option>
                    {reasons.map((r) =>
                  <option key={r}>{r}</option>
                  )}
                  </select>
                </label>
                <PrimaryButton theme={t} onClick={optOut}>
                  Unsubscribe from offers
                </PrimaryButton>
              </> :

            <>
                <p className="text-[13.5px] leading-relaxed" style={muted}>
                  {contact.consent === 'unsubscribed' ? 'You’ve opted out. Only you can turn this back on.' : 'You only get messages about your orders and bookings.'}
                </p>
                <SecondaryButton theme={t} onClick={optIn}>
                  Send me offers and updates
                </SecondaryButton>
              </>
            }
          </section>

          <p className="text-[12.5px] leading-relaxed" style={muted}>
            Showing preferences for {contact.email || contact.phone || 'your contact details'}. Order, booking and payment messages aren’t affected. Run by KUBICU on behalf of {business}.
          </p>
        </main>
      </PageSurface>
    </div>);

}