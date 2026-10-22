import React from 'react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { onboardingGoals, defaultActionFor } from '../../data/onboarding';
import { TextInput } from '../ui/TextInput';
import { ChoiceCard, StepHeading, StepNav } from './OnboardingLayout';

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
          {onboardingGoals.map((g) =>
          <ChoiceCard
            key={g.id}
            name="goal"
            selected={state.goal === g.id}
            onSelect={() => update({ goal: g.id, actionType: state.actionType ?? defaultActionFor[g.id], kitId: null })}
            title={g.label}
            description={g.description} />

          )}
        </div>
      </fieldset>
      <div className="mt-8 max-w-sm">
        <TextInput
          id="ob-business"
          label="What kind of business is it?"
          optional
          placeholder="e.g. Bakery, photographer, salon"
          value={state.businessType}
          onChange={(e) => update({ businessType: e.target.value })} />
        
      </div>
      <StepNav onSkip={() => update({ goal: 'other', step: 1 })} onNext={() => go(1)} nextDisabled={!state.goal} />
    </>);

}