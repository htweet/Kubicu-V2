import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { flagOn, useAdminStore } from '../../utils/admin/store';
import { aiCredits, aiCost } from '../../data/aiLimits';
import { plans } from '../../data/plans';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Badge } from '../../components/ui/Badge';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { cn } from '../../utils/cn';

/** Every AI-labelled feature in the product and how it is limited (D130). */
const aiFeatures = [
{ name: 'AI page setup', where: 'Canvas → Page, onboarding', cost: `${aiCost.page} credits per draft`, flag: true },
{ name: 'Block suggestions', where: 'Canvas block settings', cost: `${aiCost.block} credit each`, flag: false },
{ name: 'Print kit writing helper', where: 'Domains & QR → Print kit', cost: '1 credit each', flag: false },
{ name: 'Business Coach', where: 'Growth → Business Coach', cost: 'No credits — reads your own numbers', flag: false },
{ name: 'Business kit draft', where: 'Onboarding', cost: `${aiCost.page} credits`, flag: false }];


const safeguards = [
'Never invents prices, reviews, qualifications, delivery promises or policies — gaps become [Add …] placeholders.',
'Only reads what the seller typed or already saved in their workspace; no customer messages or payment details.',
'Every result is labelled “AI preview” and needs the seller to accept it.',
'Credits reset on the 1st of each month; a failed request doesn’t use credits.'];


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

/** Super admin → AI operations (D130): credit use by workspace, features, kill switch and safeguards. No private content is shown. */
export function AdminAi() {
  const { workspaces } = useWorkspace();
  const [store] = useAdminStore();
  const rows = useMemo(
    () =>
    workspaces.
    map((w) => {
      const used = usageFor(w.id);
      const limit = aiCredits[w.plan];
      return { id: w.id, name: w.name, plan: plans[w.plan].name, used, limit, share: limit ? used / limit : 0 };
    }).
    sort((a, b) => b.share - a.share),
    [workspaces]
  );
  const used = rows.reduce((s, r) => s + r.used, 0);
  const allowance = rows.reduce((s, r) => s + r.limit, 0);
  const nearLimit = rows.filter((r) => r.share >= 0.8).length;
  const setupOn = flagOn(store, 'ai_page_setup');

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="AI operations" description="How much AI each workspace is using this month, which features use it, and the switch to turn it off. No drafts or customer content are shown here." />

      <Card emphasis="primary" as="div" className="mt-8">
        <StatGroup columns={4}>
          <Stat primary label="Credits used this month" value={used.toLocaleString()} hint={`of ${allowance.toLocaleString()} allowed across workspaces here`} />
          <Stat label="Workspaces at 80%+" value={<span className={nearLimit ? 'text-warning' : undefined}>{nearLimit}</span>} />
          <Stat label="AI page setup" value={setupOn ? 'On' : 'Off'} hint={<Link to="/admin/flags" className="font-medium text-action hover:underline">Feature flags</Link>} />
          <Stat label="Provider" value="None" hint="Rule-based preview" />
        </StatGroup>
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card id="usage" title="Use by workspace" description="Highest share of allowance first." body="flush">
          {rows.length === 0 ?
          <p className="px-5 py-5 text-label text-fg-muted md:px-6">No workspaces on this device.</p> :

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
                    {r.share >= 1 && <span className="sr-only"> — full</span>}
                  </span>
                </li>
            )}
            </ul>
          }
        </Card>

        <div className="flex flex-col gap-8">
          <Card id="features" title="AI features" body="flush" actions={<IllustrativeTag note="No AI provider is connected in the prototype. Results come from rules and templates." />}>
            <ul className="divide-y divide-line">
              {aiFeatures.map((f) =>
              <li key={f.name} className="flex items-start justify-between gap-4 px-5 py-3 md:px-6">
                  <span className="min-w-0">
                    <span className="block text-label font-semibold text-fg">{f.name}</span>
                    <span className="block text-caption text-fg-subtle">
                      {f.where} · {f.cost}
                    </span>
                  </span>
                  {f.flag ? <Badge tone={setupOn ? 'success' : 'danger'} dot>{setupOn ? 'On' : 'Switched off'}</Badge> : <Badge tone="success" dot>On</Badge>}
                </li>
              )}
            </ul>
          </Card>

          <Card id="safeguards" title="Safeguards">
            <ul className="flex flex-col gap-2.5">
              {safeguards.map((s) =>
              <li key={s} className="text-label text-fg-muted">
                  {s}
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>);

}