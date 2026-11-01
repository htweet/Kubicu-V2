import React, { useState } from 'react';
import { toast } from 'sonner';
import type { FlagId } from '../../types/admin';
import type { WorkspacePlan } from '../../types/plan';
import { featureFlags } from '../../data/featureFlags';
import { planOrder, plans } from '../../data/plans';
import { audit, useAdminStore } from '../../utils/admin/store';
import { formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/layout/Card';
import { ReasonDialog } from '../../components/admin/ReasonDialog';
import { ModuleFlagsSection } from '../../components/admin/ModuleFlagsSection';
import { CountryRolloutSection } from '../../components/admin/CountryRolloutSection';
import { cn } from '../../utils/cn';

type Pending = {id: FlagId;on: boolean;plans: WorkspacePlan[];summary: string;} | null;

/** Super admin → Feature flags: kill switches and plan targeting that really change the app (D75b). */
export function AdminFlags() {
  const [store, setStore] = useAdminStore();
  const [pending, setPending] = useState<Pending>(null);
  const history = store.audit.filter((a) => a.area === 'flags').slice(0, 8);

  const confirm = (reason: string) => {
    if (!pending) return;
    const name = featureFlags.find((f) => f.id === pending.id)?.name ?? pending.id;
    setStore((s) =>
    audit({ ...s, flags: { ...s.flags, [pending.id]: { on: pending.on, plans: pending.plans, updatedAt: new Date().toISOString() } } }, { area: 'flags', action: pending.summary, target: name, reason })
    );
    toast.success(`${name}: ${pending.summary.toLowerCase()}`, { description: 'Applies straight away in every open tab.' });
    setPending(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Feature flags" description="Switch features, workspace modules and Marketplace add-ons off for everyone, or release features to chosen plans. Every change asks for a reason and is logged." />

      <div className="mt-8 flex flex-col gap-6">
        {featureFlags.map((f) => {
          const state = store.flags[f.id];
          const togglePlan = (p: WorkspacePlan) => {
            const next = state.plans.includes(p) ? state.plans.filter((x) => x !== p) : planOrder.filter((x) => x === p || state.plans.includes(x));
            setPending({ id: f.id, on: state.on, plans: next, summary: `${state.plans.includes(p) ? 'Removed' : 'Released to'} ${plans[p].name}` });
          };
          return (
            <Card
              key={f.id}
              id={`flag-${f.id}`}
              title={f.name}
              description={f.description}
              emphasis={state.on ? 'default' : 'primary'}
              actions={
              <Badge tone={state.on ? 'success' : 'danger'} dot>
                  {state.on ? 'On' : 'Off for everyone'}
                </Badge>
              }
              footer={
              <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-caption text-fg-subtle">
                    Affects: {f.affects} · changed {formatRelative(state.updatedAt)}
                  </span>
                  <Button size="sm" variant={state.on ? 'destructive' : 'primary'} onClick={() => setPending({ id: f.id, on: !state.on, plans: state.plans, summary: state.on ? 'Turned off (kill switch)' : 'Turned back on' })}>
                    {state.on ? 'Turn off for everyone' : 'Turn back on'}
                  </Button>
                </div>
              }>
              
              {f.planTargeted ?
              <fieldset disabled={!state.on}>
                  <legend className="text-caption font-medium text-fg-muted">Released to</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {planOrder.map((p) => {
                    const on = state.plans.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={on}
                        onClick={() => togglePlan(p)}
                        className={cn(
                          'h-8 rounded-full border px-3 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50',
                          on ? 'border-fg bg-fg text-canvas' : 'border-line text-fg-muted hover:border-line-strong'
                        )}>
                        
                          {plans[p].name}
                        </button>);

                  })}
                  </div>
                </fieldset> :

              <p className="text-caption text-fg-muted">Not targeted by plan — it follows each workspace’s own settings while the flag is on.</p>
              }
            </Card>);

        })}
      </div>

      <CountryRolloutSection />

      <ModuleFlagsSection />

      <section aria-labelledby="flag-history" className="mt-10">
        <h2 id="flag-history" className="text-heading font-semibold text-fg">
          Recent changes
        </h2>
        {history.length === 0 ?
        <p className="mt-3 text-label text-fg-muted">No flag changes yet.</p> :

        <ol className="mt-4 flex flex-col divide-y divide-line border-y border-line">
            {history.map((h) =>
          <li key={h.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span className="text-label text-fg">
                  <span className="font-semibold">{h.target}</span> · {h.action}
                  <span className="block text-caption text-fg-subtle">“{h.reason}”</span>
                </span>
                <span className="shrink-0 text-caption text-fg-subtle">
                  {h.actor} · {formatRelative(h.at)}
                </span>
              </li>
          )}
          </ol>
        }
      </section>

      <ReasonDialog open={!!pending} onClose={() => setPending(null)} onConfirm={confirm} destructive={pending ? !pending.on : false} title={pending?.summary ?? ''} description="This changes the app for real workspaces straight away." confirmLabel="Apply change" />
    </div>);

}