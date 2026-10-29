import { incomeLabels, methodLabels, type IncomeEntry } from './commerce/salesReport';
import { toCsv } from './csv';

/** Accounting export (D232): the Sales report's entries in formats accounting tools import. Sample entries are left out. */
export type AccountingFormat = 'quickbooks' | 'zoho' | 'journal';

export const accountingFormats: Record<AccountingFormat, {label: string;hint: string;}> = {
  quickbooks: { label: 'QuickBooks', hint: 'Bank transactions upload (Date, Description, Amount). Fees and refunds are their own lines.' },
  zoho: { label: 'Zoho Books', hint: 'Statement import with reference, account and VAT columns.' },
  journal: { label: 'Spreadsheet', hint: 'One row per payment: gross, fees, refunds, net and VAT — for your accountant.' }
};

const pad = (n: number) => String(n).padStart(2, '0');
const dmy = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const ymd = (iso: string) => iso.slice(0, 10);

export function accountingCsv(entries: IncomeEntry[], format: AccountingFormat): string {
  const live = entries.filter((e) => !e.sample).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const desc = (e: IncomeEntry) => [incomeLabels[e.type].label, e.ref, e.customer].filter(Boolean).join(' · ');
  if (format === 'quickbooks') {
    const rows: (string | number)[][] = [];
    live.forEach((e) => {
      rows.push([dmy(e.at), desc(e), e.paid]);
      if (e.fees) rows.push([dmy(e.at), `Processing fees · ${e.ref}`, -e.fees]);
      if (e.refunded) rows.push([dmy(e.at), `Refund · ${e.ref}`, -e.refunded]);
    });
    return toCsv(['Date', 'Description', 'Amount'], rows);
  }
  if (format === 'zoho') {
    const rows: (string | number)[][] = [];
    live.forEach((e) => {
      rows.push([ymd(e.at), e.ref, desc(e), incomeLabels[e.type].label, e.paid, e.vat]);
      if (e.fees) rows.push([ymd(e.at), e.ref, 'Processing fees', 'Payment processing fees', -e.fees, 0]);
      if (e.refunded) rows.push([ymd(e.at), e.ref, 'Refund', 'Sales returns', -e.refunded, 0]);
    });
    return toCsv(['Date', 'Reference Number', 'Description', 'Account', 'Amount', 'Tax Amount'], rows);
  }
  return toCsv(
    ['date', 'reference', 'type', 'customer', 'method', 'gross', 'fees', 'refunds', 'net', 'vat'],
    live.map((e) => [ymd(e.at), e.ref, incomeLabels[e.type].label, e.customer, e.method ? methodLabels[e.method] : '', e.paid, e.fees, e.refunded, e.net, e.vat])
  );
}