import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2Icon, LandmarkIcon, Loader2Icon, ShieldCheckIcon } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PageTheme } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton, SecondaryButton, SheetActions } from './checkoutUi';
import { formatNgn } from '../../utils/format';
import { activeCountryInfo } from '../../utils/country';
import { announce } from '../../utils/announce';
import { eftReference } from '../../utils/mobileMoney';

type Stage = 'bank' | 'redirecting' | 'approve' | 'declined' | 'abandoned' | 'paid';

interface InstantEftPayProps {
  theme: PageTheme;
  amount: number;
  payee: string;
  onPaid: (reference?: string) => void;
  /** Fall back to a manual EFT with a reference (the one-time account step). */
  onManual: () => void;
  onBack: () => void;
  inline?: boolean;
}

/**
 * Instant EFT for South Africa (D433): the buyer picks their bank, signs in on a (simulated) bank screen and approves
 * the payment there. Declined or abandoned payments can be tried again, or paid by manual EFT with a reference.
 * Simulated — no bank is contacted.
 */
export function InstantEftPay({ theme: t, amount, payee, onPaid, onManual, onBack, inline }: InstantEftPayProps) {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const banks = activeCountryInfo().banks;
  const [bank, setBank] = useState('');
  const [tried, setTried] = useState(false);
  const [stage, setStage] = useState<Stage>('bank');
  const [reference, setReference] = useState('');
  const timer = useRef<number | null>(null);
  const muted = { color: t.mutedText };
  const box = { background: mix(t.text, 6) };
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const go = () => {
    setTried(true);
    if (!bank) return;
    setStage('redirecting');
    announce(tr('Opening {bank}…', { bank }));
    timer.current = window.setTimeout(() => setStage('approve'), 1200);
  };

  const bankSays = (result: 'approve' | 'decline' | 'abandon') => {
    if (result === 'approve') {
      setStage('redirecting');
      timer.current = window.setTimeout(() => {
        const code = eftReference();
        setReference(code);
        setStage('paid');
        announce(tr('Payment received.'));
      }, 1000);
      return;
    }
    setStage(result === 'decline' ? 'declined' : 'abandoned');
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[18px] font-semibold">{tr('Pay with instant EFT')}</h3>
          {stage !== 'paid' &&
          <p className="mt-1 text-[13.5px] leading-snug" style={muted}>
              {tr('Sign in to your bank and approve the payment there. Your banking password is never shared with the seller.')}
            </p>
          }
        </div>

        <p className="flex items-baseline justify-between rounded-md px-3 py-2.5 text-[14px]" style={box}>
          <span style={muted}>{tr('Amount')}</span>
          <span className="text-[16px] font-semibold tabular-nums">{formatNgn(amount)}</span>
        </p>

        {stage === 'bank' &&
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[14px] font-semibold">{tr('Your bank')}</legend>
            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
              {banks.map((b) =>
            <label key={b} className="flex min-h-[48px] cursor-pointer items-center gap-2 p-3 text-[13.5px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ ...cardStyle(t), border: `1.5px solid ${bank === b ? t.text : mix(t.text, 12)}` }}>
                  <input type="radio" name="eft-bank" className="sr-only" checked={bank === b} onChange={() => setBank(b)} />
                  {b}
                </label>
            )}
            </div>
            {tried && !bank &&
          <p className="text-[13px] font-semibold" role="alert">
                {tr('Choose your bank')}
              </p>
          }
          </fieldset>
        }

        {stage === 'redirecting' &&
        <p className="flex items-center justify-center gap-2 p-5 text-[14px]" style={muted} role="status">
            <Loader2Icon size={16} className={reduce ? '' : 'animate-spin'} aria-hidden />
            {tr('Connecting to {bank}…', { bank })}
          </p>
        }

        {stage === 'approve' &&
        <div className="flex flex-col gap-3 p-4" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }}>
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <LandmarkIcon size={16} aria-hidden /> {bank} · {tr('simulated bank screen')}
            </p>
            <p className="text-[13.5px] leading-snug">{tr('Approve a payment of {amount} to {payee}?', { amount: formatNgn(amount), payee })}</p>
            <p className="flex items-center gap-1.5 text-[12px]" style={muted}>
              <ShieldCheckIcon size={13} aria-hidden /> {tr('In real life you’d sign in with your banking app or password here.')}
            </p>
            <div className="flex flex-col gap-2">
              <PrimaryButton theme={t} onClick={() => bankSays('approve')}>{tr('Approve payment')}</PrimaryButton>
              <SecondaryButton theme={t} onClick={() => bankSays('decline')}>{tr('Test: the bank declines')}</SecondaryButton>
              <SecondaryButton theme={t} onClick={() => bankSays('abandon')}>{tr('Test: close the bank screen')}</SecondaryButton>
            </div>
          </div>
        }

        {(stage === 'declined' || stage === 'abandoned') &&
        <div className="flex flex-col gap-1 rounded-md p-4" style={box} role="alert">
            <p className="text-[15px] font-semibold">{stage === 'declined' ? tr('Your bank declined the payment') : tr('The payment wasn’t finished')}</p>
            <p className="text-[13px] leading-snug" style={muted}>
              {stage === 'declined' ? tr('No money left your account. Check your balance or daily limit, try again, or pay by manual EFT.') : tr('Nothing was charged. Your basket is saved — try again, or pay by manual EFT with a reference.')}
            </p>
          </div>
        }

        {stage === 'paid' &&
        <div className="flex flex-col items-center gap-2 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }} role="status">
            <CheckCircle2Icon size={26} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Payment received')}</p>
            <p className="text-[13px]" style={muted}>
              {tr('{label}: {code}', { label: tr('EFT reference'), code: reference })} · {bank}
            </p>
          </div>
        }

        {stage !== 'paid' &&
        <p className="text-[12px] leading-snug" style={muted}>
            {tr('Simulated in this preview: no bank is contacted.')}
          </p>
        }
      </div>

      <Actions inline={inline} theme={t}>
        {stage === 'bank' && <PrimaryButton theme={t} onClick={go}>{tr('Continue to my bank')}</PrimaryButton>}
        {(stage === 'declined' || stage === 'abandoned') && <PrimaryButton theme={t} onClick={() => setStage('bank')}>{tr('Try again')}</PrimaryButton>}
        {(stage === 'declined' || stage === 'abandoned' || stage === 'bank') &&
        <SecondaryButton theme={t} onClick={onManual}>
            {tr('Pay by manual EFT instead')}
          </SecondaryButton>
        }
        {stage === 'paid' && <PrimaryButton theme={t} onClick={() => onPaid(reference)}>{tr('Continue')}</PrimaryButton>}
        {stage === 'bank' &&
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