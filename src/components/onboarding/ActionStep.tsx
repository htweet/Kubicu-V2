import React, { useState } from 'react';
import type { FirstActionType, OnboardingState } from '../../hooks/useOnboarding';
import { firstActions } from '../../data/onboarding';
import { isValidPhone, isValidUrl } from '../../utils/validation';
import { phonePlaceholder } from '../../utils/phone';
import { TextInput } from '../ui/TextInput';
import { ChoiceCard, StepHeading, StepNav } from './OnboardingLayout';

interface StepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  go: (step: number) => void;
}

export function actionError(type: FirstActionType | null, value: string): string {
  if (!type || type === 'form') return '';
  if (type === 'whatsapp') return isValidPhone(value) ? '' : `Enter a WhatsApp number, e.g. ${phonePlaceholder()}`;
  return isValidUrl(value) ? '' : 'Enter a full link starting with https://';
}

export function ActionStep({ state, update, go }: StepProps) {
  const [touched, setTouched] = useState(false);
  const error = actionError(state.actionType, state.actionValue);
  const selected = firstActions.find((a) => a.id === state.actionType);

  const next = () => {
    setTouched(true);
    if (!state.actionType || error) return;
    go(4);
  };

  return (
    <>
      <StepHeading title="What should visitors do first?" description="Every page needs one clear action. This becomes the main button near the top." />
      <fieldset className="mt-8">
        <legend className="sr-only">First action</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {firstActions.map((a) => (
            <ChoiceCard
              key={a.id}
              name="action"
              selected={state.actionType === a.id}
              onSelect={() => {
                setTouched(false);
                update({ actionType: a.id, actionValue: '', actionLabel: a.defaultLabel });
              }}
              title={a.label}
              description={a.description}
            />
          ))}
        </div>
      </fieldset>

      {selected && (
        <div className="mt-8 flex max-w-lg flex-col gap-5">
          {state.actionType === 'whatsapp' && (
            <TextInput
              id="ob-action-value"
              label="WhatsApp number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={phonePlaceholder()}
              value={state.actionValue}
              onChange={(e) => update({ actionValue: e.target.value })}
              onBlur={() => setTouched(true)}
              error={touched ? error || undefined : undefined}
              hint="Include the country code. Visitors see this only when they tap."
            />
          )}
          {(state.actionType === 'booking' || state.actionType === 'link') && (
            <TextInput
              id="ob-action-value"
              label={state.actionType === 'booking' ? 'Booking page link' : 'Link'}
              type="url"
              inputMode="url"
              placeholder="https://"
              value={state.actionValue}
              onChange={(e) => update({ actionValue: e.target.value })}
              onBlur={() => setTouched(true)}
              error={touched ? error || undefined : undefined}
              hint={state.actionType === 'booking' ? 'e.g. your Calendly or Google booking page. KUBICU bookings arrive later.' : undefined}
            />
          )}
          {state.actionType === 'form' && (
            <p className="text-label text-fg-muted">
              We’ll add a short form asking for name, email and a message. In this prototype submissions aren’t stored yet — visitors are told so.
            </p>
          )}
          <TextInput id="ob-action-label" label="Button text" value={state.actionLabel} maxLength={40} onChange={(e) => update({ actionLabel: e.target.value })} hint="Short and specific works best." />
        </div>
      )}

      <StepNav onBack={() => go(2)} onSkip={() => update({ actionType: null, actionValue: '', step: 4 })} onNext={next} nextDisabled={!state.actionType} />
    </>
  );
}
