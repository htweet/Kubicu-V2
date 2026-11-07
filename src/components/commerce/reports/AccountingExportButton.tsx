import React, { useState } from 'react';
import { toast } from 'sonner';
import { CalculatorIcon } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { accountingCsv, accountingFormats, type AccountingFormat } from '../../../utils/accountingExport';
import type { IncomeEntry } from '../../../utils/commerce/salesReport';
import { downloadCsv } from '../../../utils/csv';
import { cn } from '../../../utils/cn';

/** Sales report → Accounting export (D232). Only shown while the Accounting export extension is on. */
export function AccountingExportButton({ entries, fileTag, rangeText }: { entries: IncomeEntry[]; fileTag: string; rangeText: string }) {
  const market = useMarketplace();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<AccountingFormat>('quickbooks');
  if (!market.isActive('accounting-export')) return null;
  const live = entries.filter((e) => !e.sample);
  const sampleCount = entries.length - live.length;

  const download = () => {
    downloadCsv(`kubicu-${format}-${fileTag}.csv`, accountingCsv(entries, format));
    toast.success(`${accountingFormats[format].label} file downloaded`, { description: `${live.length} payments · ${rangeText}` });
    setOpen(false);
  };

  return (
    <>
      <Button variant="secondary" leadingIcon={CalculatorIcon} onClick={() => setOpen(true)} disabled={live.length === 0}>
        Accounting export
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Accounting export"
        description={`${rangeText} · ${live.length} payment${live.length === 1 ? '' : 's'}${sampleCount ? ` · ${sampleCount} sample left out` : ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={download}>Download</Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-semibold text-fg">Format</legend>
          {(Object.keys(accountingFormats) as AccountingFormat[]).map((f) => (
            <label key={f} className={cn('flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3', format === f ? 'border-action bg-action-soft' : 'border-line')}>
              <input type="radio" name="acct-format" value={f} checked={format === f} onChange={() => setFormat(f)} className="mt-1 accent-[var(--color-action,currentColor)]" />
              <span className="min-w-0">
                <span className="block text-label font-medium text-fg">{accountingFormats[f].label}</span>
                <span className="block text-caption text-fg-muted">{accountingFormats[f].hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Dialog>
    </>
  );
}
