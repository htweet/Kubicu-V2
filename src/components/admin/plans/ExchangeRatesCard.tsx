import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { clearRateToday, FX_EVENT, fxCodes, rateHistory, rateOn, setRateToday, type FxCode } from '../../../utils/fxRates';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { ReasonDialog } from '../ReasonDialog';

const names: Record<FxCode, string> = { KES: 'Kenyan shilling', GHS: 'Ghanaian cedi', ZAR: 'South African rand' };
const symbols: Record<FxCode, string> = { KES: 'KSh', GHS: 'GH₵', ZAR: 'R' };

/**
 * Super admin → Plans → Exchange rates (D432). Today's naira rate for each billing currency, with a 14-day history.
 * Workspaces outside Nigeria are billed at the day's rate; each invoice freezes the rate it was made at.
 */
export function ExchangeRatesCard() {
  const [store, setStore] = useAdminStore();
  const [, bump] = useState(0);
  const [editing, setEditing] = useState<FxCode | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirm, setConfirm] = useState<{code: FxCode;rate: number | null;} | null>(null);

  useEffect(() => {
    const on = () => bump((n) => n + 1);
    window.addEventListener(FX_EVENT, on);
    return () => window.removeEventListener(FX_EVENT, on);
  }, []);

  const history = rateHistory(14);
  const th = 'px-3 py-2 text-left text-caption font-semibold text-fg-subtle';

  const startEdit = (code: FxCode) => {
    setEditing(code);
    setValue(String(rateOn(code).rate));
    setError(undefined);
  };

  const review = () => {
    if (!editing) return;
    const n = Number(value);
    if (!n || n <= 0 || n > 10_000) return setError('Enter naira per one unit, for example 11.80.');
    const now = rateOn(editing).rate;
    if (Math.abs(n - now) / now > 0.25) return setError(`That’s more than 25% away from today’s ${now.toFixed(2)}. Check the figure.`);
    setConfirm({ code: editing, rate: n });
  };

  return (
    <Card id="fx" title="Exchange rates" description="Naira per one unit. Kenyan, Ghanaian and South African workspaces are billed at the day’s rate; every invoice keeps the rate it was made at. Example rates — the real daily source is still to be chosen." body="flush">
      <ul className="divide-y divide-line">
        {fxCodes.map((code) => {
          const r = rateOn(code);
          return (
            <li key={code} className="flex flex-col gap-3 px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-label font-semibold text-fg">{names[code]}</p>
                  <p className="text-caption text-fg-muted">
                    ₦{r.rate.toFixed(2)} = {symbols[code]} 1 · {r.source === 'staff' ? `set by ${r.entry?.by.split(' ·')[0]}` : 'automatic'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.source === 'staff' && <Badge tone="info">Set today</Badge>}
                  {editing !== code &&
                  <Button size="sm" variant="secondary" onClick={() => startEdit(code)}>
                      Set today’s rate
                    </Button>
                  }
                  {r.source === 'staff' && editing !== code &&
                  <Button size="sm" variant="tertiary" onClick={() => setConfirm({ code, rate: null })}>
                      Use automatic
                    </Button>
                  }
                </div>
              </div>
              {editing === code &&
              <div className="flex flex-wrap items-start gap-2">
                  <TextInput id={`fx-${code}`} label={`Naira per ${symbols[code]} 1`} inputMode="decimal" value={value} error={error} onChange={(e) => (setValue(e.target.value), setError(undefined))} fieldClassName="w-48" />
                  <div className="flex gap-2 pt-6">
                    <Button size="sm" onClick={review}>
                      Save
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              }
            </li>);

        })}
      </ul>
      <details className="border-t border-line">
        <summary className="cursor-pointer px-5 py-3 text-label font-medium text-fg hover:bg-sunken md:px-6">Last 14 days</summary>
        <div className="overflow-x-auto pb-3">
          <table className="w-full min-w-[360px]">
            <caption className="sr-only">Exchange rates for the last 14 days</caption>
            <thead>
              <tr>
                <th scope="col" className={`${th} pl-5 md:pl-6`}>Date</th>
                {fxCodes.map((c) =>
                <th key={c} scope="col" className={`${th} text-right`}>
                    {symbols[c]}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.map((h) =>
              <tr key={h.date}>
                  <th scope="row" className="px-3 py-2 pl-5 text-left text-caption font-normal text-fg-muted md:pl-6">
                    {new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </th>
                  {fxCodes.map((c) =>
                <td key={c} className="px-3 py-2 text-right text-caption tabular-nums text-fg">
                      {h.rates[c].rate.toFixed(2)}
                      {h.rates[c].source === 'staff' && <span className="text-fg-subtle"> · set</span>}
                    </td>
                )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
      <ReasonDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.rate ? `Set today’s ${confirm.code} rate to ₦${confirm.rate.toFixed(2)}?` : 'Go back to the automatic rate?'}
        description="New quotes and invoices made today use it. Invoices already made keep their rate. Recorded in the audit log."
        confirmLabel={confirm?.rate ? 'Set rate' : 'Use automatic'}
        onConfirm={(reason) => {
          if (!confirm) return;
          if (confirm.rate) setRateToday(confirm.code, confirm.rate, staffActor(store));else
          clearRateToday(confirm.code);
          setStore((s) => audit(s, { area: 'plans', action: confirm.rate ? `Set ${confirm.code} rate to ₦${confirm.rate.toFixed(2)}` : `Reset ${confirm.code} rate to automatic`, target: 'Exchange rates', reason }));
          toast.success(confirm.rate ? 'Today’s rate saved' : 'Back to the automatic rate');
          setConfirm(null);
          setEditing(null);
        }} />
      
    </Card>);

}