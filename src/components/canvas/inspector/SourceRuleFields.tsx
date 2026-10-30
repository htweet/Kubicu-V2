import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, SplitIcon } from 'lucide-react';
import type { Block, IntentGoal, SourceRule } from '../../../types/page';
import type { SourceId } from '../../../types/analytics';
import { useEditor } from '../../../contexts/EditorContext';
import { useCampaignPreview } from '../../../contexts/CampaignPreviewContext';
import { useT } from '../../../contexts/LocaleContext';
import { sourceLabels } from '../../../utils/analytics/track';
import { goalLabels, intentSources } from '../../../utils/intentflow';
import { Segmented } from '../../ui/Segmented';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../utils/cn';

type Mode = 'everyone' | 'only' | 'except';

/** IntentFlow per block (D64): show by where a visit came from — never by who the visitor is. Translated in D314. */
export function SourceRuleFields({ block }: {block: Block;}) {
  const { t: tr } = useT();
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

  // Same wording as the IntentFlow screen, with each source name translated.
  const ruleLine = (r: SourceRule) => {
    if (r.ids.length === 0) return tr('Everyone (no sources picked)');
    const list = r.ids.map((i) => tr(sourceLabels[i])).join(', ');
    return tr(r.mode === 'only' ? 'Only visits from {list}' : 'Everyone except visits from {list}', { list });
  };

  const previewSource: SourceId | null = rule ? rule.mode === 'only' ? rule.ids[0] ?? null : intentSources.find((s) => !rule.ids.includes(s)) ?? null : null;

  return (
    <section aria-labelledby={`${block.id}-intent`} className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${block.id}-intent`} className="text-label font-medium text-fg">
            {tr('Show by visitor source')}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">{tr('IntentFlow · based only on where the visit came from — a link, a QR code or the site that sent them.')}</p>
        </div>
        {rule &&
        <Badge tone={rule.paused ? 'neutral' : 'info'} icon={SplitIcon}>
            {tr(rule.paused ? 'Paused' : 'Rule on')}
          </Badge>
        }
      </div>
      <Segmented<Mode>
        ariaLabel={tr('Who sees this block')}
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
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={tr(rule.mode === 'only' ? 'Show only to visits from' : 'Hide from visits from')}>
            {intentSources.map((id) => {
            const on = rule.ids.includes(id);
            return (
              <label key={id} className={cn('flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md border px-2.5 text-label transition-colors duration-150', on ? 'border-select bg-action-soft font-medium text-fg' : 'border-line text-fg-muted hover:bg-sunken')}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(id)} />
                  <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border', on ? 'border-select bg-select text-select-fg' : 'border-line-strong')}>{on && <CheckIcon size={11} aria-hidden />}</span>
                  <span className="truncate">{tr(sourceLabels[id])}</span>
                </label>);

          })}
          </div>
          <p className="text-caption text-fg-muted">
            {ruleLine(rule)}. {tr(rule.mode === 'only' ? 'Everyone else doesn’t see it.' : 'Everyone else sees it as normal.')}
          </p>
          <SelectInput<IntentGoal>
          id={`${block.id}-intent-goal`}
          label={tr('Goal to measure')}
          value={rule.goal}
          options={(Object.keys(goalLabels) as IntentGoal[]).map((g) => ({ value: g, label: tr(goalLabels[g]) }))}
          onChange={(goal) => patch({ goal })}
          hint={tr('Shown on the IntentFlow screen, compared with visitors the rule doesn’t target.')} />
        
          <Switch id={`${block.id}-intent-paused`} label={tr('Pause this rule')} description={tr('Paused, everyone sees the block. Your choices are kept.')} checked={!!rule.paused} onChange={(paused) => patch({ paused })} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {rule.ids[0] &&
          <button type="button" className="text-caption font-medium text-action hover:underline" onClick={() => preview.setSource(previewSource)}>
                {tr('Preview as: {source}', { source: tr(sourceLabels[previewSource ?? 'direct']) })}
              </button>
          }
            <Link to="/app/intentflow" className="text-caption font-medium text-fg-muted hover:text-fg hover:underline">
              {tr('See results')}
            </Link>
          </div>
        </>
      }
    </section>);

}