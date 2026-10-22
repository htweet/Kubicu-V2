import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, SplitIcon } from 'lucide-react';
import type { Block, IntentGoal, SourceRule } from '../../../types/page';
import type { SourceId } from '../../../types/analytics';
import { useEditor } from '../../../contexts/EditorContext';
import { useCampaignPreview } from '../../../contexts/CampaignPreviewContext';
import { sourceLabels } from '../../../utils/analytics/track';
import { goalLabels, intentSources, ruleText } from '../../../utils/intentflow';
import { Segmented } from '../../ui/Segmented';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../utils/cn';

type Mode = 'everyone' | 'only' | 'except';

/** IntentFlow per block (D64): show by where a visit came from — never by who the visitor is. */
export function SourceRuleFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const preview = useCampaignPreview();
  const rule = block.visibility.sources;
  const mode: Mode = rule ? rule.mode : 'everyone';

  const set = (next: SourceRule | undefined) => actions.updateMeta(block.id, { visibility: { sources: next } }, 'sources');
  const patch = (p: Partial<SourceRule>) => rule && set({ ...rule, ...p });

  const setMode = (m: Mode) => {
    if (m === 'everyone') return set(undefined);
    set({ mode: m, ids: rule?.ids ?? [], goal: rule?.goal ?? (block.type === 'product' || block.type === 'productGrid' ? 'order' : block.type === 'booking' ? 'booking' : block.type === 'leadForm' || block.type === 'newsletter' ? 'lead' : 'tap'), paused: false, createdAt: rule?.createdAt ?? new Date().toISOString() });
  };

  const toggle = (id: SourceId) => {
    if (!rule) return;
    const ids = rule.ids.includes(id) ? rule.ids.filter((x) => x !== id) : intentSources.filter((x) => x === id || rule.ids.includes(x));
    patch({ ids });
  };

  return (
    <section aria-labelledby={`${block.id}-intent`} className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${block.id}-intent`} className="text-label font-medium text-fg">
            Show by visitor source
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">IntentFlow · based only on where the visit came from — a link, a QR code or the site that sent them.</p>
        </div>
        {rule && <Badge tone={rule.paused ? 'neutral' : 'info'} icon={SplitIcon}>{rule.paused ? 'Paused' : 'Rule on'}</Badge>}
      </div>
      <Segmented<Mode>
        ariaLabel="Who sees this block"
        fullWidth
        size="sm"
        value={mode}
        onChange={setMode}
        options={[
        { value: 'everyone', label: 'Everyone' },
        { value: 'only', label: 'Only' },
        { value: 'except', label: 'All except' }]
        } />
      
      {rule &&
      <>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={rule.mode === 'only' ? 'Show only to visits from' : 'Hide from visits from'}>
            {intentSources.map((id) => {
            const on = rule.ids.includes(id);
            return (
              <label key={id} className={cn('flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md border px-2.5 text-label transition-colors duration-150', on ? 'border-select bg-action-soft font-medium text-fg' : 'border-line text-fg-muted hover:bg-sunken')}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(id)} />
                  <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border', on ? 'border-select bg-select text-select-fg' : 'border-line-strong')}>{on && <CheckIcon size={11} aria-hidden />}</span>
                  <span className="truncate">{sourceLabels[id]}</span>
                </label>);

          })}
          </div>
          <p className="text-caption text-fg-muted">{ruleText(rule)}. Everyone else {rule.mode === 'only' ? 'doesn’t see it' : 'sees it as normal'}.</p>
          <SelectInput<IntentGoal>
          id={`${block.id}-intent-goal`}
          label="Goal to measure"
          value={rule.goal}
          options={(Object.keys(goalLabels) as IntentGoal[]).map((g) => ({ value: g, label: goalLabels[g] }))}
          onChange={(goal) => patch({ goal })}
          hint="Shown on the IntentFlow screen, compared with visitors the rule doesn’t target." />
        
          <Switch id={`${block.id}-intent-paused`} label="Pause this rule" description="Paused, everyone sees the block. Your choices are kept." checked={!!rule.paused} onChange={(paused) => patch({ paused })} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {rule.ids[0] &&
          <button type="button" className="text-caption font-medium text-action hover:underline" onClick={() => preview.setSource(rule.mode === 'only' ? rule.ids[0] : intentSources.find((s) => !rule.ids.includes(s)) ?? null)}>
                Preview as {sourceLabels[rule.mode === 'only' ? rule.ids[0] : intentSources.find((s) => !rule.ids.includes(s)) ?? 'direct']}
              </button>
          }
            <Link to="/app/intentflow" className="text-caption font-medium text-fg-muted hover:text-fg hover:underline">
              See results
            </Link>
          </div>
        </>
      }
    </section>);

}