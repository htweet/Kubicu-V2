import React from 'react';
import type { Quote } from '../../utils/billing';
import { formatNgn } from '../../utils/format';

/** Line-by-line charge preview: rest of the period, credit for unused time, VAT, total today. */
export function QuoteTable({ quote }: {quote: Quote;}) {
  const money = (n: number) => n < 0 ? `−${formatNgn(-n)}` : formatNgn(n);
  return (
    <dl className="flex flex-col gap-2 rounded-lg border border-line p-4 text-label">
      {quote.lines.map((l) =>
      <div key={l.label} className="flex items-start justify-between gap-4">
          <dt className="text-fg-muted">{l.label}</dt>
          <dd className={l.amountNgn < 0 ? 'shrink-0 tabular-nums text-success' : 'shrink-0 tabular-nums text-fg'}>{money(l.amountNgn)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-line pt-2">
        <dt className="text-fg-muted">VAT (7.5%, example)</dt>
        <dd className="tabular-nums text-fg">{formatNgn(quote.vat)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-semibold text-fg">Due today</dt>
        <dd className="font-display text-heading font-semibold tabular-nums text-fg">{formatNgn(quote.total)}</dd>
      </div>
    </dl>);

}