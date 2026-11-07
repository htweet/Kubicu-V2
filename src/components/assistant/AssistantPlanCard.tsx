import React from 'react';
import { CheckIcon, LayoutTemplateIcon, PencilLineIcon, RotateCcwIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react';
import type { AssistantPlan } from '../../types/assistant';
import { aiCost } from '../../data/aiLimits';
import { formatNgn } from '../../utils/format';
import { MediaImage } from '../media/MediaImage';
import { Button } from '../ui/Button';

interface AssistantPlanCardProps {
  plan: AssistantPlan;
  /** Only the latest plan can be acted on; earlier ones are history. */
  active: boolean;
  busy: boolean;
  onApprove: () => void;
  onChange: () => void;
  onRestart: () => void;
  onAlternative: (id: string) => void;
}

/** What will be built, from what, and what's still missing — approved before anything changes (D211). */
export function AssistantPlanCard({ plan, active, busy, onApprove, onChange, onRestart, onAlternative }: AssistantPlanCardProps) {
  const SourceIcon = plan.source.kind === 'template' ? LayoutTemplateIcon : WandSparklesIcon;
  return (
    <div className={active ? 'ai-frame rounded-lg' : 'rounded-lg border border-line opacity-70'}>
      <div className="flex flex-col gap-4 rounded-[11px] bg-raised p-4">
        <div className="flex items-start gap-3">
          <span className="ai-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg" aria-hidden>
            <SourceIcon size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-caption text-fg-muted">{plan.source.kind === 'template' ? 'Using the template' : 'Composing a new layout'}</p>
            <p className="text-label font-semibold text-fg">{plan.source.name}</p>
            <p className="mt-0.5 text-caption text-fg-muted">{plan.source.reason}</p>
          </div>
        </div>

        <div>
          <p className="text-caption font-semibold text-fg">Sections, in order</p>
          <ol className="mt-1.5 flex flex-wrap gap-1.5">
            {plan.units.map((u, i) => (
              <li key={u.id} className="rounded-sm bg-sunken px-2 py-1 text-caption text-fg">
                <span className="tabular-nums text-fg-subtle">{i + 1}.</span> {u.label}
              </li>
            ))}
          </ol>
        </div>

        {plan.items.length > 0 && (
          <div>
            <p className="text-caption font-semibold text-fg">{plan.itemsAs === 'services' ? 'Your services' : 'Your items'}</p>
            <ul className="mt-1.5 divide-y divide-line rounded-md border border-line">
              {plan.items.slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-center gap-2 px-2.5 py-1.5">
                  {i.imageSrc ? <MediaImage src={i.imageSrc} alt="" className="h-7 w-7 shrink-0 rounded-sm object-cover" /> : <span className="h-7 w-7 shrink-0 rounded-sm bg-sunken" aria-hidden />}
                  <span className="min-w-0 flex-1 truncate text-caption text-fg">{i.name}</span>
                  <span className={i.priceNgn !== null ? 'text-caption tabular-nums text-fg' : 'text-caption text-warning'}>{i.priceNgn !== null ? formatNgn(i.priceNgn) : 'No price yet'}</span>
                </li>
              ))}
            </ul>
            {plan.items.length > 6 && <p className="mt-1 text-caption text-fg-subtle">and {plan.items.length - 6} more</p>}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-caption font-semibold text-fg">I’ll create</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {plan.creates.map((c) => (
                <li key={c} className="flex gap-1.5 text-caption text-fg-muted">
                  <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          {plan.gaps.length > 0 && (
            <div>
              <p className="text-caption font-semibold text-fg">You’ll need to fill</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {plan.gaps.slice(0, 5).map((g) => (
                  <li key={g} className="flex gap-1.5 text-caption text-fg-muted">
                    <PencilLineIcon size={13} className="mt-0.5 shrink-0 text-warning" aria-hidden />
                    {g}
                  </li>
                ))}
                {plan.gaps.length > 5 && <li className="text-caption text-fg-subtle">and {plan.gaps.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>

        <details className="group">
          <summary className="cursor-pointer text-caption font-medium text-fg-muted hover:text-fg">What I assumed ({plan.assumptions.length})</summary>
          <ul className="mt-1.5 flex flex-col gap-1">
            {plan.assumptions.map((a) => (
              <li key={a} className="text-caption text-fg-muted">
                · {a}
              </li>
            ))}
          </ul>
        </details>

        {active && (
          <>
            {plan.alternatives.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-caption text-fg-muted">
                <span>Prefer something else?</span>
                {plan.alternatives.map((alt) => (
                  <button key={alt.id} type="button" disabled={busy} onClick={() => onAlternative(alt.id)} className="h-7 rounded-full border border-line px-2.5 font-medium text-fg transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">
                    {alt.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <Button variant="ai" leadingIcon={SparklesIcon} disabled={busy} onClick={onApprove}>
                Approve and build
              </Button>
              <Button variant="secondary" disabled={busy} onClick={onChange}>
                Change something
              </Button>
              <Button variant="tertiary" leadingIcon={RotateCcwIcon} disabled={busy} onClick={onRestart}>
                Start over
              </Button>
              <span className="ml-auto text-caption text-fg-subtle">Uses {aiCost.page} AI credits</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
