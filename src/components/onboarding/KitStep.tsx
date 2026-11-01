import React, { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { countryFirst, examplePages, findExampleById } from '../../data/examples';
import { activeCountry } from '../../utils/country';
import { businessKits } from '../../data/businessKits';
import { siteKits } from '../../data/siteKits';
import { cn } from '../../utils/cn';
import { blankTemplateDoc } from '../../data/templates';
import { TemplateThumb } from '../templates/TemplateThumb';
import { PreviewTemplateButton, TemplatePreviewDialog } from '../templates/TemplatePreviewDialog';
import type { ExamplePage } from '../../data/examples/build';
import { templatePrice } from '../../data/templateMarket';
import { formatNaira as formatNgn } from '../../utils/format';
import { AiPreviewTag } from '../ai/AiPreviewTag';
import { useFlag } from '../../utils/admin/store';
import { Button } from '../ui/Button';
import { ChoiceCard, StepHeading, StepNav } from './OnboardingLayout';

interface StepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  go: (step: number) => void;
}

export function KitStep({ state, update, go }: StepProps) {
  const [showAll, setShowAll] = useState(false);
  const [showAllKits, setShowAllKits] = useState(false);
  const [previewing, setPreviewing] = useState<ExamplePage | null>(null);
  // New workspaces start on Free; Super admin can pause AI page setup (D75b).
  const aiAllowed = useFlag('ai_page_setup', 'free');
  const goal = state.goal;
  // The seller's own country's starters come first (D434).
  const pool = countryFirst(examplePages, activeCountry());
  const matched = goal && goal !== 'other' ? pool.filter((e) => e.goals.includes(goal)) : [];
  const list = showAll || matched.length === 0 ? pool : matched.slice(0, 4);
  // Business kits whose page suits the chosen goal come first (D126).
  const kits = businessKits.
  map((k) => ({ kit: k, ex: findExampleById(k.templateId) })).
  filter(({ ex }) => !!ex).
  sort((a, b) => Number(!!goal && b.ex!.goals.includes(goal as never)) - Number(!!goal && a.ex!.goals.includes(goal as never)));
  const kitList = showAllKits ? kits : kits.slice(0, 4);
  const chosenKit = state.businessKitId ? businessKits.find((k) => k.id === state.businessKitId) : undefined;

  return (
    <>
      <StepHeading title="Pick a starting point" description="We keep the layout and look. Prices, links and quotes from the example are removed — you’ll add your own." />

      <fieldset className="mt-8">
        <legend className="text-label font-semibold text-fg">Set up the whole business</legend>
        <p className="mt-0.5 text-caption text-fg-muted">A kit gives you this page plus starter products or services, draft policies and reminders — added after setup, as drafts with no prices.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {kitList.map(({ kit }) => {
            const Icon = kit.icon;
            const selected = state.businessKitId === kit.id;
            return (
              <label
                key={kit.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border bg-raised p-4 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-focus',
                  selected ? 'border-action bg-action-soft' : 'border-line hover:border-line-strong'
                )}>
                
                <input type="radio" name="kit" className="sr-only" checked={selected} onChange={() => update({ businessKitId: kit.id, kitId: kit.templateId, useAssistant: false })} />
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', selected ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')}>
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-label font-semibold text-fg">{kit.name}</span>
                  <span className="mt-0.5 block text-caption text-fg-muted">{kit.forWho}</span>
                </span>
              </label>);

          })}
        </div>
        {!showAllKits && kits.length > 4 &&
        <Button variant="tertiary" className="mt-3" onClick={() => setShowAllKits(true)}>
            Show all {kits.length} kits
          </Button>
        }
        {chosenKit &&
        <p className="mt-3 text-caption text-fg-subtle" role="status">
            After setup, Overview will offer to add the {chosenKit.name} kit’s starter items. Nothing is added until you say so.
          </p>
        }
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-label font-semibold text-fg">Or just pick a page</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((e) =>
          <div key={e.id} className="flex flex-col">
              <ChoiceCard name="kit" selected={state.kitId === e.id && !state.businessKitId} onSelect={() => update({ kitId: e.id, businessKitId: null, useAssistant: false })} title={e.category} description={e.elite || e.artwork ? `${e.name} · ${formatNgn(templatePrice(e.id))}` : e.name}>
                <span className="mb-3 flex justify-center">
                  <TemplateThumb doc={e.doc} width={120} height={170} />
                </span>
              </ChoiceCard>
              <span className="mt-1 flex justify-center">
                <PreviewTemplateButton name={e.name} onClick={() => setPreviewing(e)} />
              </span>
            </div>
          )}
          <ChoiceCard name="kit" selected={state.kitId === 'blank' && !state.useAssistant} onSelect={() => update({ kitId: 'blank', businessKitId: null, useAssistant: false })} title="Blank page" description="Just your profile">
            <span className="mb-3 flex justify-center">
              <TemplateThumb doc={blankTemplateDoc} width={120} height={170} />
            </span>
          </ChoiceCard>
          {aiAllowed && <ChoiceCard
            name="kit"
            selected={!!state.useAssistant}
            onSelect={() => update({ kitId: 'blank', businessKitId: null, useAssistant: true })}
            title="Build it with the assistant"
            description="After setup, answer a few questions and watch your page build."
            aside={<AiPreviewTag />}>
            
            <span className="ai-fill mb-3 flex h-[170px] items-center justify-center rounded-[14px] text-white">
              <SparklesIcon size={26} aria-hidden />
            </span>
          </ChoiceCard>}
        </div>
      </fieldset>
      {!showAll && matched.length > 0 && matched.length < examplePages.length &&
      <Button variant="tertiary" className="mt-4" onClick={() => setShowAll(true)}>
          Show all {examplePages.length} starters
        </Button>
      }
      <fieldset className="mt-8 border-t border-line pt-6">
        <legend className="text-label font-semibold text-fg">Want a full website too? (optional)</legend>
        <p className="mt-1 text-caption text-fg-muted">Add a set of extra pages for your industry after setup — you’ll preview every page first. Extra pages need Creator or above.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {siteKits.map((k) => {
            const on = state.siteKitId === k.id;
            const Icon = k.icon;
            return (
              <button key={k.id} type="button" aria-pressed={on} onClick={() => update({ siteKitId: on ? null : k.id })} className={cn('inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', on ? 'border-action bg-action-soft text-action' : 'border-line text-fg hover:border-line-strong')}>
                <Icon size={15} aria-hidden /> {k.name}
              </button>);

          })}
        </div>
      </fieldset>
      <TemplatePreviewDialog
        template={previewing}
        onClose={() => setPreviewing(null)}
        useLabel="Choose this starting point"
        onUse={(t) => {
          update({ kitId: t.id, businessKitId: null });
          setPreviewing(null);
        }} />
      
      {state.useAssistant &&
      <p className="mt-4 text-caption text-fg-subtle" role="status">
          You’ll start with a blank page, then the AI assistant opens straight after setup.
        </p>
      }
      <StepNav onBack={() => go(0)} onSkip={() => update({ kitId: 'blank', businessKitId: null, step: 2 })} skipLabel="Start blank" onNext={() => go(2)} nextDisabled={!state.kitId} />
    </>);

}