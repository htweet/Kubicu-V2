import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, CircleIcon, ShieldCheckIcon } from 'lucide-react';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { usePublicPassport } from '../hooks/usePublicPassport';
import { levelLabels, publicSignals } from '../utils/trustPassport';
import { cardRadius, fontsFor, mix } from '../components/blocks/pageStyle';
import { pageHref } from '../utils/sitePages';
import { Unavailable } from './PublicPage';

/** Public Trust Passport (D111): what buyers can rely on, worked out now from checked records. */
export function PublicTrustPassport() {
  const { handle = '' } = useParams();
  const resolved = useResolvedPage(handle);
  const wid = resolved && !resolved.example ? resolved.workspaceId ?? '' : '';
  const commerce = usePageCommerce(wid || null, !!resolved?.isOwn);
  const { passport, appOn } = usePublicPassport(wid, commerce.data?.orders ?? []);

  useEffect(() => {
    const prev = document.title;
    if (resolved) document.title = `Trust Passport · ${resolved.doc.title}`;
    return () => {
      document.title = prev;
    };
  }, [resolved]);

  if (!resolved || !wid) return <Unavailable handle={`${handle}/trust`} />;
  if (!appOn) return <Unavailable handle={`${handle}/trust`} title="No Trust Passport here" body={`${resolved.doc.title} doesn’t show a Trust Passport right now.`} homeHref={pageHref(handle, '')} homeLabel={`Go to ${resolved.doc.title}`} />;

  const t = resolved.doc.theme;
  const met = publicSignals(passport);
  const notYet = passport.signals.filter((s) => !s.met);
  const today = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const box = { background: t.surface, borderRadius: cardRadius(t), border: `1px solid ${mix(t.text, 12)}` };

  return (
    <main className="min-h-screen w-full" style={{ background: t.background, color: t.text, fontFamily: fontsFor(t).body }}>
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-5 pb-16 pt-6">
        <Link to={pageHref(handle, '')} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold">
          <ArrowLeftIcon size={15} aria-hidden /> {resolved.doc.title}
        </Link>

        <header className="flex flex-col items-center gap-3 px-5 py-8 text-center" style={box}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: t.text, color: t.background }}>
            <ShieldCheckIcon size={26} aria-hidden />
          </span>
          <p className="text-[13px] font-medium" style={{ color: t.mutedText }}>
            KUBICU Trust Passport
          </p>
          <h1 className="text-[28px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display }}>
            {levelLabels[passport.level]}
          </h1>
          <p className="text-[15px]" style={{ color: t.mutedText }}>
            {resolved.doc.title} · <span className="font-semibold tabular-nums" style={{ color: t.text }}>{passport.score}</span>/100
          </p>
          <span className="mt-1 block h-1.5 w-full max-w-xs overflow-hidden rounded-full" style={{ background: mix(t.text, 10) }} role="img" aria-label={`Score ${passport.score} out of 100`}>
            <span className="block h-full rounded-full" style={{ width: `${passport.score}%`, background: t.text }} />
          </span>
          <p className="text-[12.5px]" style={{ color: t.mutedText }}>
            Checked {today}, when you opened this page.
          </p>
        </header>

        <section aria-labelledby="tp-met" className="flex flex-col gap-3">
          <h2 id="tp-met" className="text-[18px] font-medium" style={{ fontFamily: fontsFor(t).display }}>
            What’s been checked
          </h2>
          {met.length === 0 ?
          <p className="text-[14.5px] leading-relaxed" style={{ color: t.mutedText }}>
              {resolved.doc.title} is new on KUBICU, so there’s nothing to show yet. That doesn’t mean anything is wrong — checks build up with verification, completed orders and verified reviews.
            </p> :

          <ul className="flex flex-col" style={box}>
              {met.map((s, i) =>
            <li key={s.id} className="flex items-start gap-3 px-4 py-3.5" style={{ borderTop: i ? `1px solid ${mix(t.text, 8)}` : undefined }}>
                  <CheckIcon size={17} className="mt-0.5 shrink-0" aria-hidden />
                  <span>
                    <span className="block text-[15px] font-semibold">{s.title}</span>
                    <span className="block text-[13.5px]" style={{ color: t.mutedText }}>
                      {s.evidence}
                    </span>
                  </span>
                </li>
            )}
            </ul>
          }
          {notYet.length > 0 &&
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" style={{ color: t.mutedText }}>
              <CircleIcon size={10} aria-hidden /> Not met yet: {notYet.map((s) => s.title).join(', ')}
            </p>
          }
        </section>

        <section aria-labelledby="tp-how" className="flex flex-col gap-2 text-[14px] leading-relaxed" style={{ color: t.mutedText }}>
          <h2 id="tp-how" className="text-[16px] font-medium" style={{ color: t.text }}>
            How this works
          </h2>
          <p>Every check comes from records KUBICU holds — identity and business verification, completed orders, protected (escrow) payments and reviews from real customers. The business can’t add or edit any of it, and it changes as their record changes.</p>
          <p>It’s a guide, not a guarantee. For bigger orders, pay with buyer protection where it’s offered, and never pay into a personal account you were sent privately.</p>
          <Link to="/about/safety" className="self-start font-semibold underline underline-offset-2" style={{ color: t.text }}>
            Safety tips for buying online
          </Link>
        </section>
      </div>
    </main>);

}