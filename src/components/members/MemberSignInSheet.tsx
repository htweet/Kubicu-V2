import React, { useEffect, useState } from 'react';
import { MailIcon, MessageCircleIcon, SmartphoneIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData } from '../../types/commerce';
import { PageOverlay } from '../blocks/PageOverlay';
import { mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SheetActions, ThemedField } from '../checkout/checkoutUi';
import { isValidEmail } from '../../utils/validation';
import { phonePlaceholder } from '../../utils/phone';
import { isMobileNumber, maskContact, membershipsFor, newSession, normaliseContact, normalisePhone, type MemberSession } from '../../utils/members';

type Channel = 'phone' | 'email';
type Delivery = 'whatsapp' | 'sms';
type Step = 'enter' | 'code' | 'none';

const CODE_MINUTES = 10;
const RESEND_SECONDS = 30;
const MAX_TRIES = 5;

interface Props {
  open: boolean;
  onClose: () => void;
  theme: PageTheme;
  data: CommerceData | null;
  business: string;
  onSignedIn: (s: MemberSession) => void;
  onJoin: (() => void) | null;
  /** Learner sign-in (D197) reuses this sheet with its own wording and lookup. */
  copy?: {title: string;intro: string;notFound: string;joinLabel: string;};
  /** Whether this contact may get a code. Defaults to "has a subscription". */
  canSignIn?: (contact: string, channel: Channel) => boolean;
}

/**
 * Members sign in with a one-time code — no passwords (D110). Phone first, because most customers
 * here are reached on WhatsApp; SMS for anyone without it (or whose line blocks promo texts),
 * and email as a fallback. Sending is simulated: the code is shown on screen.
 */
