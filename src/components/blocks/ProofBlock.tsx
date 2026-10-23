import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { cardStyle, fontsFor } from './pageStyle';
import { BlockPlaceholder } from './BlockPlaceholder';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useProof } from '../../hooks/useProof';
import { matchedLabel, monthYear, ratingSummary, showable, shortDay, sourceBadge } from '../../utils/proof';
import { MediaImage } from '../media/MediaImage';
import { Stars } from '../proof/Stars';

/** Verified reviews and delivered work from Proof of work (D91). */
export function ProofBlock({ block, theme: t, mode }: BlockProps<'proof'>) {
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const { data } = useProof(pageOps.workspaceId ?? current.id);
  const c = block.content;
  const muted = { color: t.mutedText };
  const showReviews = c.show !== 'work';
  const showWork = c.show !== 'reviews';
  const { count, average } = ratingSummary(data?.reviews ?? []);
  const reviews = (data?.reviews ?? []).filter(showable).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, c.limit);
  const work = (data?.work ?? []).filter((w) => w.published).sort((a, b) => b.date.localeCompare(a.date)).slice(0, c.limit);
  const empty = (!showReviews || count === 0) && (!showWork || work.length === 0);

  if (empty) {
    if (mode !== 'edit') return null;
    return <BlockPlaceholder icon={BadgeCheckIcon} title="No proof to show yet" hint="Ask for reviews and add delivered work in Proof of work" theme={t} />;
  }

  return (
    <section className="flex flex-col gap-4" aria-label={c.title || 'Proof of work'}>
      {c.title &&
      <h2 className="text-[20px] font-semibold leading-tight" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
          {c.title}
        </h2>
      }

      {showReviews && count > 0 &&
      <div className="flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-2 text-[15px]" style={{ color: t.text }}>
            <Stars rating={average} size={16} />
            <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
            <span style={muted}>
              · {count} verified review{count === 1 ? '' : 's'}
            </span>
          </p>
          <p className="text-[12.5px]" style={muted}>
            Every review comes from a real order, booking or job. The business can’t edit them, and hidden ones still count in the rating.
          </p>
          {reviews.map((r) =>
        <figure key={r.id} className="p-4" style={cardStyle(t)}>
              <Stars rating={r.rating} size={13} color={t.text} />
              <blockquote className="mt-2 text-[15px] leading-relaxed" style={{ color: t.text }}>
                “{r.text}”
              </blockquote>
              <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 text-[12.5px]" style={muted}>
                <span className="font-semibold" style={{ color: t.text }}>
                  {r.displayName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheckIcon size={12} aria-hidden /> {sourceBadge[r.source.kind]}
                </span>
                <span>· {monthYear(r.createdAt)}</span>
              </figcaption>
              {r.reply &&
          <p className="mt-3 border-l-2 pl-3 text-[13px]" style={{ ...muted, borderColor: `${t.mutedText}55` }}>
                  <span className="font-semibold" style={{ color: t.text }}>
                    Reply:
                  </span>{' '}
                  {r.reply}
                </p>
          }
            </figure>
        )}
        </div>
      }

      {showWork && work.length > 0 &&
      <ol className="flex flex-col gap-4 border-l pl-5" style={{ borderColor: `${t.mutedText}44` }} aria-label="Delivered work">
          {work.map((w) =>
        <li key={w.id} className="relative">
              <span aria-hidden className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: t.text }} />
              <p className="text-[12.5px]" style={muted}>
                {shortDay(w.date)}
              </p>
              <p className="text-[15px] font-semibold" style={{ color: t.text }}>
                {w.title}
              </p>
              {w.description &&
          <p className="mt-0.5 text-[14px] leading-relaxed" style={muted}>
                  {w.description}
                </p>
          }
              {w.imageUrl && <MediaImage src={w.imageUrl} alt={w.imageAlt} loading="lazy" className="mt-2 aspect-video w-full rounded-[12px] object-cover" />}
              <p className="mt-1.5 flex flex-wrap gap-x-3 text-[12.5px]" style={muted}>
                {w.source &&
            <span className="inline-flex items-center gap-1">
                    <BadgeCheckIcon size={12} aria-hidden /> {matchedLabel[w.source.kind]}
                  </span>
            }
                {w.clientName && <span>For {w.clientName}</span>}
              </p>
            </li>
        )}
        </ol>
      }
    </section>);

}