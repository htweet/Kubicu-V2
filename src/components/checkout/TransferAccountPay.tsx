import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, Loader2Icon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { CheckoutHeading, PrimaryButton, SecondaryButton, SheetActions, TestModeNote } from './checkoutUi';
import { cardStyle, mix } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';
import { useNow } from '../../hooks/useNow';
import { announce } from '../../utils/announce';
import { useT } from '../../contexts/LocaleContext';
import { activeCountryInfo } from '../../utils/country';

/** How long a one-time transfer account stays valid (example figure, D222). */
export const TRANSFER_ACCOUNT_MINUTES = 30;

const ngBanks = ['Wema Bank', 'Titan Trust Bank', 'Providus Bank'];

/**
 * A stable, made-up one-time account for this checkout (simulated — a real provider issues it).
 * Uses a bank and account length from the seller's country (D355): NUBAN in Nigeria, EFT in South Africa.
 */
export function transferAccountFor(holder: string): {bank: string;account: string;} {
  let h = 7;
  for (let i = 0; i < holder.length; i++) h = h * 31 + holder.charCodeAt(i) >>> 0;
  const c = activeCountryInfo();
  const banks = c.code === 'NG' ? ngBanks : c.banks.slice(0, 3);
  const len = c.accountNumber.min;
  const digits = `9${String(h % 999999999).padStart(9, '0')}${String(h).padStart(10, '0')}`.slice(0, len);
  return { bank: banks[h % banks.length], account: digits };
}

interface TransferAccountPayProps {
  theme: PageTheme;
  amount: number;
  account: {bank: string;account: string;};
  onBack: () => void;
  onPaid: () => void;
}

/**
 * Pay by transfer to a one-time account (D222). In production the provider issues the account and
 * confirms the payment by itself; here "I've sent it" simulates the money arriving.
 */
export function TransferAccountPay({ theme, amount, account, onBack, onPaid }: TransferAccountPayProps) {
  const { t: tr } = useT();
  const now = useNow(1000);
  const [issuedAt, setIssuedAt] = useState(() => Date.now());
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const warned = useRef(false);
  const msLeft = issuedAt + TRANSFER_ACCOUNT_MINUTES * 60_000 - now;
  const expired = msLeft <= 0;
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  const label = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const muted = { color: theme.mutedText };

  useEffect(() => {
    if (s <= 300 && s > 0 && !warned.current) {
      warned.current = true;
      announce(tr('About 5 minutes left to make the transfer.'));
    }
    if (expired) announce(tr('The transfer account has expired. Get a new one to pay.'));
  }, [s <= 300, expired]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.account);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (checking)
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center" role="status" aria-live="polite">
        <Loader2Icon size={28} className="animate-spin" aria-hidden />
        <p className="text-[16px] font-medium">{tr('Checking for your transfer…')}</p>
        <p className="text-[13px]" style={muted}>
          {tr('This usually takes a few seconds.')}
        </p>
      </div>);


  return (
    <div className="flex flex-col gap-4">
      <CheckoutHeading theme={theme} sub={tr('Use your banking app. The account works once, for this order only.')}>
        {tr('Transfer {amount}', { amount: formatNgn(amount) })}
      </CheckoutHeading>

      {expired ?
      <p className="rounded-md p-3 text-[14px] font-medium" style={cardStyle(theme)} role="alert">
          {tr('This account has expired. Don’t send money to it — get a new one.')}
        </p> :

      <div className="flex flex-col gap-3 p-4" style={{ ...cardStyle(theme), background: mix(theme.text, 4) }}>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-[14px]">
            <dt style={muted}>{tr('Bank')}</dt>
            <dd className="font-medium">{account.bank}</dd>
            <dt style={muted}>{tr('Account number')}</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[17px] font-semibold tracking-wider">{account.account}</span>
              <button type="button" onClick={copy} className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: mix(theme.text, 8) }}>
                {copied ? <CheckIcon size={13} aria-hidden /> : <CopyIcon size={13} aria-hidden />}
                {copied ? tr('Copied') : tr('Copy')}
              </button>
            </dd>
            <dt style={muted}>{tr('Amount')}</dt>
            <dd className="font-semibold tabular-nums">{formatNgn(amount)}</dd>
          </dl>
          <p className="flex items-center justify-between gap-3 border-t pt-2.5 text-[13px]" style={{ borderColor: mix(theme.text, 12) }}>
            <span style={muted}>{tr('Valid for')}</span>
            <span role="timer" aria-live="off" aria-label={tr('{n} minutes left', { n: Math.ceil(s / 60) })} className="font-semibold tabular-nums">
              {label}
            </span>
          </p>
        </div>
      }

      <p className="text-[12.5px] leading-snug" style={muted}>
        {tr('Send the exact amount. Your order confirms automatically when it lands — no need to send proof.')}
      </p>
      <TestModeNote theme={theme} />
      <SheetActions theme={theme}>
        {expired ?
        <PrimaryButton
          theme={theme}
          onClick={() => {
            setIssuedAt(Date.now());
            warned.current = false;
          }}>
          
            {tr('Get a new account')}
          </PrimaryButton> :

        <PrimaryButton
          theme={theme}
          onClick={() => {
            setChecking(true);
            window.setTimeout(onPaid, 1400);
          }}>
          
            {tr('I’ve sent the money (test)')}
          </PrimaryButton>
        }
        <SecondaryButton theme={theme} onClick={onBack}>
          {tr('Choose another way to pay')}
        </SecondaryButton>
      </SheetActions>
    </div>);

}