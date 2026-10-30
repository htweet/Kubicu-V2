import React from 'react';
import { Section } from '../ui/layout/Section';
import { useT } from '../../contexts/LocaleContext';

interface Row {
  id: string;
  label: string;
  visits: number;
  share: number;
  conversions: number;
  rate: number;
}

interface Props {
  id: string;
  title: string;
  /** Screen-reader caption for the table. */
  caption: string;
  rows: Row[];
  note: string;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** A short share-of-visits breakdown with conversions — devices, new vs returning (D258). */
export function AudienceBreakdown({ id, title, caption, rows, note }: Props) {
  const { t } = useT();
  return (
    <Section id={id} title={title} className="gap-3">
      {rows.length === 0 ?
      <p className="text-label text-fg-muted">{t('No visits in this period.')}</p> :

      <table className="w-full text-label">
          <caption className="sr-only">{t(caption)}</caption>
          <thead>
            <tr className="border-b border-line text-caption text-fg-subtle">
              <th scope="col" className="py-2 text-left font-medium">
                {t('Visits')}
              </th>
              <th scope="col" className="w-16 py-2 text-right font-medium">
                {t('Count')}
              </th>
              <th scope="col" className="w-28 py-2 text-right font-medium" title={t('Paid orders, bookings, forms and sign-ups')}>
                {t('Converted')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
          <tr key={r.id} className="border-b border-line">
                <td className="py-2.5 pr-4">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-fg">{t(r.label)}</span>
                    <span className="text-caption tabular-nums text-fg-subtle">{pct(r.share)}</span>
                  </span>
                  <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-sunken">
                    <span className="block h-full rounded-full bg-action" style={{ width: `${Math.max(2, r.share * 100)}%` }} />
                  </span>
                </td>
                <td className="py-2.5 text-right tabular-nums text-fg">{r.visits}</td>
                <td className="py-2.5 text-right tabular-nums text-fg-muted">
                  {r.conversions} <span className="text-caption">({pct(r.rate)})</span>
                </td>
              </tr>
          )}
          </tbody>
        </table>
      }
      <p className="text-caption text-fg-subtle">{t(note)}</p>
    </Section>);

}