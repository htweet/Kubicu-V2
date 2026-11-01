import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { AiFeatureId } from '../../types/admin';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { audit, flagOn, staffActor, useAdminStore } from '../../utils/admin/store';
import { aiAllowance, aiBonus } from '../../utils/planCatalogue';
import { readAiLog } from '../../utils/aiLog';
import { aiCost } from '../../data/aiLimits';
import { plans } from '../../data/plans';
import { formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { ReasonDialog } from '../../components/admin/ReasonDialog';
import { cn } from '../../utils/cn';

type FeatureKey = AiFeatureId | 'page_setup';

/** Every AI-labelled feature and the switch that controls it (D130, switches D135). Cost is "Credits: n" plus what it's per. */
const aiFeatures: {id: FeatureKey;name: string;where: string;credits: number;per: string;}[] = [
{ id: 'page_setup', name: 'AI page setup', where: 'Canvas → Page, onboarding, business-kit drafts', credits: aiCost.page, per: 'per draft' },
{ id: 'block_suggest', name: 'Block suggestions', where: 'Canvas block settings', credits: aiCost.block, per: 'each' },
{ id: 'print_writer', name: 'Print kit writing helper', where: 'Growth → Print kit', credits: 1, per: 'each' },
{ id: 'coach', name: 'Business Coach', where: 'Growth → Business Coach', credits: 1, per: 'per refresh or question' }];


const safeguards = [
'Never invents prices, reviews, qualifications, delivery promises or policies — gaps become [Add …] placeholders.',
'Only reads what the seller typed or already saved in their workspace; no customer messages or payment details.',
'Every result is labelled “AI preview” and needs the seller to accept it.',
'Credits reset on the 1st of each month; a failed or blocked request doesn’t use credits.'];


function usageFor(workspaceId: string): number {
  try {
    const raw = localStorage.getItem(`kubicu.ai.${workspaceId}`);
    if (!raw) return 0;
    const v = JSON.parse(raw) as {month?: string;used?: number;};
    return v.month === new Date().toISOString().slice(0, 7) ? v.used ?? 0 : 0;
  } catch {
    return 0;
  }
}

const outcomeTone = { ok: 'success', blocked: 'warning', failed: 'danger' } as const;
const outcomeLabel = { ok: 'Done', blocked: 'Blocked by a rule', failed: 'Failed' } as const;

/**
 * Super admin → AI operations: credit use, per-feature switches, a redacted request log and safeguards. No private content is shown.
 * Follows the staff console language (D499). Workspace and plan names, log notes and audit entries stay as written.
 */
export function AdminAi() {
  const { t: tr, lang } = useT();
  const { workspaces } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const [switching, setSwitching] = useState<(typeof aiFeatures)[number] | null>(null);
  const log = useMemo(() => readAiLog(), [store]);
  const num = (n: number) => n.toLocaleString(lang === 'en' ? 'en-GB' : undefined);

  const rows = useMemo(
    () =>
    workspaces.
    map((w) => {
      const used = usageFor(w.id);
      const limit = aiAllowance(w.plan, store) + aiBonus(w.id, store);
      return { id: w.id, name: w.name, plan: plans[w.plan].name, used, limit, share: limit ? used / limit : 0 };
    }).
    sort((a, b) => b.share - a.share),
    [workspaces, store]
  );
  const used = rows.reduce((s, r) => s + r.used, 0);
  const allowance = rows.reduce((s, r) => s + r.limit, 0);
  const nearLimit = rows.filter((r) => r.share >= 0.8).length;
  const blocked = log.filter((l) => l.outcome === 'blocked').length;
  const failed = log.filter((l) => l.outcome === 'failed').length;
  const pct = (n: number) => log.length ? `${Math.round(n / log.length * 100)}%` : '—';

  const isOn = (id: FeatureKey) => id === 'page_setup' ? flagOn(store, 'ai_page_setup') : !store.aiOff[id];
  const offCount = aiFeatures.filter((f) => !isOn(f.id)).length;

  const confirm = (reason: string) => {
    if (!switching) return;
    const f = switching;
    const turningOff = isOn(f.id);
    const at = new Date().toISOString();
    setStore((s) => {
      let next = s;
      if (f.id === 'page_setup') next = { ...s, flags: { ...s.flags, ai_page_setup: { ...s.flags.ai_page_setup, on: !turningOff, updatedAt: at } } };else
      {
        const id = f.id;
        const { [id]: _was, ...rest } = s.aiOff;
        next = { ...s, aiOff: turningOff ? { ...s.aiOff, [id]: { at, by: staffActor(s), reason } } : rest };
      }
      return audit(next, { area: 'ai', action: `${turningOff ? 'Switched off' : 'Switched on'} ${f.name} for everyone`, target: f.name, reason });
    });
    const name = tr(f.name);
    toast.success(turningOff ? tr('{feature} switched off', { feature: name }) : tr('{feature} switched on', { feature: name }), {
      description: turningOff ? tr('Sellers see “Paused by KUBICU for now”. Nothing they made is changed.') : tr('Available again within each plan’s credits.')
    });
    setSwitching(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="AI operations" description="How much AI each workspace is using, a switch for every AI feature, and a log of requests with no drafts or customer content in it." />

      <Card emphasis="primary" as="div" className="mt-8">
        <StatGroup columns={4}>
          <Stat primary label={tr('Credits used this month')} value={num(used)} hint={tr('Allowed across workspaces here: {n}', { n: num(allowance) })} />
          <Stat label={tr('Workspaces at 80%+')} value={<span className={nearLimit ? 'text-warning' : undefined}>{nearLimit}</span>} />
          <Stat label={tr('Blocked by a rule')} value={pct(blocked)} hint={tr('Blocked: {n} · Recent requests: {total}', { n: blocked, total: log.length })} />
          <Stat label={tr('Features switched off')} value={<span className={offCount ? 'text-danger' : undefined}>{offCount}</span>} hint={tr('Provider: none — rule-based preview')} />
        </StatGroup>
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <Card id="usage" title={tr('Use by workspace')} description={tr('Highest share of allowance first. Includes any AI credits staff gave this month.')} body="flush">
            {rows.length === 0 ?
            <p className="px-5 py-5 text-label text-fg-muted md:px-6">{tr('No workspaces on this device.')}</p> :

            <ul className="divide-y divide-line">
                {rows.map((r) =>
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3 md:grid-cols-[minmax(0,1fr)_160px_auto] md:px-6">
                    <span className="min-w-0">
                      <span className="block truncate text-label font-semibold text-fg">{r.name}</span>
                      <span className="block text-caption text-fg-subtle">{r.plan}</span>
                    </span>
                    <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded-full bg-sunken md:col-span-1 md:row-start-auto" aria-hidden>
                      <span className={cn('block h-full rounded-full', r.share >= 1 ? 'bg-danger' : r.share >= 0.8 ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.min(100, r.share * 100)}%` }} />
                    </span>
                    <span className="text-right text-label tabular-nums text-fg">
                      {r.used} / {r.limit}
                      {r.share >= 1 && <span className="sr-only"> — {tr('full')}</span>}
                    </span>
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card
            id="log"
            title={tr('Recent requests')}
            description={`${tr('Which feature, which workspace, credits and outcome — never the words asked for or returned.')} ${tr('Failed: {pct}.', { pct: pct(failed) })}`}
            body="flush"
            actions={log.some((l) => l.sample) ? <Badge tone="neutral">{tr('Includes samples')}</Badge> : undefined}>
            
            <ul className="divide-y divide-line">
              {log.slice(0, 12).map((l) =>
              <li key={l.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-start sm:gap-4 md:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="block text-label font-medium text-fg">
                      {tr(l.feature)} <span className="font-normal text-fg-muted">· {l.workspaceName}</span>
                    </span>
                    <span className="block text-caption text-fg-subtle">
                      {formatRelative(l.at)} · {tr('Credits: {n}', { n: l.credits })}
                      {l.note && ` · ${l.note}`}
                    </span>
                  </span>
                  <Badge tone={outcomeTone[l.outcome]} dot>
                    {tr(outcomeLabel[l.outcome])}
                  </Badge>
                </li>
              )}
            </ul>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <Card id="features" title={tr('AI features')} description={tr('Switching one off pauses it for every workspace straight away.')} actions={<IllustrativeTag note={tr('No AI provider is connected in the prototype. Results come from rules and templates.')} />}>
            <ul className="flex flex-col divide-y divide-line">
              {aiFeatures.map((f) => {
                const off = f.id === 'page_setup' ? null : store.aiOff[f.id];
                const parts = [tr(f.where), `${tr('Credits: {n}', { n: f.credits })} ${tr(f.per)}`, off ? tr('off since {when}', { when: formatRelative(off.at) }) : null];
                return (
                  <li key={f.id} className="py-3 first:pt-0 last:pb-0">
                    <Switch id={`ai-${f.id}`} checked={isOn(f.id)} onChange={() => setSwitching(f)} label={tr(f.name)} description={parts.filter(Boolean).join(' · ')} />
                  </li>);

              })}
            </ul>
          </Card>

          <Card id="safeguards" title={tr('Safeguards')}>
            <ul className="flex flex-col gap-2.5">
              {safeguards.map((s) =>
              <li key={s} className="text-label text-fg-muted">
                  {tr(s)}
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <ReasonDialog
        open={!!switching}
        onClose={() => setSwitching(null)}
        onConfirm={confirm}
        destructive={!!switching && isOn(switching.id)}
        title={switching ? isOn(switching.id) ? tr('Switch off {feature}?', { feature: tr(switching.name) }) : tr('Switch on {feature}?', { feature: tr(switching.name) }) : ''}
        description={switching && isOn(switching.id) ? tr('Every workspace loses this feature until it’s switched back on. Drafts and pages already made stay as they are.') : tr('Every workspace gets it back, within its plan’s credits.')}
        confirmLabel={switching && isOn(switching.id) ? tr('Switch off') : tr('Switch on')} />
      
    </div>);

}