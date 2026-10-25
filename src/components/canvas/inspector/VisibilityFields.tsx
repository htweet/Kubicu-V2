import React from 'react';
import { CalendarClockIcon, CheckIcon } from 'lucide-react';
import type { Block, CampaignPhase } from '../../../types/page';
import { phaseOrder } from '../../../utils/campaign';
import { phaseCopy } from '../../../utils/eventSpace';
import { cn } from '../../../utils/cn';
import { useEditor } from '../../../contexts/EditorContext';
import { issuesByBlock } from '../../../utils/validation';
import { formatSchedule, windowState } from '../../../utils/schedule';
import { Switch } from '../../ui/Switch';
import { SourceRuleFields } from './SourceRuleFields';
import { AbTestFields } from './AbTestFields';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { Badge } from '../../ui/Badge';
import { InspectorGroup } from './InspectorGroup';

const stateCopy = {
  always: null,
  upcoming: { tone: 'info', label: 'Scheduled' },
  active: { tone: 'success', label: 'Showing now' },
  ended: { tone: 'neutral', label: 'Ended' }
} as const;

export function VisibilityFields({ block }: {block: Block;}) {
  const { state: editor, actions, issues } = useEditor();
  const v = block.visibility;
  const state = windowState(v);
  const badge = stateCopy[state];
  const untilError = (issuesByBlock(issues)[block.id] ?? []).find((i) => i.field === 'showUntil' && i.severity === 'error')?.message;

  const summary =
  state === 'upcoming' && v.showFrom ?
  `Visitors will see it from ${formatSchedule(v.showFrom)}${v.showUntil ? ` until ${formatSchedule(v.showUntil)}` : ''}.` :
  state === 'active' && v.showUntil ?
  `Visible now. Hides automatically on ${formatSchedule(v.showUntil)}.` :
  state === 'ended' ?
  'The window has passed, so visitors no longer see it. It stays here for reuse.' :
  'Always visible once published.';

  // Campaigns and Event spaces (D178) share the phase field; Event spaces call them Before / During / After.
  const campaign = editor.site.campaign || editor.site.eventSpace || editor.site.popup;
  const phaseLabels = phaseCopy(editor.site).labels;
  const phases = v.phases && v.phases.length ? v.phases : phaseOrder;
  const togglePhase = (p: CampaignPhase) => {
    const next = phases.includes(p) ? phases.filter((x) => x !== p) : phaseOrder.filter((x) => x === p || phases.includes(x));
    if (next.length === 0) return;
    actions.updateMeta(block.id, { visibility: { phases: next.length === phaseOrder.length ? undefined : next } });
  };

  const showSummary = [v.hidden ? 'Hidden from the live page' : 'Shown on the live page', campaign && v.phases?.length ? `${v.phases.length} of 3 campaign phases` : null].
  filter(Boolean).
  join(' · ');
  const advancedSummary = [v.sources ? 'Visitor-source rule on' : null, v.abTest ? `A/B test, version ${v.abTest.arm}` : null].filter(Boolean).join(' · ') || 'No visitor-source rule or A/B test';

  return (
    <div className="flex flex-col">
      <InspectorGroup storeKey="visibility.show" title="Show on the page" summary={showSummary}>
      {campaign &&
        <fieldset className="flex flex-col gap-2">
          <legend className="text-label font-medium text-fg">Show during the campaign</legend>
          <p className="mb-1 text-caption text-fg-subtle">Pick when visitors see this block. At least one phase.</p>
          <div className="grid grid-cols-3 gap-2">
            {phaseOrder.map((p) => {
              const on = phases.includes(p);
              return (
                <label key={p} className={cn('flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md border px-2 text-label font-medium transition-colors duration-150', on ? 'border-select bg-action-soft text-fg' : 'border-line text-fg-muted hover:bg-sunken')}>
                  <input type="checkbox" className="sr-only" checked={on} disabled={on && phases.length === 1} onChange={() => togglePhase(p)} />
                  {on && <CheckIcon size={14} aria-hidden />}
                  {phaseLabels[p]}
                </label>);

            })}
          </div>
          <p className="text-caption text-fg-muted">{phases.length === 3 ? 'Shows in every phase.' : `Shows ${phases.map((p) => phaseLabels[p].toLowerCase()).join(' and ')} only.`}</p>
        </fieldset>
        }
      <Switch
          id={`${block.id}-hidden`}
          label="Hide from live page"
          description="Stays here in the editor so you can bring it back anytime."
          checked={v.hidden}
          onChange={(hidden) => actions.updateMeta(block.id, { visibility: { hidden } })} />
        
      </InspectorGroup>

      <InspectorGroup
        storeKey="visibility.schedule"
        title="Show between dates"
        summary={summary}
        trailing={badge ? <Badge tone={badge.tone} icon={CalendarClockIcon}>{badge.label}</Badge> : undefined}>
        
        <p className="-mt-3 text-caption text-fg-subtle">For a drop, sale or event. Leave both empty to always show.</p>
        <DateTimeInput
          id={`${block.id}-from`}
          label="Show from"
          optional
          clearable
          value={v.showFrom}
          onChange={(showFrom) => actions.updateMeta(block.id, { visibility: { showFrom } }, 'showFrom')} />
        
        <DateTimeInput
          id={`${block.id}-until`}
          label="Hide after"
          optional
          clearable
          value={v.showUntil}
          error={untilError}
          onChange={(showUntil) => actions.updateMeta(block.id, { visibility: { showUntil } }, 'showUntil')} />
        
        <p className="text-caption text-fg-muted">{summary}</p>
      </InspectorGroup>

      <InspectorGroup storeKey="visibility.advanced" title="Advanced" summary={advancedSummary} defaultOpen={!!(v.sources || v.abTest)}>
        <div className="flex flex-col gap-5 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
          <SourceRuleFields block={block} />
          <AbTestFields block={block} />
        </div>
      </InspectorGroup>
    </div>);

}