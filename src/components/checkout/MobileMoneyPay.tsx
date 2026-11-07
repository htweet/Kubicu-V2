import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, SmartphoneIcon } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { PageTheme } from '../../types/page';
import type { MobileMoneyInfo, MobileNetwork } from '../../types/country';
import { useT } from '../../contexts/LocaleContext';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton, SecondaryButton, SheetActions, ThemedField } from './checkoutUi';
import { formatNgn } from '../../utils/format';
import { phoneIssueIn, phonePlaceholder } from '../../utils/phone';
import { announce } from '../../utils/announce';
import { guessNetwork, momoTransactionId, mpesaCode, voucherOk } from '../../utils/mobileMoney';

/** How long the buyer has to approve on their phone (example figure). */
export const MOBILE_MONEY_SECONDS = 60;

type Stage = 'phone' | 'waiting' | 'declined' | 'timeout' | 'paybill' | 'checking' | 'paid';
type Simulate = 'approves' | 'declines' | 'no_answer';

interface MobileMoneyPayProps {
  theme: PageTheme;
  amount: number;
  wallet: MobileMoneyInfo;
  /** Who the buyer is paying, shown on the approval prompt. */
  payee: string;
  /** Pre-filled from the checkout details. */
  phone: string;
  /** Called once the buyer has seen the confirmation; `reference` is the wallet's code for the receipt. */
  onPaid: (reference?: string) => void;
  onBack: () => void;
  inline?: boolean;
  /** Account reference for Paybill payments (the order or link number). */
  accountRef?: string;
}

/**
 * Pay with mobile money (D355, extended D433). Kenya: an M-Pesa prompt, with Paybill as a fallback when the prompt
 * doesn't arrive. Ghana: the buyer picks MTN MoMo, Telecel Cash or AirtelTigo Money (guessed from the number);
 * Telecel asks for a 6-digit voucher first. Every route ends on a confirmation with the wallet's code.
 * Simulated — no request is sent. Test mode chooses what happens.
 */
