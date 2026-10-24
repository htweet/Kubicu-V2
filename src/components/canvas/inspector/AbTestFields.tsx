import React, { useMemo, useState } from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Block, IntentGoal } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { usePlan } from '../../../contexts/PlanContext';
import { planAtLeast } from '../../../data/plans';
import { goalLabels, MIN_VISITS } from '../../../utils/intentflow';
import { abResult, rate, testPair } from '../../../utils/abTest';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { cn } from '../../../utils/cn';

const AB_PLAN = 'pro' as const;

/** Visibility → A/B test (D127): try two versions of a block; each visit sees one. */
export function AbTestFields({ block }: {block: Block;}) {
  const { state, actions } = useEditor();
  const { data } = useAnalytics();
  const plan = usePlan();
  const [goal, setGoal] = useState<IntentGoal>('tap');
  const test = block.visibility.abTest;
  const pair = test ? testPair(state.draft.blocks, test.id) : null;
  const handle = state.published?.handle ?? state.site.handle;
  const result = useMemo(() => pair ? abResult(data.events, handle, pair) : null, [pair, data.events, handle]);
  const allowed = planAtLeast(plan.id, AB_PLAN);

  return (
    <section aria-labelledby={`${block.id}-ab`} className="flex flex-col gap-3 border-t border-line pt-5">
      <div>
        <h3 id={`${block.id}-ab`} className="flex items-center gap-1.5 text-label font-medium text-fg">
          <FlaskConicalIcon size={14} aria-hidden /> A/B test
        </h3>
        <p className="mt-0.5 text-caption text-fg-subtle">Try two versions — a different headline, photo or button — and see which gets more results. Half of visits see each.</p>
      </div>

      {!test &&
      <>
          <SelectInput<IntentGoal>
          id={`${block.id}-ab-goal`}
          label="Judge it by"
          value={goal}
          disabled={!allowed}
          onChange={setGoal}
          options={(Object.keys(goalLabels) as IntentGoal[]).map((g) => ({ value: g, label: goalLabels[g] }))} />
        
          <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={!allowed}
          onClick={() => {
            actions.startAbTest(block.id, goal);
            toast('Version B added below', { description: 'Change something in version B, then publish to start the test.', action: { label: 'Undo', onClick: () => actions.undo() } });
          }}>
          
            Test a different version
          </Button>
          {!allowed && <UpgradeButton plan={AB_PLAN} feature="A/B tests" className="self-start" />}
        </>
      }

      {test && !pair &&
      <div className="flex flex-col gap-2">
          <p className="text-caption text-warning">The other version was deleted.</p>
          <Button size="sm" variant="secondary" className="self-start" onClick={() => actions.endAbTest(test.id, test.arm)}>
            End test and keep this one
          </Button>
        </div>
      }

      {test && pair && result &&
      <>
          <p className="text-caption text-fg-muted">
            This is <strong className="font-semibold text-fg">version {test.arm}</strong>. Judged by {goalLabels[test.goal].toLowerCase()}. Both versions show here; visitors see one.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((arm) => {
            const side = arm === 'A' ? result.a : result.b;
            const lead = result.leader === arm;
            return (
              <button
                key={arm}
                type="button"
                onClick={() => actions.select(arm === 'A' ? pair.a.id : pair.b.id)}
                className={cn('rounded-md border p-3 text-left transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', lead ? 'border-success' : 'border-line', test.arm === arm && 'bg-sunken')}>
                
                  <span className="block text-caption text-fg-subtle">Version {arm}{lead ? ' · ahead' : ''}</span>
                  <span className="block text-heading font-semibold tabular-nums text-fg">{rate(side)}</span>
                  <span className="block text-caption text-fg-muted tabular-nums">
                    {side.hits} of {side.visits} visits
                  </span>
                </button>);

          })}
          </div>
          <p className="text-caption text-fg-subtle" role="status">
            {!result.enough ?
          `Too early to tell — needs ${MIN_VISITS} visits on each version.` :
          result.leader ?
          `Version ${result.leader} is clearly ahead. A difference isn’t proof — seasons and paydays move results too.` :
          'No clear winner yet. Keep it running, or keep the one you prefer.'}
          </p>
          <Switch
          id={`${block.id}-ab-pause`}
          label="Pause the test"
          description="Everyone sees version A until you resume."
          checked={!!test.paused}
          onChange={(paused) => {
            actions.updateMeta(pair.a.id, { visibility: { abTest: { ...pair.a.visibility.abTest!, paused } } });
            actions.updateMeta(pair.b.id, { visibility: { abTest: { ...pair.b.visibility.abTest!, paused } } });
          }} />
        
          <div className="flex flex-wrap gap-2">
            {(['A', 'B'] as const).map((arm) =>
          <Button
            key={arm}
            size="sm"
            variant={result.leader === arm ? 'primary' : 'secondary'}
            onClick={() => {
              actions.endAbTest(test.id, arm);
              toast.success(`Kept version ${arm}`, { description: 'The other version was removed. Publish to show it to everyone.', action: { label: 'Undo', onClick: () => actions.undo() } });
            }}>
            
                Keep {arm}
              </Button>
          )}
          </div>
        </>
      }
    </section>);

}