export function MemberSignInSheet({ open, onClose, theme: t, data, business, onSignedIn, onJoin, copy, canSignIn }: Props) {
  const [step, setStep] = useState<Step>('enter');
  const [channel, setChannel] = useState<Channel>('phone');
  const [delivery, setDelivery] = useState<Delivery>('whatsapp');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [sent, setSent] = useState<{code: string;at: number;} | null>(null);
  const [entered, setEntered] = useState('');
  const [tries, setTries] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!open) return;
    setStep('enter');
    setError(undefined);
    setEntered('');
    setTries(0);
    setSent(null);
  }, [open]);

  useEffect(() => {
    if (step !== 'code') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const contact = normaliseContact(value, channel);
  const muted = { color: t.mutedText };
  const wait = sent ? Math.max(0, RESEND_SECONDS - Math.floor((now - sent.at) / 1000)) : 0;
  const expired = !!sent && now - sent.at > CODE_MINUTES * 60_000;

  const send = () => {
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setCode(c);
    setSent({ code: c, at: Date.now() });
    setNow(Date.now());
    setEntered('');
    setTries(0);
    setError(undefined);
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (channel === 'phone' && !isMobileNumber(value) && normalisePhone(value).length < 10) return setError(`Enter the phone number you subscribed with, e.g. ${phonePlaceholder()}`);
    if (channel === 'email' && !isValidEmail(value)) return setError('Enter the email you subscribed with');
    if (canSignIn ? !canSignIn(contact, channel) : membershipsFor(data, contact, channel).length === 0) {
      setStep('none');
      return;
    }
    send();
    setStep('code');
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (expired) return setError('This code has expired. Send a new one.');
    if (tries >= MAX_TRIES) return setError('Too many tries. Send a new code.');
    if (entered.replace(/\D/g, '') !== code) {
      setTries((n) => n + 1);
      return setError(tries + 1 >= MAX_TRIES ? 'Too many tries. Send a new code.' : 'That code isn’t right. Check the latest message and try again.');
    }
    onSignedIn(newSession(contact, channel));
  };

  const via = channel === 'email' ? 'email' : delivery === 'whatsapp' ? 'WhatsApp' : 'SMS';
  const tab = (on: boolean) => ({ background: on ? t.surface : 'transparent', color: t.text, border: `1px solid ${on ? mix(t.text, 18) : 'transparent'}` });

  return (
    <PageOverlay open={open} onClose={onClose} theme={t} label={copy?.title ?? 'Member sign-in'}>
      <div className="flex min-h-full flex-col gap-5 px-5 pt-6">
        {step === 'enter' &&
        <form onSubmit={submitContact} className="flex flex-1 flex-col gap-5" noValidate>
            <CheckoutHeading theme={t} sub={copy?.intro ?? `Use the phone number or email you subscribed to ${business} with. We’ll send a one-time code — no password needed.`}>
              {copy?.title ?? 'Member sign-in'}
            </CheckoutHeading>
            <div role="radiogroup" aria-label="Sign in with" className="grid grid-cols-2 gap-1 rounded-full p-1" style={{ background: mix(t.text, 6) }}>
              {(
            [
            ['phone', 'Phone', SmartphoneIcon],
            ['email', 'Email', MailIcon]] as
            const).
            map(([id, label, Icon]) =>
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={channel === id}
              onClick={() => {
                setChannel(id);
                setValue('');
                setError(undefined);
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-full text-[14px] font-semibold"
              style={tab(channel === id)}>
              
                  <Icon size={15} aria-hidden /> {label}
                </button>
            )}
            </div>
            {channel === 'phone' ?
          <>
                <ThemedField theme={t} label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder={phonePlaceholder()} value={value} onChange={setValue} error={error} />
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-[13px] font-medium" style={{ color: t.text }}>
                    Send the code by
                  </legend>
                  {(
              [
              ['whatsapp', 'WhatsApp', 'Usually arrives in seconds.'],
              ['sms', 'Text message (SMS)', 'If you don’t use WhatsApp on this number. Can take a minute on some networks.']] as
              const).
              map(([id, label, hint]) =>
              <label key={id} className="flex cursor-pointer items-start gap-3 rounded-[12px] px-3.5 py-3" style={{ background: t.surface, border: `1px solid ${delivery === id ? t.text : mix(t.text, 12)}` }}>
                      <input type="radio" name="delivery" className="mt-1 h-4 w-4" checked={delivery === id} onChange={() => setDelivery(id)} />
                      <span>
                        <span className="block text-[14px] font-semibold" style={{ color: t.text }}>
                          {label}
                        </span>
                        <span className="block text-[12.5px]" style={muted}>
                          {hint}
                        </span>
                      </span>
                    </label>
              )}
                </fieldset>
              </> :

          <ThemedField theme={t} label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={value} onChange={setValue} error={error} />
          }
            <SheetActions theme={t}>
              <PrimaryButton theme={t} type="submit">
                {channel === 'phone' && delivery === 'whatsapp' && <MessageCircleIcon size={16} aria-hidden />} Send my code
              </PrimaryButton>
            </SheetActions>
          </form>
        }

        {step === 'code' &&
        <form onSubmit={verify} className="flex flex-1 flex-col gap-5" noValidate>
            <CheckoutHeading theme={t} sub={`We sent a 6-digit code by ${via} to ${maskContact(contact, channel)}. It works for ${CODE_MINUTES} minutes.`}>
              Enter your code
            </CheckoutHeading>
            <p role="note" className="rounded-[12px] px-3.5 py-3 text-[13px]" style={{ background: mix('#d9a400', 16, t.background), color: t.text }}>
              <span className="font-semibold">Prototype:</span> nothing is really sent. Your code is <span className="font-mono font-semibold tracking-[0.2em]">{sent?.code}</span>
            </p>
            <ThemedField theme={t} label="6-digit code" inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" value={entered} onChange={(v) => setEntered(v.replace(/\D/g, '').slice(0, 6))} error={error} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]" style={muted}>
              {wait > 0 ?
            <span aria-live="off">Send again in {wait}s</span> :

            <button type="button" onClick={send} className="font-semibold underline underline-offset-2" style={{ color: t.text }}>
                  Send a new code
                </button>
            }
              {channel === 'phone' && delivery === 'whatsapp' &&
            <button
              type="button"
              onClick={() => {
                setDelivery('sms');
                send();
              }}
              className="font-semibold underline underline-offset-2"
              style={{ color: t.text }}>
              
                  Text it to me instead
                </button>
            }
              <button type="button" onClick={() => setStep('enter')} className="font-semibold underline underline-offset-2" style={{ color: t.text }}>
                Use a different {channel === 'phone' ? 'number' : 'email'}
              </button>
            </div>
            <SheetActions theme={t}>
              <PrimaryButton theme={t} type="submit" disabled={entered.length !== 6}>
                Sign in
              </PrimaryButton>
            </SheetActions>
          </form>
        }

        {step === 'none' &&
        <div className="flex flex-1 flex-col gap-5">
            <CheckoutHeading theme={t} sub={`${copy?.notFound ?? `We couldn’t find a membership with ${business}`} for ${channel === 'phone' ? maskContact(contact, 'phone') : value.trim()}.`}>
              {copy ? 'Not found' : 'No membership found'}
            </CheckoutHeading>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed" style={muted}>
              <li>Check it’s the {channel === 'phone' ? 'number' : 'email'} you used when you joined.</li>
              <li>{channel === 'phone' ? 'Try the email you joined with instead.' : 'Try the phone number you joined with instead.'}</li>
              <li>Still stuck? Message {business} — they can see who has joined.</li>
            </ul>
            <SheetActions theme={t}>
              {onJoin &&
            <PrimaryButton theme={t} onClick={onJoin}>
                  {copy?.joinLabel ?? 'Become a member'}
                </PrimaryButton>
            }
              <button type="button" onClick={() => setStep('enter')} className="flex h-11 items-center justify-center text-[14px] font-semibold underline underline-offset-2" style={{ color: t.text }}>
                Try again
              </button>
            </SheetActions>
          </div>
        }
      </div>
    </PageOverlay>);

}