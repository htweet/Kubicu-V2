import React from 'react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { onboardingGoals, defaultActionFor } from '../../data/onboarding';
import { TextInput } from '../ui/TextInput';
import { ChoiceCard, StepHeading, StepNav } from './OnboardingLayout';
import { cn } from '../../utils/cn';

interface StepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  go: (step: number) => void;
}

export function GoalStep({ state, update, go }: StepProps) {
  return (
    <>
      <StepHeading title="What’s your page for?" description="Pick the main thing. You can add everything else later." />
      <fieldset className="mt-8">
        <legend className="sr-only">Main goal</legend>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {onboardingGoals.map((g) => {
            const selected = state.goal === g.id;
            const Icon = g.icon;
            return (
              <ChoiceCard
                key={g.id}
                name="goal"
                selected={selected}
                // Follow the goal's suggested action until the person has typed their own (D557).
                onSelect={() => update({ goal: g.id, actionType: state.actionValue.trim() ? state.actionType ?? defaultActionFor[g.id] : defaultActionFor[g.id], kitId: null })}
                title={g.label}
                description={g.description}
              >
                <span
                  aria-hidden
                  className={cn(
                    'mb-3 flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150',
                    selected ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted',
                  )}
                >
                  <Icon size={20} strokeWidth={2.25} />
                </span>
              </ChoiceCard>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 max-w-sm">
        <TextInput
          id="ob-business"
          label="What kind of business is it?"
          optional
          placeholder="e.g. Bakery, photographer, salon"
          value={state.businessType}
          onChange={(e) => update({ businessType: e.target.value })}
        />
      </div>
      <StepNav onSkip={() => update({ goal: 'other', step: 1 })} onNext={() => go(1)} nextDisabled={!state.goal} />
    </>
  );
}
