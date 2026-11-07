import React, { useEffect, useState } from 'react';
import type { AccountSimulation } from '../../types/accountMode';
import { simulate, markStepUpVerified } from '../../utils/accountModeSim';
import { useAccount } from '../../utils/account/store';
import { sampleAccountEmail } from '../../data/accountModeSamples';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { useT } from '../../contexts/LocaleContext';

type Step = 'intro' | 'sending' | 'code' | 'verifying';
type Problem = { kind: 'wrong' } | { kind: 'locked'; minutes: number } | { kind: 'offline' } | { kind: 'unavailable' } | null;

interface StepUpDialogProps {
  open: boolean;
  simulation: AccountSimulation;
  /** true = code accepted (the original action runs again); false = cancelled, nothing changed. */
  onDone: (ok: boolean) => void;
}

/**
 * "Confirm it's you" (D530): the server needs a sign-in from the last 15 minutes for sensitive actions.
 * The code field matches the app's other 6-digit code steps (ProfileTab phone code).
 */
export function StepUpDialog({ open, simulation, onDone }: StepUpDialogProps) {
  const { t: tr } = useT();
  const account = useAccount();
  const email = account.profile.email || sampleAccountEmail;
  const [step, setStep] = useState<Step>('intro');
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);

  useEffect(() => {
    if (!open) return;
    setStep('intro');
    setCode('');
    setTried(false);
    setProblem(null);
  }, [open]);

  const send = async () => {
    setStep('sending');
    setProblem(null);
    const r = await simulate('stepUp.send', simulation);
    if (r.ok) {
      setStep('code');
      setCode('');
      setTried(false);
      return;
    }
    setStep('intro');
    if (r.code === 'rate_limited') setProblem({ kind: 'locked', minutes: Math.max(1, Math.round((r.retryAfterSeconds ?? 600) / 60)) });
    else if (r.code === 'offline') setProblem({ kind: 'offline' });
    else setProblem({ kind: 'unavailable' });
  };

  const verify = async () => {
    setTried(true);
    if (!/^\d{6}$/.test(code)) return;
    setStep('verifying');
    setProblem(null);
    const r = await simulate('stepUp.verify', simulation, { code });
    if (r.ok) {
      markStepUpVerified();
      onDone(true);
      return;
    }
    setStep('code');
    setProblem(r.code === 'offline' ? { kind: 'offline' } : r.code === 'refused' ? { kind: 'wrong' } : { kind: 'unavailable' });
  };

  const onCodeStep = step === 'code' || step === 'verifying';
  const codeError = tried && !/^\d{6}$/.test(code) ? tr('Enter the 6-digit code.') : problem?.kind === 'wrong' ? tr('That code is wrong or has expired. Check the latest email or send a new code.') : undefined;

  return (
    <Dialog
      open={open}
      onClose={() => onDone(false)}
      onTop
      size="sm"
      title={tr('Confirm it’s you')}
      description={onCodeStep ? tr('We sent a 6-digit code to {email}. It expires in 10 minutes.', { email }) : tr('For your security, we’ll send a 6-digit code to {email}.', { email })}
      footer={
        <>
          <Button variant="secondary" onClick={() => onDone(false)}>
            {tr('Cancel')}
          </Button>
          {onCodeStep ? (
            <Button loading={step === 'verifying'} onClick={() => void verify()}>
              {tr('Confirm')}
            </Button>
          ) : (
            <Button loading={step === 'sending'} disabled={problem?.kind === 'locked'} onClick={() => void send()}>
              {step === 'sending' ? tr('Sending…') : tr('Send code')}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {problem?.kind === 'locked' && (
          <InlineAlert tone="warning" title={tr('Too many tries')}>
            {tr('Try again in about {n} minutes. Nothing has changed.', { n: problem.minutes })}
          </InlineAlert>
        )}
        {problem?.kind === 'offline' && (
          <InlineAlert tone="warning" title={tr('You’re offline')}>
            {tr('Check your connection and try again. Nothing has changed.')}
          </InlineAlert>
        )}
        {problem?.kind === 'unavailable' && (
          <InlineAlert tone="danger" title={tr('Kubicu isn’t responding')}>
            {tr('Try again in a moment. Nothing has changed.')}
          </InlineAlert>
        )}
        {onCodeStep ? (
          <>
            <InlineAlert tone="success" title={tr('Code sent')} />
            <TextInput
              id="stepup-code"
              label={tr('6-digit code')}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              error={codeError}
              hint={tr('Prototype: any 6 digits work except 000000.')}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void verify();
              }}
            />
            <Button variant="tertiary" size="sm" className="self-start" disabled={step === 'verifying'} onClick={() => void send()}>
              {tr('Send a new code')}
            </Button>
          </>
        ) : (
          <p className="text-caption text-fg-muted">{tr('Once you confirm, what you were doing finishes by itself. You won’t need to start again.')}</p>
        )}
      </div>
    </Dialog>
  );
}
