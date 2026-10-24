import React, { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon, Loader2Icon, PhoneIcon } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PageTheme } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';
import { ussdBanks, USSD_MINUTES, type UssdBank } from '../../data/ussdBanks';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton, SecondaryButton, SheetActions } from './checkoutUi';
import { formatNgn } from '../../utils/format';

type Stage = 'bank' | 'code' | 'waiting' | 'declined' | 'expired';
type Simulate = 'confirms' | 'slow' | 'declines';

interface UssdPayProps {
  theme: PageTheme;
  amount: number;
  /** Bank confirmed ('success') or is slow to confirm ('pending'). */
  onPaid: (outcome: 'success' | 'pending') => void;
  onBack: () => void;
  /** Inside a card on a full page rather than a bottom sheet: buttons sit in the flow. */
  inline?: boolean;
}

const ref = () => String(Math.floor(10000 + Math.random() * 89999));

/**
 * Pay by USSD (D136), for buyers without a card or data: pick your bank, dial the code from any
 * phone, approve with your PIN on that phone. Simulated — no bank is contacted.
 */
export function UssdPay({ theme: t, amount, onPaid, onBack, inline }: UssdPayProps) {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>('bank');
  const [bank, setBank] = useState<UssdBank | null>(null);
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [simulate, setSimulate] = useState<Simulate>('confirms');
  const [copied, setCopied] = useState(false);
  const muted = { color: t.mutedText };

  useEffect(() => {
    if (stage !== 'code') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  const left = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  useEffect(() => {
    if (stage === 'code' && left === 0) setStage('expired');
  }, [stage, left]);

  const getCode = (b: UssdBank) => {
    setBank(b);
    setCode(`${b.base}*000*${ref()}#`);
    const start = Date.now();
    setNow(start);
    setExpiresAt(start + USSD_MINUTES * 60000);
    setStage('code');
  };

  const dialled = () => {
    setStage('waiting');
    window.setTimeout(() => {
      if (simulate === 'declines') setStage('declined');else
      onPaid(simulate === 'confirms' ? 'success' : 'pending');
    }, 2200);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const mm = String(Math.floor(left / 60)).padStart(1, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[18px] font-semibold">{tr('Pay with USSD')}</h3>
          <p className="mt-1 text-[13.5px] leading-snug" style={muted}>
            {tr('No card or data needed. Dial a code from the phone your bank account is on and approve with your PIN.')}
          </p>
        </div>

        <p className="flex items-baseline justify-between rounded-md px-3 py-2.5 text-[14px]" style={{ background: mix(t.text, 6) }}>
          <span style={muted}>{tr('Amount')}</span>
          <span className="text-[16px] font-semibold tabular-nums">{formatNgn(amount)}</span>
        </p>

        {stage === 'bank' &&
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[14px] font-semibold">{tr('Choose your bank')}</legend>
            <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
              {ussdBanks.map((b) =>
            <li key={b.id}>
                  <button type="button" onClick={() => getCode(b)} className="flex h-12 w-full items-center justify-between gap-2 px-3 text-left text-[14px] font-medium" style={{ ...cardStyle(t), border: `1px solid ${mix(t.text, 12)}` }}>
                    <span className="truncate">{b.name}</span>
                    <span className="shrink-0 font-mono text-[12px]" style={muted}>
                      {b.base}#
                    </span>
                  </button>
                </li>
            )}
            </ul>
          </fieldset>
        }

        {stage === 'code' && bank &&
        <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-2 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }}>
              <span className="text-[13px]" style={muted}>
                {tr('Dial this on your {bank} phone', { bank: bank.name })}
              </span>
              <span className="font-mono text-[24px] font-semibold tracking-wide" aria-live="off">
                {code}
              </span>
              <span className="text-[12.5px] tabular-nums" style={muted} role="timer" aria-label={tr('Code expires in {m} minutes {s} seconds', { m: mm, s: ss })}>
                {tr('Expires in {time}', { time: `${mm}:${ss}` })}
              </span>
              <div className="mt-1 flex gap-2">
                <a href={`tel:${encodeURIComponent(code)}`} className="inline-flex h-10 items-center gap-2 px-4 text-[14px] font-semibold" style={{ ...cardStyle(t), background: t.text, color: t.background }}>
                  <PhoneIcon size={15} aria-hidden /> {tr('Dial now')}
                </a>
                <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-2 px-4 text-[14px] font-medium" style={{ ...cardStyle(t), border: `1px solid ${mix(t.text, 16)}` }}>
                  {copied ? <CheckIcon size={15} aria-hidden /> : <CopyIcon size={15} aria-hidden />} {copied ? tr('Copied') : tr('Copy')}
                </button>
              </div>
            </div>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-[13px] leading-snug" style={muted}>
              <li>{tr('Dial the code from the phone number linked to your {bank} account.', { bank: bank.name })}</li>
              <li>{tr('Check the amount and the name KUBICU, then enter your USSD PIN.')}</li>
              <li>{tr('Come back here and tap “I’ve dialled it”.')}</li>
            </ol>
            <p className="text-[12.5px] leading-snug" style={muted}>
              {tr('Your bank may charge a small USSD fee on your airtime. Never share your PIN — not even with the seller.')}
            </p>
            <fieldset className="flex flex-col gap-1.5 rounded-md p-3" style={{ background: mix('#d9a400', 12, t.background) }}>
              <legend className="sr-only">{tr('Test mode — choose what the bank does')}</legend>
              <span className="text-[12.5px] font-semibold">{tr('Test mode — choose what the bank does')}</span>
              {(
            [
            ['confirms', tr('Bank confirms')],
            ['slow', tr('Bank is slow to confirm')],
            ['declines', tr('Bank declines')]] as
            [Simulate, string][]).
            map(([v, label]) =>
            <label key={v} className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="radio" name="ussd-sim" checked={simulate === v} onChange={() => setSimulate(v)} style={{ accentColor: t.text }} />
                  {label}
                </label>
            )}
            </fieldset>
          </div>
        }

        {stage === 'waiting' &&
        <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
            <Loader2Icon size={28} className={reduce ? '' : 'animate-spin'} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Waiting for your bank')}</p>
            <p className="max-w-[280px] text-[13px]" style={muted}>
              {tr('Keep this page open. It usually takes a few seconds after you enter your PIN.')}
            </p>
          </div>
        }

        {(stage === 'declined' || stage === 'expired') &&
        <div className="flex flex-col gap-1 rounded-md p-4" style={{ background: mix(t.text, 6) }} role="alert">
            <p className="text-[15px] font-semibold">{stage === 'declined' ? tr('Your bank declined the payment') : tr('That code has expired')}</p>
            <p className="text-[13px] leading-snug" style={muted}>
              {stage === 'declined' ? tr('No money left your account. Check your balance or daily USSD limit, or try another bank or a card.') : tr('Codes work for {n} minutes. Get a new one — nothing was charged.', { n: USSD_MINUTES })}
            </p>
          </div>
        }
      </div>

      <Actions inline={inline} theme={t}>
        {stage === 'code' && <PrimaryButton theme={t} onClick={dialled}>{tr('I’ve dialled it')}</PrimaryButton>}
        {stage === 'expired' && bank && <PrimaryButton theme={t} onClick={() => getCode(bank)}>{tr('Get a new code')}</PrimaryButton>}
        {stage === 'declined' && <PrimaryButton theme={t} onClick={() => setStage('bank')}>{tr('Try another bank')}</PrimaryButton>}
        {stage !== 'waiting' &&
        <SecondaryButton theme={t} onClick={stage === 'code' ? () => setStage('bank') : onBack}>
            {stage === 'code' ? tr('Change bank') : tr('Pay another way')}
          </SecondaryButton>
        }
      </Actions>
    </>);

}

function Actions({ inline, theme, children }: {inline?: boolean;theme: PageTheme;children: React.ReactNode;}) {
  if (inline) return <div className="flex flex-col gap-2">{children}</div>;
  return <SheetActions theme={theme}>{children}</SheetActions>;
}