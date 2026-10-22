import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CreditCardIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import type { CardOutcome, PaymentCard } from '../../types/billing';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { testCards } from '../../data/billing';
import { cardBrand, cardOutcome, digitsOnly, expiryError } from '../../utils/billing';
import { cn } from '../../utils/cn';

interface Props {
  /** e.g. "Pay ₦8,600". */
  payLabel: string;
  savedCard: PaymentCard | null;
  defaultHolder: string;
  onPaid: (card: PaymentCard) => void;
  onBack?: () => void;
  /** Saving a card only (no charge): button reads "Save card". */
  verifyOnly?: boolean;
}

type Phase = 'form' | 'processing' | 'challenge';

const messages: Record<Exclude<CardOutcome, 'success' | 'challenge'>, string> = {
  declined: 'Your bank declined the payment. Try another card or contact your bank.',
  expired: 'Your bank says this card has expired. Use another card.'
};

/** Card entry + simulated payment with bank confirmation (D65). Test mode only. */
export function PaymentStep({ payLabel, savedCard, defaultHolder, onPaid, onBack, verifyOnly }: Props) {
  const reduce = useReducedMotion();
  const [useSaved, setUseSaved] = useState(!!savedCard && !verifyOnly);
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [holder, setHolder] = useState(defaultHolder);
  const [tried, setTried] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const digits = digitsOnly(number);
  const errors = useSaved ?
  {} :
  {
    number: digits.length !== 16 ? 'Enter the 16-digit card number.' : cardOutcome(digits) === null ? 'In test mode, use one of the test cards below.' : undefined,
    expiry: expiryError(expiry),
    cvc: /^\d{3,4}$/.test(cvc) ? undefined : 'Enter the 3 digits on the back.',
    holder: holder.trim() ? undefined : 'Enter the name on the card.'
  };
  const valid = Object.values(errors).every((e) => !e);

  const card: PaymentCard = useSaved && savedCard ? savedCard : { brand: cardBrand(digits), last4: digits.slice(-4), expiry: expiry.trim(), holder: holder.trim() };

  const finish = (outcome: CardOutcome) => {
    if (outcome === 'success') return onPaid(card);
    if (outcome === 'challenge') return setPhase('challenge');
    setPhase('form');
    setError(messages[outcome]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    setError(null);
    if (!valid) return;
    setPhase('processing');
    const outcome: CardOutcome = useSaved ? 'success' : cardOutcome(digits) ?? 'declined';
    timer.current = window.setTimeout(() => finish(outcome), 1100);
  };

  if (phase === 'challenge') {
    return (
      <motion.div initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="flex flex-col items-center gap-4 rounded-lg border border-line bg-sunken p-6 text-center">
        <ShieldCheckIcon size={28} className="text-action" aria-hidden />
        <div>
          <p className="text-body font-semibold text-fg">Confirm with your bank</p>
          <p className="mt-1 text-caption text-fg-muted">Your bank wants to check it’s you (3-D Secure). In real life this opens your bank’s app or sends an OTP.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={() => finish('declined')}>
            Fail the check
          </Button>
          <Button onClick={() => finish('success')}>Approve</Button>
        </div>
      </motion.div>);

  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {error && <InlineAlert tone="danger" title="Payment didn’t go through">{error}</InlineAlert>}
      {savedCard && !verifyOnly &&
      <div role="radiogroup" aria-label="Payment card" className="flex flex-col gap-2">
          {[true, false].map((saved) =>
        <label key={String(saved)} className={cn('flex min-h-[48px] cursor-pointer items-center gap-3 rounded-md border px-3 text-label text-fg transition-colors duration-150', useSaved === saved ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
              <input type="radio" name="card-choice" checked={useSaved === saved} onChange={() => setUseSaved(saved)} />
              <CreditCardIcon size={16} className="text-fg-subtle" aria-hidden />
              {saved ? `${savedCard.brand} •••• ${savedCard.last4} · expires ${savedCard.expiry}` : 'Use a different card'}
            </label>
        )}
        </div>
      }
      {!useSaved &&
      <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextInput id="card-number" label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={number} onChange={(e) => setNumber(digitsOnly(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '))} error={tried ? errors.number : undefined} />
          </div>
          <TextInput id="card-expiry" label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5))} error={tried ? errors.expiry : undefined} />
          <TextInput id="card-cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={cvc} onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))} error={tried ? errors.cvc : undefined} />
          <div className="sm:col-span-2">
            <TextInput id="card-holder" label="Name on card" autoComplete="cc-name" value={holder} onChange={(e) => setHolder(e.target.value)} error={tried ? errors.holder : undefined} />
          </div>
          <details className="sm:col-span-2 rounded-md border border-line bg-sunken px-3 py-2 text-caption text-fg-muted">
            <summary className="cursor-pointer font-medium text-fg">Test cards</summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {testCards.map((c) =>
            <li key={c.number} className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setNumber(c.number)} className="rounded font-mono text-fg underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {c.number}
                  </button>
                  <span>{c.label}</span>
                </li>
            )}
            </ul>
            <p className="mt-2">Any future expiry and any 3-digit CVC.</p>
          </details>
        </div>
      }
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {onBack ?
        <Button type="button" variant="tertiary" onClick={onBack} disabled={phase === 'processing'}>
            Back
          </Button> :

        <span />
        }
        <Button type="submit" leadingIcon={LockIcon} loading={phase === 'processing'}>
          {phase === 'processing' ? 'Processing…' : verifyOnly ? 'Save card' : payLabel}
        </Button>
      </div>
      <p className="text-caption text-fg-subtle">Test mode — no real card is charged. Card details stay on this device.</p>
    </form>);

}