import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BadgeCheckIcon, PrinterIcon } from 'lucide-react';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { useProof } from '../hooks/useProof';
import { matchedLabel } from '../utils/proof';
import { certificateCode } from '../utils/proofCertificate';
import { MediaImage } from '../components/media/MediaImage';
import { cardRadius, fontsFor, mix } from '../components/blocks/pageStyle';
import { pageHref } from '../utils/sitePages';
import { Unavailable } from './PublicPage';

/**
 * Proof-of-work certificate (D126): a shareable, printable record that a piece of work was
 * delivered and matched to a real KUBICU order, booking or job. Opening the link is the check.
 */
export function PublicWorkCertificate() {
  const { handle = '', id = '' } = useParams();
  const page = useResolvedPage(handle);
  const { data } = useProof(page && !page.example ? page.workspaceId ?? null : null);
  const item = data?.work.find((w) => w.id === id);

  useEffect(() => {
    const prev = document.title;
    if (page && item) document.title = `Certificate · ${item.title} · ${page.doc.title}`;
    return () => {
      document.title = prev;
    };
  }, [page, item]);

  if (!page) return <Unavailable handle={`${handle}/work`} />;
  if (!item || !item.published || !item.source)
  return (
    <Unavailable
      handle={`${handle}/work/${id}`}
      title="No certificate here"
      body="This certificate doesn’t exist, was withdrawn by the business, or the work isn’t matched to a KUBICU record."
      homeHref={pageHref(handle, '')}
      homeLabel={`Go to ${page.doc.title}`} />);



  const t = page.doc.theme;
  const fonts = fontsFor(t);
  const delivered = new Date(item.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const code = certificateCode(item.id);

  return (
    <main className="cert-page min-h-screen w-full" style={{ background: t.background, color: t.text, fontFamily: fonts.body }}>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-5 pb-16 pt-6">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link to={pageHref(handle, '')} className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold">
            <ArrowLeftIcon size={15} aria-hidden /> {page.doc.title}
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold underline underline-offset-2">
            <PrinterIcon size={15} aria-hidden /> Print or save as PDF
          </button>
        </div>

        <article className="overflow-hidden" style={{ background: t.surface, borderRadius: cardRadius(t), border: `1px solid ${mix(t.text, 14)}` }}>
          <header className="flex flex-col items-center gap-2 px-6 pb-6 pt-8 text-center" style={{ borderBottom: `1px solid ${mix(t.text, 10)}` }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: t.text, color: t.background }}>
              <BadgeCheckIcon size={24} aria-hidden />
            </span>
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: t.mutedText }}>
              Certificate of delivered work
            </p>
            <h1 className="text-[26px] font-medium leading-tight" style={{ fontFamily: fonts.display }}>
              {item.title}
            </h1>
            <p className="text-[15px]" style={{ color: t.mutedText }}>
              by <span className="font-semibold" style={{ color: t.text }}>{page.doc.title}</span>
            </p>
          </header>

          {item.imageUrl && <MediaImage src={item.imageUrl} alt={item.imageAlt} className="aspect-[16/9] w-full object-cover" />}

          <dl className="grid gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-2">
            <div>
              <dt className="text-[12.5px]" style={{ color: t.mutedText }}>Delivered</dt>
              <dd className="text-[15px] font-semibold">{delivered}</dd>
            </div>
            <div>
              <dt className="text-[12.5px]" style={{ color: t.mutedText }}>Matched to</dt>
              <dd className="text-[15px] font-semibold">{matchedLabel[item.source.kind]}</dd>
            </div>
            {item.clientName &&
            <div>
                <dt className="text-[12.5px]" style={{ color: t.mutedText }}>For</dt>
                <dd className="text-[15px] font-semibold">{item.clientName}</dd>
              </div>
            }
            <div>
              <dt className="text-[12.5px]" style={{ color: t.mutedText }}>Certificate code</dt>
              <dd className="font-mono text-[15px] font-semibold tracking-wider">{code}</dd>
            </div>
            {item.description &&
            <div className="sm:col-span-2">
                <dt className="text-[12.5px]" style={{ color: t.mutedText }}>About the work</dt>
                <dd className="text-[15px] leading-relaxed">{item.description}</dd>
              </div>
            }
          </dl>

          <footer className="px-6 py-4 text-[13px] leading-relaxed" style={{ background: mix(t.text, 4), color: t.mutedText }}>
            KUBICU matched this work to a real {item.source.kind === 'job' ? 'job' : item.source.kind} in {page.doc.title}’s records. The business can withdraw it, but can’t change the date or the record it’s matched to. To check a printed copy, ask the business for this certificate’s link and make sure the code reads {code}.
          </footer>
        </article>
      </div>
    </main>);

}