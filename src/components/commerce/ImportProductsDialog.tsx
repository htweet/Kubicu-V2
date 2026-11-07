import React, { useMemo, useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircle2Icon, DownloadIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { upsertProduct } from '../../utils/commerce/ops';
import { downloadCsv, parseCsv, toCsv } from '../../utils/csv';
import { blankProduct } from './ProductEditor';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { formatMoney } from '../../utils/currency';

interface Row {
  line: number;
  name: string;
  price: number | null;
  stock: number;
  sku: string;
  description: string;
  errors: string[];
}

const TEMPLATE = toCsv(['name', 'price_ngn', 'stock', 'sku', 'description'], [
  ['Voile wrap blouse', 32000, 10, 'WRAP-M', 'Cream cotton voile'],
  ['Adire scarf', '', 5, '', 'Leave price blank for “Price on request”'],
]);

/** CSV import with a row-by-row preview. Rows with errors are skipped, never half-imported. */
export function ImportProductsDialog({ open, onClose, remaining }: { open: boolean; onClose: () => void; remaining: number | null }) {
  const { data, apply } = useCommerce();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows(null);
    setFileError('');
  };

  const onFile = async (file: File) => {
    reset();
    if (!/\.csv$/i.test(file.name)) return setFileError('Choose a .csv file. In Excel or Google Sheets, use “Download as CSV”.');
    const text = await file.text();
    const table = parseCsv(text);
    if (table.length < 2) return setFileError('The file has no product rows under the header.');
    const header = table[0].map((h) => h.trim().toLowerCase());
    const col = (n: string) => header.indexOf(n);
    if (col('name') === -1) return setFileError('Add a “name” column. Download the template to see the format.');
    const existingSkus = new Set(data.products.flatMap((p) => p.variants.map((v) => v.sku)));
    const seen = new Set<string>();
    const parsed = table.slice(1).map((r, i): Row => {
      const get = (n: string) => (col(n) >= 0 ? (r[col(n)] ?? '').trim() : '');
      const errors: string[] = [];
      const name = get('name');
      if (!name) errors.push('Missing name');
      const rawPrice = get('price_ngn').replace(/[₦,\s]/g, '');
      const price = rawPrice === '' ? null : Number(rawPrice);
      if (price !== null && (!Number.isFinite(price) || price < 0)) errors.push('Price isn’t a number');
      const rawStock = get('stock').replace(/[,\s]/g, '');
      const stock = rawStock === '' ? 0 : Number(rawStock);
      if (!Number.isInteger(stock) || stock < 0) errors.push('Stock must be a whole number');
      const sku = get('sku').toUpperCase();
      if (sku && (existingSkus.has(sku) || seen.has(sku))) errors.push(`SKU ${sku} already used`);
      if (sku) seen.add(sku);
      return { line: i + 2, name, price: price !== null && Number.isFinite(price) ? Math.round(price) : null, stock: Number.isInteger(stock) ? stock : 0, sku, description: get('description'), errors };
    });
    setRows(parsed);
  };

  const valid = useMemo(() => rows?.filter((r) => r.errors.length === 0) ?? [], [rows]);
  const capped = remaining === null ? valid : valid.slice(0, Math.max(0, remaining));

  const runImport = () => {
    const products: Product[] = capped.map((r) => {
      const p = blankProduct('physical');
      return { ...p, name: r.name, priceNgn: r.price, description: r.description, variants: [{ ...p.variants[0], sku: r.sku || p.variants[0].sku, stock: r.stock }] };
    });
    if (apply((d) => products.reduce((acc, p) => upsertProduct(acc, p), d))) {
      toast(`Imported ${products.length} product${products.length === 1 ? '' : 's'} as drafts`, { description: 'Add photos, then make them active.' });
      reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      size="lg"
      title="Import products from CSV"
      description="Columns: name, price_ngn, stock, sku, description. Products arrive as drafts so nothing goes live by accident."
      footer={
        <>
          <Button variant="secondary" leadingIcon={DownloadIcon} onClick={() => downloadCsv('kubicu-products-template.csv', TEMPLATE)}>
            Download template
          </Button>
          {rows ? (
            <Button onClick={runImport} disabled={capped.length === 0}>
              Import {capped.length} product{capped.length === 1 ? '' : 's'}
            </Button>
          ) : (
            <Button leadingIcon={UploadIcon} onClick={() => inputRef.current?.click()} data-autofocus>
              Choose CSV file
            </Button>
          )}
        </>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = '';
        }}
      />
      {fileError && (
        <p className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-label text-danger" role="alert">
          <AlertCircleIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
          {fileError}
        </p>
      )}
      {!rows && !fileError && <p className="text-label text-fg-muted">You’ll see every row before anything is imported.</p>}
      {rows && (
        <div className="flex flex-col gap-3">
          <p className="text-label text-fg" aria-live="polite">
            <span className="font-semibold">{valid.length} ready</span>
            {rows.length - valid.length > 0 && <span className="text-danger"> · {rows.length - valid.length} with errors (skipped)</span>}
            {remaining !== null && valid.length > capped.length && <span className="text-warning"> · Free plan limit: only {capped.length} can be added</span>}
          </p>
          {/* Phones: rows with problems first, as a readable list. */}
          <ul aria-label="Import preview" className="max-h-72 divide-y divide-line overflow-auto rounded-md border border-line sm:hidden">
            {[...rows].sort((a, b) => Number(b.errors.length > 0) - Number(a.errors.length > 0)).map((r) => (
              <li key={r.line} className={cn('px-3 py-2.5', r.errors.length && 'bg-danger-soft/50')}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-label font-medium text-fg">
                    <span className="mr-1.5 text-caption tabular-nums text-fg-subtle">Row {r.line}</span>
                    {r.name || '—'}
                  </span>
                  <span className="shrink-0 text-caption tabular-nums text-fg-muted">
                    {r.price === null ? 'On request' : formatMoney(r.price)} · {r.stock}
                  </span>
                </div>
                {r.errors.length ? (
                  <p className="mt-0.5 text-caption font-medium text-danger">{r.errors.join(' · ')}</p>
                ) : (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-caption font-medium text-success">
                    <CheckCircle2Icon size={13} aria-hidden /> Ready
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden max-h-72 overflow-auto rounded-md border border-line sm:block">
            <table className="w-full text-left text-label">
              <caption className="sr-only">Import preview</caption>
              <thead className="sticky top-0 bg-sunken text-caption font-semibold text-fg-muted">
                <tr>
                  <th scope="col" className="px-3 py-2">Row</th>
                  <th scope="col" className="px-3 py-2">Name</th>
                  <th scope="col" className="px-3 py-2 text-right">Price</th>
                  <th scope="col" className="px-3 py-2 text-right">Stock</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={cn('border-t border-line', r.errors.length && 'bg-danger-soft/50')}>
                    <td className="px-3 py-2 tabular-nums text-fg-subtle">{r.line}</td>
                    <td className="px-3 py-2 text-fg">{r.name || '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-fg">{r.price === null ? 'On request' : formatMoney(r.price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-fg">{r.stock}</td>
                    <td className="px-3 py-2">
                      {r.errors.length ? (
                        <span className="text-caption font-medium text-danger">{r.errors.join(' · ')}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-caption font-medium text-success">
                          <CheckCircle2Icon size={13} aria-hidden /> Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="tertiary" size="sm" className="self-start" onClick={() => inputRef.current?.click()}>
            Choose a different file
          </Button>
        </div>
      )}
    </Dialog>
  );
}
