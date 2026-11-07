import React, { useMemo } from 'react';
import { DownloadIcon } from 'lucide-react';
import type { Order } from '../../../types/commerce';
import type { CountryCode } from '../../../types/country';
import { Card } from '../../ui/layout/Card';
import { Button } from '../../ui/Button';
import { useT } from '../../../contexts/LocaleContext';
import { countryInfo, activeCountry } from '../../../utils/country';
import { formatNgn } from '../../../utils/format';
import { downloadCsv, toCsv } from '../../../utils/csv';
import { vatRateLabel } from '../../../utils/commerce/shopSettings';

interface Row {
  key: string;
  country: CountryCode;
  month: string;
  ratePct: number;
  sales: number;
  tax: number;
  orders: number;
}

const monthLabel = (m: string) => new Date(`${m}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/**
 * Tax collected by country and month (D435), for filing in each country you're registered in. Older orders without a
 * tax country count as the shop's own country. Export as a spreadsheet for your accountant.
 */
export function TaxByCountryCard({ orders, business }: { orders: Order[]; business: string }) {
  const { t: tr } = useT();
  const home = activeCountry();
  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    orders.forEach((o) => {
      if (!o.vat || o.vat.amountNgn <= 0) return;
      const country = o.vat.country ?? home;
      const month = o.createdAt.slice(0, 7);
      const key = `${country}:${month}:${o.vat.ratePct}`;
      const gross = o.subtotalNgn - o.discountNgn + o.deliveryNgn + (o.vat.inclusive ? 0 : o.vat.amountNgn);
      const r = map.get(key) ?? { key, country, month, ratePct: o.vat.ratePct, sales: 0, tax: 0, orders: 0 };
      r.sales += Math.max(0, gross - o.vat.amountNgn);
      r.tax += o.vat.amountNgn;
      r.orders += 1;
      map.set(key, r);
    });
    return [...map.values()].sort((a, b) => b.month.localeCompare(a.month) || a.country.localeCompare(b.country));
  }, [orders, home]);

  const exportCsv = () => {
    const csv = toCsv(
      ['Country', 'Month', 'Rate', 'Sales before tax', 'Tax collected', 'Orders'],
      rows.map((r) => [countryInfo(r.country).name, r.month, `${r.ratePct}%`, r.sales, r.tax, r.orders]),
    );
    downloadCsv(`tax-by-country-${business.toLowerCase().replace(/\W+/g, '-')}.csv`, csv);
  };

  if (!rows.length) return null;
  const th = 'px-3 py-2 text-left text-caption font-semibold text-fg-subtle';
  return (
    <Card
      id="tax-country"
      title="Tax by country"
      description="What you collected for each country and month, to file where you’re registered."
      actions={
        <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv}>
          {tr('Export')}
        </Button>
      }
      body="flush"
      footer={<p className="text-caption text-fg-subtle">{tr('For your records — check with your accountant before filing.')}</p>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <caption className="sr-only">{tr('Tax by country')}</caption>
          <thead>
            <tr>
              <th scope="col" className={`${th} pl-5 md:pl-6`}>{tr('Country')}</th>
              <th scope="col" className={th}>{tr('Month')}</th>
              <th scope="col" className={`${th} text-right`}>{tr('Rate')}</th>
              <th scope="col" className={`${th} text-right`}>{tr('Sales before tax')}</th>
              <th scope="col" className={`${th} pr-5 text-right md:pr-6`}>{tr('Tax collected')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row" className="px-3 py-2.5 pl-5 text-left text-label font-medium text-fg md:pl-6">{tr(countryInfo(r.country).name)}</th>
                <td className="px-3 py-2.5 text-label text-fg-muted">{monthLabel(r.month)}</td>
                <td className="px-3 py-2.5 text-right text-label tabular-nums text-fg-muted">{vatRateLabel(r.ratePct)}</td>
                <td className="px-3 py-2.5 text-right text-label tabular-nums text-fg">{formatNgn(r.sales)}</td>
                <td className="px-3 py-2.5 pr-5 text-right text-label font-semibold tabular-nums text-fg md:pr-6">{formatNgn(r.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
