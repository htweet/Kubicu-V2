import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PauseIcon, PencilIcon, PlayIcon, ShieldCheckIcon, SplitIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useEditor } from '../contexts/EditorContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useCan, useTeam } from '../contexts/TeamContext';
import { useT } from '../contexts/LocaleContext';
import type { SourceRule } from '../types/page';
import { changeRuleEverywhere, entryName, goalLabels, intentResult, listRules, MIN_VISITS, type RuleEntry } from '../utils/intentflow';
import { sourceLabels } from '../utils/analytics/track';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { List } from '../components/ui/layout/ListRow';
import { Stat, StatGroup } from '../components/ui/layout/Stat';

type Change = 'resumed' | 'paused' | 'removed';
const toastTitles: Record<Change, string> = { resumed: 'Rule resumed', paused: 'Rule paused', removed: 'Rule removed' };

/** Every source rule in the workspace, its results, and instant pause / roll back (D64). */
export function IntentFlow() {
  const { t: tr } = useT();
  const { current, currentSpace } = useWorkspace();
  const { actions } = useEditor();
  const { data } = useAnalytics();
  const team = useTeam();
  const canEdit = useCan('pages.edit');
  const canSee = useCan('analytics.view');
  const [version, setVersion] = useState(0);
  const entries = useMemo(() => listRules(current), [current, version]); // eslint-disable-line react-hooks/exhaustive-deps

  // Built here rather than in utils so each source name is translated, not just the sentence around it.
  const ruleLine = (r: SourceRule) => {
    if (r.ids.length === 0) return tr('Everyone (no sources picked)');
    const list = r.ids.map((i) => tr(sourceLabels[i])).join(', ');
    return tr(r.mode === 'only' ? 'Only visits from {list}' : 'Everyone except visits from {list}', { list });
  };

  const apply = (e: RuleEntry, fn: (r: SourceRule | undefined) => SourceRule | undefined) => {
    if (!changeRuleEverywhere(current.id, e.spaceId, e.block.id, fn)) return false;
    // The open space's editor keeps its page in memory; refresh it so it doesn't save the old rule back.
    if (e.spaceId === currentSpace.id) actions.reloadFromStorage();
    setVersion((v) => v + 1);
    return true;
  };

  const change = (e: RuleEntry, fn: (r: SourceRule | undefined) => SourceRule | undefined, what: Change, undo?: SourceRule) => {
    if (!apply(e, fn)) return;
    team.log('pages', `${what} the IntentFlow rule on ${entryName(e)}`);
    toast.success(tr(toastTitles[what]), {
      description: tr('Applies to your live page straight away — no publish needed.'),
      action: undo ?
      {
        label: tr('Undo'),
        onClick: () => {
          apply(e, () => undo);
        }
      } :
      undefined
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader title="IntentFlow" description={tr('Show different blocks depending on where a visit came from — your TikTok, a WhatsApp status, a QR code on your counter.')} />

      <p className="flex max-w-3xl items-start gap-2 text-caption text-fg-muted">
        <ShieldCheckIcon size={15} className="mt-px shrink-0 text-success" aria-hidden />
        {tr('Rules use only the source of a visit — never age, gender, location or anything about the person. Every page keeps at least one block for everyone, and pausing applies instantly.')}
      </p>

      {entries.length === 0 ?
      <EmptyState
        framed
        icon={SplitIcon}
        title={tr('No source rules yet')}
        description={tr('In the canvas, select a block, open Visibility and choose “Show by visitor source”. For example, show a TikTok welcome only to TikTok visitors.')}
        action={
        <Link to="/app/canvas">
              <Button>{tr('Open canvas')}</Button>
            </Link>
        } /> :


      <List ruled label={tr('Source rules')}>
          {entries.map((e) => {
          const r = intentResult(data.events, e.handle, e.block.id, e.rule);
          const rateA = r.audienceVisits ? r.audienceHits / r.audienceVisits : 0;
          const rateB = r.restVisits ? r.restHits / r.restVisits : 0;
          const status = e.rule.paused ? { tone: 'neutral' as const, label: 'Paused' } : !e.live ? { tone: 'warning' as const, label: 'Not published yet' } : JSON.stringify(e.live) !== JSON.stringify(e.rule) ? { tone: 'info' as const, label: 'Live · changes unpublished' } : { tone: 'success' as const, label: 'Live' };
          const editHref = `/app/canvas/${e.docId}?block=${e.block.id}${e.pageId ? `&page=${e.pageId}` : ''}`;
          return (
            <li key={`${e.spaceId}-${e.block.id}`} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-start lg:gap-8">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-label font-semibold text-fg">{entryName(e)}</h2>
                    <Badge tone={status.tone}>{tr(status.label)}</Badge>
                  </div>
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {e.spaceName} · {e.pageTitle}
                  </p>
                  <p className="mt-2 text-label text-fg">{ruleLine(e.rule)}</p>
                  <p className="text-caption text-fg-muted">
                    {tr('Goal:')} {tr(goalLabels[e.rule.goal])}
                  </p>
                </div>

                <div className="min-w-0">
                  {!canSee.allowed ?
                <p className="text-caption text-fg-muted">{canSee.reason}</p> :
                !r.enough ?
                <>
                      <p className="text-label font-medium text-fg">{tr('Too early to tell')}</p>
                      <p className="text-caption text-fg-muted">{tr('{a} of {min} targeted visits · {b} of {min} others, since the rule was made.', { a: r.audienceVisits, b: r.restVisits, min: MIN_VISITS })}</p>
                    </> :

                <>
                      <StatGroup columns={2}>
                        <Stat label={tr('Visits it targets')} value={`${Math.round(rateA * 100)}%`} hint={tr('{a} of {b}', { a: r.audienceHits, b: r.audienceVisits })} />
                        <Stat label={tr('Everyone else')} value={`${Math.round(rateB * 100)}%`} hint={tr('{a} of {b}', { a: r.restHits, b: r.restVisits })} />
                      </StatGroup>
                      <p className="mt-1 text-caption text-fg-subtle">{tr('Different audiences behave differently anyway — this shows a pattern, not proof the block caused it.')}</p>
                    </>
                }
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  {e.rule.paused ?
                <Button size="sm" variant="secondary" leadingIcon={PlayIcon} disabled={!canEdit.allowed} onClick={() => change(e, (x) => x ? { ...x, paused: false } : x, 'resumed', e.rule)}>
                      {tr('Resume')}
                    </Button> :

                <Button size="sm" variant="secondary" leadingIcon={PauseIcon} disabled={!canEdit.allowed} onClick={() => change(e, (x) => x ? { ...x, paused: true } : x, 'paused', e.rule)}>
                      {tr('Pause')}
                    </Button>
                }
                  <Button size="sm" variant="tertiary" leadingIcon={Undo2Icon} disabled={!canEdit.allowed} onClick={() => change(e, () => undefined, 'removed', e.rule)}>
                    {tr('Roll back')}
                  </Button>
                  <Link to={editHref}>
                    <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} className="w-full" disabled={!canEdit.allowed}>
                      {tr('Edit in canvas')}
                    </Button>
                  </Link>
                </div>
              </li>);

        })}
        </List>
      }
      <p className="text-caption text-fg-subtle">{tr('“Roll back” removes the rule so everyone sees the block again. Check what each audience sees with “Preview as” in the canvas.')}</p>
    </div>);

}