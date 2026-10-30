import React from 'react';
import { CalendarClockIcon, CheckIcon } from 'lucide-react';
import type { Block, CampaignPhase } from '../../../types/page';
import { phaseOrder } from '../../../utils/campaign';
import { phaseCopy } from '../../../utils/eventSpace';
import { cn } from '../../../utils/cn';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
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
  const { t: tr } = useT();
  const { state: editor, actions, issues } = useEditor();
  const v = block.visibility;
  const state = windowState(v);
  const badge = stateCopy[state];
  const untilError = (issuesByBlock(issues)[block.id] ?? []).find((i) => i.field === 'showUntil' && i.severity === 'error')?.message;

  const summary =
  state === 'upcoming' && v.showFrom ?
  v.showUntil ?
  tr('Visitors will see it from {from} until {until}.', { from: formatSchedule(v.showFrom), until: formatSchedule(v.showUntil) }) :
  tr('Visitors will see it from {from}.', { from: formatSchedule(v.showFrom) }) :
  state === 'active' && v.showUntil ?
  tr('Visible now. Hides automatically on {until}.', { until: formatSchedule(v.showUntil) }) :
  state === 'ended' ?
  tr('The window has passed, so visitors no longer see it. It stays here for reuse.') :
  tr('Always visible once published.');

  // Campaigns and Event spaces (D178) share the phase field; Event spaces call them Before / During / After.
  const campaign = editor.site.campaign || editor.site.eventSpace || editor.site.popup;
  const rawLabels = phaseCopy(editor.site).labels;
  const phaseLabel = (p: CampaignPhase) => tr(rawLabels[p]);
  const phases = v.phases && v.phases.length ? v.phases : phaseOrder;
  const togglePhase = (p: CampaignPhase) => {
    const next = phases.includes(p) ? phases.filter((x) => x !== p) : phaseOrder.filter((x) => x === p || phases.includes(x));
    if (next.length === 0) return;
    actions.updateMeta(block.id, { visibility: { phases: next.length === phaseOrder.length ? undefined : next } });
  };

  const showSummary = [v.hidden ? tr('Hidden from the live page') : tr('Shown on the live page'), campaign && v.phases?.length ? tr('{n} of 3 campaign phases', { n: v.phases.length }) : null].
  filter(Boolean).
  join(' · ');
  const advancedSummary = [v.sources ? tr('Visitor-source rule on') : null, v.abTest ? tr('A/B test, version {arm}', { arm: v.abTest.arm }) : null].filter(Boolean).join(' · ') || tr('No visitor-source rule or A/B test');

  return (
    <div className="flex flex-col">
      <InspectorGroup storeKey="visibility.show" title={tr('Show on the page')} summary={showSummary}>
        {campaign &&
        <fieldset className="flex flex-col gap-2">
            <legend className="text-label font-medium text-fg">{tr('Show during the campaign')}</legend>
            <p className="mb-1 text-caption text-fg-subtle">{tr('Pick when visitors see this block. At least one phase.')}</p>
            <div className="grid grid-cols-3 gap-2">
              {phaseOrder.map((p) => {
              const on = phases.includes(p);
              return (
                <label key={p} className={cn('flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md border px-2 text-label font-medium transition-colors duration-150', on ? 'border-select bg-action-soft text-fg' : 'border-line text-fg-muted hover:bg-sunken')}>
                    <input type="checkbox" className="sr-only" checked={on} disabled={on && phases.length === 1} onChange={() => togglePhase(p)} />
                    {on && <CheckIcon size={14} aria-hidden />}
                    {phaseLabel(p)}
                  </label>);

            })}
            </div>
            <p className="text-caption text-fg-muted">{phases.length === 3 ? tr('Shows in every phase.') : tr('Shows {phases} only.', { phases: phases.map((p) => phaseLabel(p).toLowerCase()).join(' · ') })}</p>
          </fieldset>
        }
        <Switch
          id={`${block.id}-hidden`}
          label={tr('Hide from live page')}
          description={tr('Stays here in the editor so you can bring it back anytime.')}
          checked={v.hidden}
          onChange={(hidden) => actions.updateMeta(block.id, { visibility: { hidden } })} />
        
      </InspectorGroup>

      <InspectorGroup
        storeKey="visibility.schedule"
        title={tr('Show between dates')}
        summary={summary}
        trailing={badge ? <Badge tone={badge.tone} icon={CalendarClockIcon}>{tr(badge.label)}</Badge> : undefined}>
        
        <p className="-mt-3 text-caption text-fg-subtle">{tr('For a drop, sale or event. Leave both empty to always show.')}</p>
        <DateTimeInput
          id={`${block.id}-from`}
          label={tr('Show from')}
          optional
          clearable
          value={v.showFrom}
          onChange={(showFrom) => actions.updateMeta(block.id, { visibility: { showFrom } }, 'showFrom')} />
        
        <DateTimeInput
          id={`${block.id}-until`}
          label={tr('Hide after')}
          optional
          clearable
          value={v.showUntil}
          error={untilError ? tr(untilError) : undefined}
          onChange={(showUntil) => actions.updateMeta(block.id, { visibility: { showUntil } }, 'showUntil')} />
        
        <p className="text-caption text-fg-muted">{summary}</p>
      </InspectorGroup>

      <InspectorGroup storeKey="visibility.advanced" title={tr('Advanced')} summary={advancedSummary} defaultOpen={!!(v.sources || v.abTest)}>
        <div className="flex flex-col gap-5 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
          <SourceRuleFields block={block} />
          <AbTestFields block={block} />
        </div>
      </InspectorGroup>
    </div>);

}