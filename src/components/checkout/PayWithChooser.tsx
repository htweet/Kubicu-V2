import React from 'react';
import { BanknoteIcon, CalendarClockIcon, CreditCardIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { PayOptions, ProductInstalments } from '../../types/commerce';
import { cardStyle, mix } from '../blocks/pageStyle';
import { acceptLabels, everyLabels, schedule, type OptionCheck } from '../../utils/commerce/payOptions';
import { formatNgn } from '../../utils/format';

export type PayWith = 'now' | 'pod' | 'instalments';

interface Props {
  theme: PageTheme;
  value: PayWith;
  onChange: (v: PayWith) => void;
  total: number;
  pod: OptionCheck;
  podAccept: PayOptions['pod']['accept'];
  instalments: (OptionCheck & {ok: false;}) | {ok: true;plan: ProductInstalments;};
  agreed: boolean;
  onAgree: (v: boolean) => void;
}

const day = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });

/**
 * How the buyer pays (D112): in full now, on delivery, or in parts. Options the seller offers but
 * this order can't use stay visible with the reason, so buyers aren't left guessing.
 */
export function PayWithChooser({ theme: t, value, onChange, total, pod, podAccept, instalments, agreed, onAgree }: Props) {
  const muted = { color: t.mutedText };
  const showPod = !(pod.ok === false && pod.hidden);
  const showInst = !(instalments.ok === false && instalments.hidden);
  if (!showPod && !showInst) return null;
  const parts = instalments.ok ? schedule(total, instalments.plan) : [];

  const option = (id: PayWith, Icon: typeof CreditCardIcon, title: string, detail: string, disabledReason?: string) => {
    const active = value === id && !disabledReason;
    return (
      <label
        key={id}
        className={`flex items-start gap-3 p-4 ${disabledReason ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        style={{ ...cardStyle(t), border: `1.5px solid ${active ? t.text : mix(t.text, 12)}` }}>
        
        <input type="radio" name="pay-with" className="mt-1" checked={active} disabled={!!disabledReason} onChange={() => onChange(id)} style={{ accentColor: t.text }} />
        <Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">{title}</span>
          <span className="block text-[12.5px] leading-snug" style={muted}>
            {disabledReason ?? detail}
          </span>
        </span>
      </label>);

  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-[14px] font-semibold">How do you want to pay?</legend>
      {option('now', CreditCardIcon, `Pay ${formatNgn(total)} now`, 'Card, bank transfer or USSD.')}
      {showPod && option('pod', BanknoteIcon, 'Pay when it arrives', `${acceptLabels[podAccept]} to the rider. Have ${formatNgn(total)} ready.`, pod.ok ? undefined : pod.reason)}
      {showInst &&
      option(
        'instalments',
        CalendarClockIcon,
        instalments.ok ? `Pay in ${instalments.plan.parts} parts` : 'Pay in parts',
        instalments.ok ? `${formatNgn(parts[0].amountNgn)} today, then ${formatNgn(parts[1].amountNgn)} ${everyLabels[instalments.plan.every]}. No interest or fees.` : '',
        instalments.ok ? undefined : instalments.reason
      )}

      {value === 'pod' && pod.ok &&
      <p className="rounded-md px-3 py-2.5 text-[13px] leading-snug" style={{ background: mix(t.text, 6) }} role="note">
          Nothing is charged now. The seller or their rider will call before coming — keep your phone on. Please only order if you’ll be there to pay; refused deliveries cost the seller money.
        </p>
      }

      {value === 'instalments' && instalments.ok &&
      <div className="flex flex-col gap-3 rounded-md p-3" style={{ background: mix(t.text, 6) }}>
          <ol className="flex flex-col gap-1.5 text-[13.5px]" aria-label="Payment schedule">
            {parts.map((p) =>
          <li key={p.n} className="flex justify-between gap-3">
                <span>
                  {p.n === 1 ? 'Today' : day(p.dueAt)}
                  <span style={muted}> · part {p.n} of {parts.length}</span>
                </span>
                <span className="font-semibold tabular-nums">{formatNgn(p.amountNgn)}</span>
              </li>
          )}
          </ol>
          <p className="text-[12.5px] leading-snug" style={muted}>
            {instalments.plan.ship === 'last' ? 'Your order is sent once the last part is paid.' : 'Your order is sent after the first part.'} Later parts are charged to the same card. If a charge fails we try again on days 1, 3 and 5, and you can pay any part early from your order page.
          </p>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-snug">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0" checked={agreed} onChange={(e) => onAgree(e.target.checked)} style={{ accentColor: t.text }} />
            <span>
              I agree to be charged {parts.slice(1).map((p) => `${formatNgn(p.amountNgn)} on ${day(p.dueAt)}`).join(', ')} to this card. No interest or fees are added.
            </span>
          </label>
        </div>
      }
    </fieldset>);

}