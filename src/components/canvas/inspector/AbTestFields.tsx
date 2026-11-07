import React, { useMemo, useState } from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Block, IntentGoal } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useT } from '../../../contexts/LocaleContext';
import { planAtLeast } from '../../../data/plans';
import { goalLabels, MIN_VISITS } from '../../../utils/intentflow';
import { abResult, rate, testPair } from '../../../utils/abTest';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { cn } from '../../../utils/cn';

const AB_PLAN = 'pro' as const;

/** Visibility → A/B test (D127): try two versions of a block; each visit sees one. Translated in D314. */
export function AbTestFields({ block }: { block: Block }) {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const { data } = useAnalytics();
  const plan = usePlan();
  const [goal, setGoal] = useState<IntentGoal>('tap');
  const test = block.visibility.abTest;
  const pair = test ? testPair(state.draft.blocks, test.id) : null;
  const handle = state.published?.handle ?? state.site.handle;
  const result = useMemo(() => (pair ? abResult(data.events, handle, pair) : null), [pair, data.events, handle]);
  const allowed = planAtLeast(plan.id, AB_PLAN);

  return (
    <section aria-labelledby={`${block.id}-ab`} className="flex flex-col gap-3 border-t border-line pt-5">
      <div>
        <h3 id={`${block.id}-ab`} className="flex items-center gap-1.5 text-label font-medium text-fg">
          <FlaskConicalIcon size={14} aria-hidden /> {tr('A/B test')}
        </h3>
        <p className="mt-0.5 text-caption text-fg-subtle">{tr('Try two versions — a different headline, photo or button — and see which gets more results. Half of visits see each.')}</p>
      </div>

      {!test && (
        <>
          <SelectInput<IntentGoal>
            id={`${block.id}-ab-goal`}
            label={tr('Judge it by')}
            value={goal}
            disabled={!allowed}
            onChange={setGoal}
            options={(Object.keys(goalLabels) as IntentGoal[]).map((g) => ({ value: g, label: tr(goalLabels[g]) }))}
          />
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            disabled={!allowed}
            onClick={() => {
              actions.startAbTest(block.id, goal);
              toast(tr('Version B added below'), { description: tr('Change something in version B, then publish to start the test.'), action: { label: tr('Undo'), onClick: () => actions.undo() } });
            }}
          >
            {tr('Test a different version')}
          </Button>
          {!allowed && <UpgradeButton plan={AB_PLAN} feature="A/B tests" className="self-start" />}
        </>
      )}

      {test && !pair && (
        <div className="flex flex-col gap-2">
          <p className="text-caption text-warning">{tr('The other version was deleted.')}</p>
          <Button size="sm" variant="secondary" className="self-start" onClick={() => actions.endAbTest(test.id, test.arm)}>
            {tr('End test and keep this one')}
          </Button>
        </div>
      )}

      {test && pair && result && (
        <>
          <p className="text-caption text-fg-muted">
            <strong className="font-semibold text-fg">{tr('This is version {arm}.', { arm: test.arm })}</strong> {tr('Judged by: {goal}.', { goal: tr(goalLabels[test.goal]) })} {tr('Both versions show here; visitors see one.')}
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
                  className={cn('rounded-md border p-3 text-left transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', lead ? 'border-success' : 'border-line', test.arm === arm && 'bg-sunken')}
                >
                  <span className="block text-caption text-fg-subtle">
                    {tr('Version {arm}', { arm })}
                    {lead ? ` · ${tr('ahead')}` : ''}
                  </span>
                  <span className="block text-heading font-semibold tabular-nums text-fg">{rate(side)}</span>
                  <span className="block text-caption tabular-nums text-fg-muted">{tr('{hits} of {visits} visits', { hits: side.hits, visits: side.visits })}</span>
                </button>
              );
            })}
          </div>
          <p className="text-caption text-fg-subtle" role="status">
            {!result.enough
              ? tr('Too early to tell — visits needed on each version: {n}.', { n: MIN_VISITS })
              : result.leader
                ? tr('Version {arm} is clearly ahead. A difference isn’t proof — seasons and paydays move results too.', { arm: result.leader })
                : tr('No clear winner yet. Keep it running, or keep the one you prefer.')}
          </p>
          <Switch
            id={`${block.id}-ab-pause`}
            label={tr('Pause the test')}
            description={tr('Everyone sees version A until you resume.')}
            checked={!!test.paused}
            onChange={(paused) => {
              actions.updateMeta(pair.a.id, { visibility: { abTest: { ...pair.a.visibility.abTest!, paused } } });
              actions.updateMeta(pair.b.id, { visibility: { abTest: { ...pair.b.visibility.abTest!, paused } } });
            }}
          />
          <div className="flex flex-wrap gap-2">
            {(['A', 'B'] as const).map((arm) => (
              <Button
                key={arm}
                size="sm"
                variant={result.leader === arm ? 'primary' : 'secondary'}
                onClick={() => {
                  actions.endAbTest(test.id, arm);
                  toast.success(tr('Kept version {arm}', { arm }), { description: tr('The other version was removed. Publish to show it to everyone.'), action: { label: tr('Undo'), onClick: () => actions.undo() } });
                }}
              >
                {tr('Keep {arm}', { arm })}
              </Button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
