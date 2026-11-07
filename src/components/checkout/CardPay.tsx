import React, { useEffect, useRef, useState } from 'react';
import { Loader2Icon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PageTheme } from '../../types/page';
import type { CardOutcome } from '../../types/billing';
import { useT } from '../../contexts/LocaleContext';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton, SecondaryButton, SheetActions, ThemedField } from './checkoutUi';
import { formatNgn } from '../../utils/format';
import { testCards } from '../../data/billing';
import { cardOutcome, digitsOnly, expiryError } from '../../utils/billing';
import { announce } from '../../utils/announce';

type Stage = 'form' | 'processing' | 'challenge';

const failures: Record<Exclude<CardOutcome, 'success' | 'challenge'>, string> = {
  declined: 'Your bank declined the payment. Try another card or ask your bank.',
  expired: 'Your bank says this card has expired. Use another card.',
  insufficient: 'There isn’t enough money on this card. Top it up or use another card.',
};

interface CardPayProps {
  theme: PageTheme;
  amount: number;
  payee: string;
  onPaid: () => void;
  onBack: () => void;
}

/**
 * Card payment on seller pages, in every country (D433): card details, a simulated bank security check when the
 * bank asks for one, and clear failures (declined, not enough money, expired). Test cards choose the outcome.
 * Shares its test cards and checks with KUBICU's own billing step.
 */
export function CardPay({ theme: t, amount, payee, onPaid, onBack }: CardPayProps) {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [tried, setTried] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [failure, setFailure] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const muted = { color: t.mutedText };
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const digits = digitsOnly(number);
  const errors = {
    number: digits.length !== 16 ? tr('Enter the 16-digit card number') : cardOutcome(digits) === null ? tr('In test mode, use one of the test cards below') : undefined,
    expiry: expiryError(expiry) ? tr(expiryError(expiry) ?? '') : undefined,
    cvc: /^\d{3,4}$/.test(cvc) ? undefined : tr('Enter the 3 digits on the back'),
  };
  const valid = !errors.number && !errors.expiry && !errors.cvc;

  const finish = (o: CardOutcome) => {
    if (o === 'success') return onPaid();
    if (o === 'challenge') {
      setStage('challenge');
      return announce(tr('Your bank wants to confirm it’s you.'));
    }
    setStage('form');
    setFailure(tr(failures[o]));
  };

  const submit = () => {
    setTried(true);
    setFailure(null);
    if (!valid) return;
    setStage('processing');
    const o = cardOutcome(digits) ?? 'declined';
    timer.current = window.setTimeout(() => finish(o), 1100);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[18px] font-semibold">{tr('Pay by card')}</h3>
          <p className="mt-1 text-[13.5px] leading-snug" style={muted}>
            {tr('Visa, Mastercard and local cards. Your card details go to the payment provider, never to the seller.')}
          </p>
        </div>
        <p className="flex items-baseline justify-between rounded-md px-3 py-2.5 text-[14px]" style={{ background: mix(t.text, 6) }}>
          <span style={muted}>{tr('Amount')}</span>
          <span className="text-[16px] font-semibold tabular-nums">{formatNgn(amount)}</span>
        </p>

        {failure && (
          <div className="rounded-md p-4" style={{ background: mix(t.text, 6) }} role="alert">
            <p className="text-[15px] font-semibold">{tr('The payment didn’t go through')}</p>
            <p className="mt-1 text-[13px] leading-snug" style={muted}>
              {failure} {tr('Nothing was charged.')}
            </p>
          </div>
        )}

        {stage === 'challenge' ? (
          <div className="flex flex-col items-center gap-3 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }}>
            <ShieldCheckIcon size={26} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Confirm with your bank')}</p>
            <p className="max-w-[300px] text-[13px] leading-snug" style={muted}>
              {tr('Your bank wants to check it’s you before paying {payee}. In real life this opens your banking app or sends a one-time code.', { payee })}
            </p>
            <div className="flex w-full flex-col gap-2">
              <PrimaryButton theme={t} onClick={() => finish('success')}>{tr('Approve in my bank')}</PrimaryButton>
              <SecondaryButton theme={t} onClick={() => finish('declined')}>{tr('Test: the check fails')}</SecondaryButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ThemedField theme={t} label={tr('Card number')} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={number} onChange={(v) => setNumber(digitsOnly(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} error={tried ? errors.number : undefined} />
            <div className="grid grid-cols-2 gap-3">
              <ThemedField theme={t} label={tr('Expiry')} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(v) => setExpiry(v.replace(/[^\d/]/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5))} error={tried ? errors.expiry : undefined} />
              <ThemedField theme={t} label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={cvc} onChange={(v) => setCvc(digitsOnly(v).slice(0, 4))} error={tried ? errors.cvc : undefined} />
            </div>
            <details className="rounded-md p-3 text-[12.5px]" style={{ background: mix('#d9a400', 12, t.background) }}>
              <summary className="cursor-pointer font-semibold">{tr('Test cards — choose what happens')}</summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {testCards.map((c) => (
                  <li key={c.number} className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setNumber(c.number)} className="font-mono underline underline-offset-2">
                      {c.number}
                    </button>
                    <span>{tr(c.label)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">{tr('Any future expiry and any 3-digit CVC.')}</p>
            </details>
          </div>
        )}
      </div>

      <SheetActions theme={t}>
        {stage !== 'challenge' && (
          <PrimaryButton theme={t} onClick={submit} disabled={stage === 'processing'}>
            {stage === 'processing' ? (
              <span className="inline-flex items-center gap-2">
                <Loader2Icon size={15} className={reduce ? '' : 'animate-spin'} aria-hidden /> {tr('Processing…')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LockIcon size={14} aria-hidden /> {tr('Pay {amount}', { amount: formatNgn(amount) })}
              </span>
            )}
          </PrimaryButton>
        )}
        {stage === 'form' && (
          <SecondaryButton theme={t} onClick={onBack}>
            {tr('Pay another way')}
          </SecondaryButton>
        )}
      </SheetActions>
    </>
  );
}