export function MobileMoneyPay({ theme: t, amount, wallet, payee, phone: initialPhone, onPaid, onBack, inline, accountRef }: MobileMoneyPayProps) {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const networks = wallet.networks ?? null;
  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [networkId, setNetworkId] = useState<MobileNetwork['id'] | null>(() => (networks ? guessNetwork(networks, initialPhone)?.id ?? null : null));
  const [picked, setPicked] = useState(false);
  const [voucher, setVoucher] = useState('');
  const [paybillCode, setPaybillCode] = useState('');
  const [tried, setTried] = useState(false);
  const [simulate, setSimulate] = useState<Simulate>('approves');
  const [left, setLeft] = useState(MOBILE_MONEY_SECONDS);
  const [reference, setReference] = useState('');
  const timer = useRef<number | null>(null);
  const muted = { color: t.mutedText };

  const network = networks?.find((n) => n.id === networkId) ?? null;
  const name = network?.name ?? wallet.name;
  const hint = network?.approveHint ?? wallet.approveHint;
  const phoneError = phone.trim() ? phoneIssueIn(tr, phone) : tr('Enter the number your {wallet} is on', { wallet: name });
  const networkError = networks && !network ? tr('Choose your network') : null;
  const voucherError = network?.voucher && !voucherOk(voucher) ? tr('Enter the 6-digit voucher from your phone') : null;
  const ref = accountRef || payee.slice(0, 12).toUpperCase();

  // Guess the network from the number until the buyer picks one themselves.
  useEffect(() => {
    if (!networks || picked) return;
    const g = guessNetwork(networks, phone);
    if (g) setNetworkId(g.id);
  }, [phone, networks, picked]);

  const clear = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const finish = (code: string) => {
    clear();
    setReference(code);
    setStage('paid');
    announce(tr('Payment received.'));
  };

  const send = () => {
    setTried(true);
    if (phoneError || networkError || voucherError) return;
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
      if (simulate === 'approves') finish(wallet.id === 'mpesa' ? mpesaCode() : momoTransactionId());
      else setStage(simulate === 'declines' ? 'declined' : 'timeout');
    }, 1000);
  };

  // Paybill: the buyer pays from the M-Pesa menu, then types the code from the SMS.
  const paybillOk = /^[A-Z0-9]{10}$/.test(paybillCode.trim().toUpperCase());
  const confirmPaybill = () => {
    setTried(true);
    if (!paybillOk) return;
    setStage('checking');
    window.setTimeout(() => finish(paybillCode.trim().toUpperCase()), 1500);
  };

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  const box = { background: mix(t.text, 6) };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[18px] font-semibold">{stage === 'paybill' || stage === 'checking' ? tr('Pay with M-Pesa Paybill') : tr('Pay with {wallet}', { wallet: name })}</h3>
          {stage !== 'paid' && (
            <p className="mt-1 text-[13.5px] leading-snug" style={muted}>
              {stage === 'paybill' || stage === 'checking' ? tr('Use the M-Pesa menu on your phone, then enter the code from the confirmation SMS.') : tr('We’ll send a payment request to your phone. Approve it and {hint}.', { hint: tr(hint) })}
            </p>
          )}
        </div>

        <p className="flex items-baseline justify-between rounded-md px-3 py-2.5 text-[14px]" style={box}>
          <span style={muted}>{tr('Amount')}</span>
          <span className="text-[16px] font-semibold tabular-nums">{formatNgn(amount)}</span>
        </p>

        {stage === 'phone' && (
          <>
            <ThemedField theme={t} label={tr('{wallet} number', { wallet: networks ? tr('Mobile money') : wallet.name })} type="tel" inputMode="tel" autoComplete="tel" placeholder={phonePlaceholder()} value={phone} onChange={setPhone} error={tried && phoneError ? phoneError : undefined} />
            {networks && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[14px] font-semibold">{tr('Your network')}</legend>
                <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
                  {networks.map((n) => (
                    <label key={n.id} className="flex cursor-pointer items-center gap-2 p-3 text-[13.5px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ ...cardStyle(t), border: `1.5px solid ${networkId === n.id ? t.text : mix(t.text, 12)}` }}>
                      <input type="radio" name="momo-network" className="sr-only" checked={networkId === n.id} onChange={() => (setNetworkId(n.id), setPicked(true))} />
                      {n.name}
                    </label>
                  ))}
                </div>
                {tried && networkError && (
                  <p className="text-[13px] font-semibold" role="alert">
                    {networkError}
                  </p>
                )}
              </fieldset>
            )}
            {network?.voucher && (
              <div className="flex flex-col gap-2">
                <p className="rounded-md px-3 py-2.5 text-[13px] leading-snug" style={box}>
                  {tr('Telecel Cash asks for a voucher first: dial *110#, choose “Generate voucher”, then type the 6 digits here.')}
                </p>
                <ThemedField theme={t} label={tr('Voucher')} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={voucher} onChange={(v) => setVoucher(v.replace(/\D/g, '').slice(0, 6))} error={tried && voucherError ? voucherError : undefined} />
              </div>
            )}
            <SimulatePicker theme={t} value={simulate} onChange={setSimulate} />
          </>
        )}

        {stage === 'waiting' && (
          <div className="flex flex-col items-center gap-3 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }} role="status">
            <SmartphoneIcon size={26} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Check your phone')}</p>
            <p className="max-w-[300px] text-[13px] leading-snug" style={muted}>
              {tr('Approve {amount} to {payee} and {hint}.', { amount: formatNgn(amount), payee, hint: tr(hint) })}
            </p>
            <p className="flex items-center gap-2 text-[12.5px] tabular-nums" style={muted} role="timer" aria-label={tr('Request expires in {m} minutes {s} seconds', { m: mm, s: ss })}>
              <Loader2Icon size={14} className={reduce ? '' : 'animate-spin'} aria-hidden />
              {tr('Waiting · {time} left', { time: `${mm}:${ss}` })}
            </p>
            {wallet.paybill && (
              <button type="button" onClick={() => (clear(), setTried(false), setStage('paybill'))} className="text-[13px] font-semibold underline underline-offset-2">
                {tr('No prompt? Pay by Paybill instead')}
              </button>
            )}
          </div>
        )}

        {(stage === 'declined' || stage === 'timeout') && (
          <div className="flex flex-col gap-1 rounded-md p-4" style={box} role="alert">
            <p className="text-[15px] font-semibold">{stage === 'declined' ? tr('The payment wasn’t approved') : tr('The request ran out')}</p>
            <p className="text-[13px] leading-snug" style={muted}>
              {stage === 'declined' ? tr('No money left your {wallet}. Check your balance and try again, or pay another way.', { wallet: name }) : tr('Nothing was charged. Send a new request and approve it within a minute.')}
            </p>
          </div>
        )}

        {(stage === 'paybill' || stage === 'checking') && wallet.paybill && (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-md p-4 text-[14px]" style={box}>
              <dt style={muted}>{tr('Paybill number')}</dt>
              <dd className="font-mono font-semibold tracking-wide">{wallet.paybill}</dd>
              <dt style={muted}>{tr('Account number')}</dt>
              <dd className="font-mono font-semibold tracking-wide">{ref}</dd>
              <dt style={muted}>{tr('Amount')}</dt>
              <dd className="font-semibold tabular-nums">{formatNgn(amount)}</dd>
            </dl>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-[13px] leading-snug" style={muted}>
              <li>{tr('Open M-Pesa, then Lipa na M-Pesa, then Pay Bill.')}</li>
              <li>{tr('Enter the Paybill and account numbers above, then the amount.')}</li>
              <li>{tr('Enter your PIN. You’ll get an SMS with a 10-character code.')}</li>
            </ol>
            <ThemedField theme={t} label={tr('M-Pesa code from the SMS')} autoComplete="off" placeholder="SKJ4H7XQ2P" value={paybillCode} onChange={(v) => setPaybillCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} error={tried && !paybillOk ? tr('The code has 10 letters and numbers, like SKJ4H7XQ2P') : undefined} />
            {stage === 'checking' && (
              <p className="flex items-center gap-2 text-[13px]" style={muted} role="status">
                <Loader2Icon size={14} className={reduce ? '' : 'animate-spin'} aria-hidden />
                {tr('Checking the payment…')}
              </p>
            )}
          </div>
        )}

        {stage === 'paid' && (
          <div className="flex flex-col items-center gap-2 p-5 text-center" style={{ ...cardStyle(t), border: `1.5px solid ${t.text}` }} role="status">
            <CheckCircle2Icon size={26} aria-hidden />
            <p className="text-[15px] font-semibold">{tr('Payment received')}</p>
            <p className="text-[13px]" style={muted}>
              {tr('{label}: {code}', { label: tr(wallet.codeLabel), code: reference })}
            </p>
            <p className="max-w-[300px] text-[12.5px] leading-snug" style={muted}>
              {tr('Keep this code. It’s on your receipt too, and the seller can use it to find your payment.')}
            </p>
          </div>
        )}

        {stage !== 'paid' && (
          <p className="text-[12px] leading-snug" style={muted}>
            {tr('Never share your PIN — not even with the seller. Simulated in this preview: no request is sent.')}
          </p>
        )}
      </div>

      <Actions inline={inline} theme={t}>
        {stage === 'phone' && <PrimaryButton theme={t} onClick={send}>{tr('Send payment request')}</PrimaryButton>}
        {(stage === 'declined' || stage === 'timeout') && <PrimaryButton theme={t} onClick={send}>{tr('Send a new request')}</PrimaryButton>}
        {stage === 'timeout' && wallet.paybill && (
          <SecondaryButton theme={t} onClick={() => (setTried(false), setStage('paybill'))}>
            {tr('Pay by Paybill instead')}
          </SecondaryButton>
        )}
        {stage === 'paybill' && <PrimaryButton theme={t} onClick={confirmPaybill}>{tr('I’ve paid — confirm')}</PrimaryButton>}
        {stage === 'paid' && <PrimaryButton theme={t} onClick={() => onPaid(reference)}>{tr('Continue')}</PrimaryButton>}
        {stage === 'waiting' || stage === 'paybill' ? (
          <SecondaryButton theme={t} onClick={() => (clear(), setStage('phone'))}>
            {stage === 'paybill' ? tr('Back to the phone prompt') : tr('Change number')}
          </SecondaryButton>
        ) : stage !== 'paid' && stage !== 'checking' ? (
          <SecondaryButton theme={t} onClick={onBack}>
            {tr('Pay another way')}
          </SecondaryButton>
        ) : null}
      </Actions>
    </>
  );
}

function SimulatePicker({ theme: t, value, onChange }: { theme: PageTheme; value: Simulate; onChange: (v: Simulate) => void }) {
  const { t: tr } = useT();
  return (
    <fieldset className="flex flex-col gap-1.5 rounded-md p-3" style={{ background: mix('#d9a400', 12, t.background) }}>
      <legend className="sr-only">{tr('Test mode — choose what happens on the phone')}</legend>
      <span className="text-[12.5px] font-semibold">{tr('Test mode — choose what happens on the phone')}</span>
      {(
        [
          ['approves', tr('Buyer approves')],
          ['declines', tr('Buyer declines or has too little money')],
          ['no_answer', tr('No answer — the request runs out')],
        ] as [Simulate, string][]
      ).map(([v, label]) => (
        <label key={v} className="flex cursor-pointer items-center gap-2 text-[13px]">
          <input type="radio" name="momo-sim" checked={value === v} onChange={() => onChange(v)} style={{ accentColor: t.text }} />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function Actions({ inline, theme, children }: { inline?: boolean; theme: PageTheme; children: React.ReactNode }) {
  if (inline) return <div className="flex flex-col gap-2">{children}</div>;
  return <SheetActions theme={theme}>{children}</SheetActions>;
}
