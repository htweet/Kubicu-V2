import React, { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { examplePages } from '../../data/examples';
import { blankTemplateDoc } from '../../data/templates';
import { TemplateThumb } from '../templates/TemplateThumb';
import { PlanLock } from '../ui/PlanLock';
import { Button } from '../ui/Button';
import { ChoiceCard, StepHeading, StepNav } from './OnboardingLayout';

interface StepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  go: (step: number) => void;
}

export function KitStep({ state, update, go }: StepProps) {
  const [showAll, setShowAll] = useState(false);
  const goal = state.goal;
  const matched = goal && goal !== 'other' ? examplePages.filter((e) => e.goals.includes(goal)) : [];
  const list = showAll || matched.length === 0 ? examplePages : matched.slice(0, 4);

  return (
    <>
      <StepHeading title="Pick a starting point" description="We keep the layout and look. Prices, links and quotes from the example are removed — you’ll add your own." />
      <fieldset className="mt-8">
        <legend className="sr-only">Starter</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((e) =>
          <ChoiceCard key={e.id} name="kit" selected={state.kitId === e.id} onSelect={() => update({ kitId: e.id })} title={e.category} description={e.name}>
              <span className="mb-3 flex justify-center">
                <TemplateThumb doc={e.doc} width={120} height={170} />
              </span>
            </ChoiceCard>
          )}
          <ChoiceCard name="kit" selected={state.kitId === 'blank'} onSelect={() => update({ kitId: 'blank' })} title="Blank page" description="Just your profile">
            <span className="mb-3 flex justify-center">
              <TemplateThumb doc={blankTemplateDoc} width={120} height={170} />
            </span>
          </ChoiceCard>
          <ChoiceCard
            name="kit"
            selected={false}
            disabled
            onSelect={() => undefined}
            title="Describe it with AI"
            description="Tell us about your business and review a draft."
            aside={<PlanLock kind="planned">Batch 5</PlanLock>}>
            
            <span className="mb-3 flex h-[170px] items-center justify-center rounded-[14px] bg-sunken text-fg-subtle">
              <SparklesIcon size={22} aria-hidden />
            </span>
          </ChoiceCard>
        </div>
      </fieldset>
      {!showAll && matched.length > 0 && matched.length < examplePages.length &&
      <Button variant="tertiary" className="mt-4" onClick={() => setShowAll(true)}>
          Show all {examplePages.length} starters
        </Button>
      }
      <StepNav onBack={() => go(0)} onSkip={() => update({ kitId: 'blank', step: 2 })} skipLabel="Start blank" onNext={() => go(2)} nextDisabled={!state.kitId} />
    </>);

}