import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData } from '../../types/commerce';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useProof } from '../../hooks/useProof';
import { ratingSummary, showable } from '../../utils/proof';
import { Stars } from '../proof/Stars';
import { fontsFor, mix } from '../blocks/pageStyle';

/**
 * What customers said about this product (D196): only Proof reviews matched to a real order that
 * contained it. Nothing renders — no empty stars — until there is at least one.
 */
export function ProductReviews({ theme, data, productId }: { theme: PageTheme; data: CommerceData; productId: string }) {
  const pageOps = usePageOpsContext();
  const { data: proof } = useProof(pageOps.workspaceId ?? null);
  const orderIds = new Set(data.orders.filter((o) => o.items.some((i) => i.productId === productId)).map((o) => o.id));
  const reviews = (proof?.reviews ?? []).filter((r) => r.source.kind === 'order' && orderIds.has(r.source.id));
  const { count, average } = ratingSummary(reviews);
  if (!count) return null;
  const words = reviews.filter(showable).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <section aria-labelledby="product-reviews" className="flex flex-col gap-4 border-t pt-8" style={{ borderColor: mix(theme.text, 12) }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="product-reviews" className="text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          What customers said
        </h2>
        <p className="flex items-center gap-2 text-[14px]" style={{ color: theme.mutedText }}>
          <Stars rating={average} size={14} color={theme.text} />
          <span className="tabular-nums">
            {average.toFixed(1)} from {count} verified order{count === 1 ? '' : 's'}
          </span>
        </p>
      </div>
      {words.length > 0 && (
        <ul className="grid gap-6 md:grid-cols-3">
          {words.map((r) => (
            <li key={r.id} className="flex flex-col gap-2">
              <Stars rating={r.rating} size={12} color={theme.text} />
              <p className="text-[15px] leading-relaxed" style={{ color: theme.text }}>
                {r.text}
              </p>
              <p className="text-[13px] font-medium" style={{ color: theme.mutedText }}>
                {r.displayName}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="inline-flex items-center gap-1 text-[12px]" style={{ color: theme.mutedText }}>
        <BadgeCheckIcon size={13} aria-hidden /> Each review is matched to a completed order (KUBICU Proof)
      </p>
    </section>
  );
}
