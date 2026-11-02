import React from 'react';
import { BadgeCheckIcon, StarIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useProof } from '../../hooks/useProof';
import { ratingSummary, showable } from '../../utils/proof';
import { Stars } from '../proof/Stars';
import { cardStyle, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/**
 * Review summary (D170): average and count from verified Proof reviews only, with the source named,
 * then the latest few. Nothing shows until there's at least one real review.
 */
export function ReviewSummaryBlock({ block, theme, mode }: BlockProps<'reviewSummary'>) {
  // Fixed wording follows the visitor's language (D505); review text and names stay as written.
  const { t: tr } = useT();
  const c = block.content;
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const { data } = useProof(pageOps.workspaceId ?? current.id);
  const all = data?.reviews ?? [];
  const { count, average } = ratingSummary(all);
  const latest = all.filter(showable).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, c.limit);
  if (count === 0) return mode === 'edit' ? <BlockPlaceholder icon={StarIcon} title="No verified reviews yet" hint="Ask customers for reviews in Proof of work" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <div className="grid gap-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10">
        <div>
          <p className="text-[56px] font-medium leading-none tabular-nums" style={{ fontFamily: display, color: theme.text }}>{average.toFixed(1)}</p>
          <div className="mt-2"><Stars rating={average} size={18} color={theme.text} /></div>
          <p className="mt-2 text-[14px]" style={{ color: theme.mutedText }}>{tr('Verified reviews: {n}', { n: count })}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px]" style={{ color: theme.mutedText }}>
            <BadgeCheckIcon size={13} aria-hidden /> {tr('Each one is from a real order, booking or job (KUBICU Proof)')}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {latest.map((r) =>
          <li key={r.id} className="p-4" style={cardStyle(theme)}>
              <div className="flex items-center justify-between gap-3">
                <Stars rating={r.rating} size={13} color={theme.text} />
                <span className="text-[12px]" style={{ color: theme.mutedText }}>{tr(r.source.label)}</span>
              </div>
              {r.text && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: theme.text }}>{r.text}</p>}
              <p className="mt-2 text-[13px] font-medium" style={{ color: mix(theme.text, 70) }}>{r.displayName}</p>
            </li>
          )}
        </ul>
      </div>
    </section>);

}