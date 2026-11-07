import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BadgeCheckIcon, StarIcon } from 'lucide-react';
import type { ProofReview } from '../types/proof';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { useProof } from '../hooks/useProof';
import { firstName, sourceBadge } from '../utils/proof';
import { uid } from '../utils/id';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, ThemedField } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';

const ratingWords = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

/** One-time review link for a customer with a real completed record (D91). */
export function ReviewSubmit() {
  const { handle = '', token = '' } = useParams();
  const page = useResolvedPage(handle);
  const { data, update } = useProof(page?.workspaceId ?? null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState<string | null>(null);
  const [permission, setPermission] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  if (!page) return <Unavailable handle={handle} />;
  const request = data?.requests.find((r) => r.token === token);
  if (!data || !request) return <Unavailable handle={handle} title="This review link doesn’t work" body="It may be incomplete or no longer valid. Ask the business to send it again." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const business = page.doc.title;
  const shownName = name ?? firstName(request.customerName);
  const used = !!request.reviewId && !done;

  const submit = () => {
    setTried(true);
    if (!rating || shownName.trim().length < 1) return;
    const review: ProofReview = { id: uid('rev'), requestId: request.id, source: request.source, rating, text: text.trim(), displayName: shownName.trim(), permission, hidden: false, createdAt: new Date().toISOString() };
    update((d) => ({ ...d, reviews: [review, ...d.reviews], requests: d.requests.map((r) => (r.id === request.id ? { ...r, reviewId: review.id } : r)) }));
    setDone(true);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {business}
          </Link>

          {done || used ? (
            <>
              <BadgeCheckIcon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub={done ? `Thank you, ${firstName(request.customerName)}. ${permission ? `Your review can now appear on ${business}’s page with a “${sourceBadge[request.source.kind]}” label.` : 'Your rating counts towards their score. Your words stay private, as you asked.'}` : 'Each review link works once, and this one has already been used.'}>
                {done ? 'Review sent' : 'You’ve already left a review'}
              </CheckoutHeading>
            </>
          ) : (
            <>
              <CheckoutHeading theme={t} level={1} sub={`For ${request.source.label}. Your review is labelled “${sourceBadge[request.source.kind]}” because it’s tied to this. ${business} can reply or hide it, but can’t change your words.`}>
                How was {business}?
              </CheckoutHeading>

              <section className="flex flex-col gap-5 p-5" style={cardStyle(t)}>
                <fieldset>
                  <legend className="text-[14px] font-semibold" style={{ color: t.text }}>
                    Your rating
                  </legend>
                  <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rating out of 5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n === 1 ? '' : 's'} — ${ratingWords[n]}`}
                        onClick={() => setRating(n)}
                        className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2"
                        style={{ color: n <= rating ? t.text : t.mutedText }}
                      >
                        <StarIcon size={28} aria-hidden className={n <= rating ? 'fill-current' : ''} />
                      </button>
                    ))}
                    <span className="ml-2 text-[14px]" style={muted} aria-live="polite">
                      {ratingWords[rating]}
                    </span>
                  </div>
                  {tried && !rating && (
                    <p className="mt-1.5 text-[13px] font-medium" style={{ color: t.text }} role="alert">
                      Choose a rating from 1 to 5.
                    </p>
                  )}
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[14px] font-semibold" style={{ color: t.text }}>
                    Tell others about it <span className="font-normal" style={muted}>(optional)</span>
                  </span>
                  <textarea
                    rows={4}
                    maxLength={600}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-[12px] border px-3 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2"
                    style={{ background: t.background, color: t.text, borderColor: `${t.mutedText}55` }}
                  />
                </label>

                <ThemedField theme={t} label="Name to show" value={shownName} onChange={setName} error={tried && !shownName.trim() ? 'Add a name or initials.' : undefined} />

                <label className="flex items-start gap-3 text-[14px]" style={{ color: t.text }}>
                  <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    Show my review on {business}’s page
                    <span className="block text-[12.5px]" style={muted}>
                      Leave unticked to keep your words private — your rating still counts.
                    </span>
                  </span>
                </label>

                <PrimaryButton theme={t} onClick={submit}>
                  Send review
                </PrimaryButton>
              </section>
            </>
          )}
        </main>
      </PageSurface>
    </div>
  );
}
