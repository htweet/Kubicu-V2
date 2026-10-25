import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PauseIcon, PencilIcon, PlayIcon, ShieldCheckIcon, SplitIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useEditor } from '../contexts/EditorContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useCan, useTeam } from '../contexts/TeamContext';
import type { SourceRule } from '../types/page';
import { changeRuleEverywhere, entryName, goalLabels, intentResult, listRules, MIN_VISITS, ruleText, type RuleEntry } from '../utils/intentflow';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { List } from '../components/ui/layout/ListRow';
import { Stat, StatGroup } from '../components/ui/layout/Stat';

/** Every source rule in the workspace, its results, and instant pause / roll back (D64). */
export function IntentFlow() {
  const { current, currentSpace } = useWorkspace();
  const { actions } = useEditor();
  const { data } = useAnalytics();
  const team = useTeam();
  const canEdit = useCan('pages.edit');
  const canSee = useCan('analytics.view');
  const [version, setVersion] = useState(0);
  const entries = useMemo(() => listRules(current), [current, version]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (e: RuleEntry, fn: (r: SourceRule | undefined) => SourceRule | undefined) => {
    if (!changeRuleEverywhere(current.id, e.spaceId, e.block.id, fn)) return false;
    // The open space's editor keeps its page in memory; refresh it so it doesn't save the old rule back.
    if (e.spaceId === currentSpace.id) actions.reloadFromStorage();
    setVersion((v) => v + 1);
    return true;
  };

  const change = (e: RuleEntry, fn: (r: SourceRule | undefined) => SourceRule | undefined, text: string, undo?: SourceRule) => {
    if (!apply(e, fn)) return;
    team.log('pages', `${text} the IntentFlow rule on ${entryName(e)}`);
    toast.success(`Rule ${text}`, {
      description: 'Applies to your live page straight away — no publish needed.',
      action: undo ?
      {
        label: 'Undo',
        onClick: () => {
          apply(e, () => undo);
        }
      } :
      undefined
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader title="IntentFlow" description="Show different blocks depending on where a visit came from — your TikTok, a WhatsApp status, a QR code on your counter." />

      <p className="flex max-w-3xl items-start gap-2 text-caption text-fg-muted">
        <ShieldCheckIcon size={15} className="mt-px shrink-0 text-success" aria-hidden />
        Rules use only the source of a visit — never age, gender, location or anything about the person. Every page keeps at least one block for everyone, and pausing applies instantly.
      </p>

      {entries.length === 0 ?
      <EmptyState
        framed
        icon={SplitIcon}
        title="No source rules yet"
        description="In the canvas, select a block, open Visibility and choose “Show by visitor source”. For example, show a TikTok welcome only to TikTok visitors."
        action={
        <Link to="/app/canvas">
                <Button>Open canvas</Button>
              </Link>
        } /> :


      <List ruled label="Source rules">
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
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {e.spaceName} · {e.pageTitle}
                  </p>
                  <p className="mt-2 text-label text-fg">{ruleText(e.rule)}</p>
                  <p className="text-caption text-fg-muted">Goal: {goalLabels[e.rule.goal]}</p>
                </div>

                <div className="min-w-0">
                  {!canSee.allowed ?
                <p className="text-caption text-fg-muted">{canSee.reason}</p> :
                !r.enough ?
                <>
                      <p className="text-label font-medium text-fg">Too early to tell</p>
                      <p className="text-caption text-fg-muted">
                        {r.audienceVisits} of {MIN_VISITS} targeted visits · {r.restVisits} of {MIN_VISITS} others, since the rule was made.
                      </p>
                    </> :

                <>
                      <StatGroup columns={2}>
                        <Stat label="Visits it targets" value={`${Math.round(rateA * 100)}%`} hint={`${r.audienceHits} of ${r.audienceVisits}`} />
                        <Stat label="Everyone else" value={`${Math.round(rateB * 100)}%`} hint={`${r.restHits} of ${r.restVisits}`} />
                      </StatGroup>
                      <p className="mt-1 text-caption text-fg-subtle">Different audiences behave differently anyway — this shows a pattern, not proof the block caused it.</p>
                    </>
                }
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  {e.rule.paused ?
                <Button size="sm" variant="secondary" leadingIcon={PlayIcon} disabled={!canEdit.allowed} onClick={() => change(e, (x) => x ? { ...x, paused: false } : x, 'resumed', e.rule)}>
                      Resume
                    </Button> :

                <Button size="sm" variant="secondary" leadingIcon={PauseIcon} disabled={!canEdit.allowed} onClick={() => change(e, (x) => x ? { ...x, paused: true } : x, 'paused', e.rule)}>
                      Pause
                    </Button>
                }
                  <Button size="sm" variant="tertiary" leadingIcon={Undo2Icon} disabled={!canEdit.allowed} onClick={() => change(e, () => undefined, 'removed', e.rule)}>
                    Roll back
                  </Button>
                  <Link to={editHref}>
                    <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} className="w-full" disabled={!canEdit.allowed}>
                      Edit in canvas
                    </Button>
                  </Link>
                </div>
              </li>);

        })}
        </List>
      }
      <p className="text-caption text-fg-subtle">“Roll back” removes the rule so everyone sees the block again. Check what each audience sees with “Preview as” in the canvas.</p>
    </div>);

}