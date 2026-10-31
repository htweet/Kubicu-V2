import React, { useEffect, useRef, useState } from 'react';
import { Loader2Icon, SmartphoneIcon } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PageTheme } from '../../types/page';
import type { MobileMoneyInfo } from '../../types/country';
import { useT } from '../../contexts/LocaleContext';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton, SecondaryButton, SheetActions, ThemedField } from './checkoutUi';
import { formatNgn } from '../../utils/format';
import { phoneIssueIn, phonePlaceholder } from '../../utils/phone';
import { announce } from '../../utils/announce';

/** How long the buyer has to approve on their phone (example figure). */
export const MOBILE_MONEY_SECONDS = 60;

type Stage = 'phone' | 'waiting' | 'declined' | 'timeout';
type Simulate = 'approves' | 'declines' | 'no_answer';

interface MobileMoneyPayProps {
  theme: PageTheme;
  amount: number;
  wallet: MobileMoneyInfo;
  /** Who the buyer is paying, shown on the approval prompt. */
  payee: string;
  /** Pre-filled from the checkout details. */
  phone: string;
  onPaid: () => void;
  onBack: () => void;
  inline?: boolean;
}

/**
 * Pay with M-Pesa or MTN MoMo (D355): the buyer confirms their number, a payment request pops up on their
 * phone, they approve it with their PIN. Simulated — no request is sent. Test mode chooses what happens.
 */
export function MobileMoneyPay({ theme: t, amount, wallet, payee, phone: initialPhone, onPaid, onBack, inline }: MobileMoneyPayProps) {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [tried, setTried] = useState(false);
  const [simulate, setSimulate] = useState<Simulate>('approves');
  const [left, setLeft] = useState(MOBILE_MONEY_SECONDS);
  const timer = useRef<number | null>(null);
  const muted = { color: t.mutedText };
  const phoneError = phone.trim() ? phoneIssueIn(tr, phone) : tr('Enter the number your {wallet} is on', { wallet: wallet.name });

  const clear = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const send = () => {
    setTried(true);
    if (phoneError) return;
    clear();
    setStage('waiting');
    setLeft(MOBILE_MONEY_SECONDS);
    announce(tr('Payment request sent. Check your phone.'));
    const startedAt = Date.now();
    // Approves after a few seconds, declines quickly, or runs out the clock.
    const settleAt = simulate === 'approves' ? 4 : simulate === 'declines' ? 3 : MOBILE_MONEY_SECONDS;
    timer.current = window.setInterval(() => {
      const gone = Math.floor((Date.now() - startedAt) / 1000);
      setLeft(Math.max(0, MOBILE_MONEY_SECONDS - gone));
      if (gone < settleAt) return;
      clear();
      if (simulate === 'approves') onPaid();else
      setStage(simulate === 'declines' ? 'declined' : 'timeout');
    }, 1000);
  };

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[18px] font-semibold">{tr('Pay with {wallet}', { wallet: wallet.name })}</h3>
          <p className="mt-1 text-[13.5px] leading-snug" style={muted}>
            {tr('We’ll send a payment request to your phone. Approve it and {hint}.', { hint: tr(wallet.approveHint) })}
          </p>
        </div>

        <p className="flex items-baseline justify-between rounded-md px-3 py-2.5 text-[14px]" style={{ background: mix(t.text, 6) }}>
          <span style={muted}>{tr('Amount')}</span>
          <span className="text-[16px] font-semibold tabular-nums">{formatNgn(amount)}</span>
        </p>

        {stage === 'phone' &&
        <>
            <ThemedField theme={t} label={tr('{wallet} number', { wallet: wallet.name })} type="tel" inputMode="tel" autoComplete="tel" placeholder={phonePlaceholder()} value={phone} onChange={setPhone} error={tried && phoneError ? phoneError : undefined} />
            <fieldset className="flex flex-col gap-1.5 rounded-md p-3" style={{ background: mix('#d9a400', 12, t.background) }}>
              <legend className="sr-only">{tr('Test mode — choose what happens on the phone')}</legend>
              <span className="text-[12.5px] font-semibold">{tr('Test mode — choose what happens on the phone')}</span>
              {(
            [
            ['approves', tr('Buyer approves')],
            ['declines', tr('Buyer declines or has too little money')],
            ['no_answer', tr('No answer — the request runs out')]] as
            [Simulate, string][]).
            map(([v, label]) =>
            <label key={v} className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="radio" name="momo-sim" checked={simulate === v} onChange={() => setSimulate(v)} style={{ accentColor: t.text }} />
                  {label}
                </label>
            )}
            </fieldset>
          </>
        }

        {stage === 'waiting' &&
        <div className="flex flex-col items-center gap-3 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }} role="status">
            <SmartphoneIcon size={26} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Check your phone')}</p>
            <p className="max-w-[300px] text-[13px] leading-snug" style={muted}>
              {tr('Approve {amount} to {payee} and {hint}.', { amount: formatNgn(amount), payee, hint: tr(wallet.approveHint) })}
            </p>
            <p className="flex items-center gap-2 text-[12.5px] tabular-nums" style={muted} role="timer" aria-label={tr('Request expires in {m} minutes {s} seconds', { m: mm, s: ss })}>
              <Loader2Icon size={14} className={reduce ? '' : 'animate-spin'} aria-hidden />
              {tr('Waiting · {time} left', { time: `${mm}:${ss}` })}
            </p>
          </div>
        }

        {(stage === 'declined' || stage === 'timeout') &&
        <div className="flex flex-col gap-1 rounded-md p-4" style={{ background: mix(t.text, 6) }} role="alert">
            <p className="text-[15px] font-semibold">{stage === 'declined' ? tr('The payment wasn’t approved') : tr('The request ran out')}</p>
            <p className="text-[13px] leading-snug" style={muted}>
              {stage === 'declined' ? tr('No money left your {wallet}. Check your balance and try again, or pay another way.', { wallet: wallet.name }) : tr('Nothing was charged. Send a new request and approve it within a minute.')}
            </p>
          </div>
        }

        <p className="text-[12px] leading-snug" style={muted}>
          {tr('Never share your PIN — not even with the seller. Simulated in this preview: no request is sent.')}
        </p>
      </div>

      <Actions inline={inline} theme={t}>
        {stage === 'phone' && <PrimaryButton theme={t} onClick={send}>{tr('Send payment request')}</PrimaryButton>}
        {(stage === 'declined' || stage === 'timeout') && <PrimaryButton theme={t} onClick={send}>{tr('Send a new request')}</PrimaryButton>}
        {stage === 'waiting' ?
        <SecondaryButton theme={t} onClick={() => (clear(), setStage('phone'))}>
            {tr('Change number')}
          </SecondaryButton> :

        <SecondaryButton theme={t} onClick={onBack}>
            {tr('Pay another way')}
          </SecondaryButton>
        }
      </Actions>
    </>);

}

function Actions({ inline, theme, children }: {inline?: boolean;theme: PageTheme;children: React.ReactNode;}) {
  if (inline) return <div className="flex flex-col gap-2">{children}</div>;
  return <SheetActions theme={theme}>{children}</SheetActions>;
}