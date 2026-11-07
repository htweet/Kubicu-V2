import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { WorkspacePlan } from '../../types/plan';
import { adjustableFigures, type AdjustableFigure } from '../../data/adjustableFigures';
import { originalPlanText, planOrder } from '../../data/plans';
import { audit, useAdminStore } from '../../utils/admin/store';
import { formatNaira } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { Badge } from '../../components/ui/Badge';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

type Pending = { kind: 'figure'; f: AdjustableFigure; value: number | null } | { kind: 'plan'; plan: WorkspacePlan; name: string; intendedFor: string } | null;

const unitLabel = (f: AdjustableFigure, v: number) =>
  f.unit === 'naira'
    ? formatNaira(v)
    : f.unit === 'amount'
      ? v === 0 && f.key.includes('.cap')
        ? 'no cap'
        : `${f.symbol ?? ''} ${v.toLocaleString('en')}`.trim()
      : f.unit === 'percent'
        ? `${v}%`
        : f.unit === 'days'
          ? `${v} days`
          : f.unit === 'hours'
            ? `${v} hours`
            : f.unit === 'minutes'
              ? `${v} minutes`
              : String(v);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Super admin → Figures & names (D465): example figures (fees, prices, limits, time windows) and plan names that
 * operations can change without a release. Wording — any label, placeholder or message — lives in Localisation → English.
 * Plan prices and AI credits stay in Plans & entitlements, with their two-person approval.
 */
export function AdminFigures() {
  const [store, setStore] = useAdminStore();
  const [pending, setPending] = useState<Pending>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [planDrafts, setPlanDrafts] = useState<Partial<Record<WorkspacePlan, { name: string; intendedFor: string }>>>({});
  // Staff console search links here with ?q= (D472).
  const [params] = useSearchParams();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  useEffect(() => {
    const v = params.get('q');
    if (v !== null) setQuery(v);
  }, [params]);
  const [changedOnly, setChangedOnly] = useState(false);
  const q = query.trim().toLowerCase();
  const isChanged = (f: AdjustableFigure) => typeof store.figures?.[f.key] === 'number';
  // ~100 figures (D469): search and "changed only" keep the page usable.
  const shown = adjustableFigures.filter((f) => (!changedOnly || isChanged(f)) && (!q || `${f.label} ${f.area} ${f.help}`.toLowerCase().includes(q)));
  const areas = [...new Set(shown.map((f) => f.area))];
  const changedCount = adjustableFigures.filter(isChanged).length;
  const showPlans = !changedOnly && (!q || 'plan names'.includes(q) || planOrder.some((p) => originalPlanText[p].name.toLowerCase().includes(q)));

  const current = (f: AdjustableFigure) => {
    const v = store.figures?.[f.key];
    return typeof v === 'number' ? v : f.default;
  };

  const confirm = (reason: string) => {
    if (!pending) return;
    if (pending.kind === 'figure') {
      const { f, value } = pending;
      setStore((s) => {
        const figures = { ...s.figures };
        if (value === null) delete figures[f.key];
        else figures[f.key] = value;
        return audit({ ...s, figures }, { area: 'plans', action: value === null ? `Reset “${f.label}” to ${unitLabel(f, f.default)}` : `Set “${f.label}” to ${unitLabel(f, value)}`, target: f.area, reason });
      });
      setDrafts((d) => ({ ...d, [f.key]: '' }));
    } else {
      const { plan, name, intendedFor } = pending;
      setStore((s) => audit({ ...s, planNames: { ...s.planNames, [plan]: { name: name.trim() || undefined, intendedFor: intendedFor.trim() || undefined } } }, { area: 'plans', action: `Renamed plan to “${name.trim() || originalPlanText[plan].name}”`, target: originalPlanText[plan].name, reason }));
    }
    toast.success('Saved', { description: 'Applies straight away for everyone.' });
    setPending(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Figures & names" description="Change the example figures and plan names the app uses, without a release. Every change asks for a reason and is logged." />

      <p className="mt-4 max-w-2xl text-label text-fg-muted">
        To change any label, button, placeholder or message, use{' '}
        <Link to="/admin/localisation" className="font-medium text-action hover:underline">
          Localisation → English
        </Link>
        . Plan prices and AI credits are in{' '}
        <Link to="/admin/plans" className="font-medium text-action hover:underline">
          Plans & entitlements
        </Link>
        , where a second Platform lead approves them.
      </p>

      <div className="sticky top-0 z-10 -mx-5 mt-8 flex flex-col gap-3 border-b border-line bg-canvas px-5 py-3 sm:flex-row sm:items-end md:-mx-10 md:px-10">
        <div className="min-w-0 flex-1">
          <TextInput id="fig-search" label="Find a figure" type="search" placeholder="For example: trial, Kenya, flyers" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap py-2 text-label text-fg">
          <input type="checkbox" className="h-4 w-4 accent-[var(--color-action)]" checked={changedOnly} onChange={(e) => setChangedOnly(e.target.checked)} />
          {`Changed only (${changedCount})`}
        </label>
      </div>

      {!areas.length && !showPlans && <p className="mt-10 text-label text-fg-muted">{changedOnly && !q ? 'Nothing has been changed yet — every figure is at its original value.' : 'No figure matches that search.'}</p>}

      {areas.length > 1 && (
        <nav aria-label="Jump to a group" className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-caption">
          {areas.map((a) => (
            <a key={a} href={`#fig-${slug(a)}`} className="text-action hover:underline">
              {a}
            </a>
          ))}
        </nav>
      )}

      {showPlans && (
      <section aria-labelledby="plan-names" className="mt-10">
        <h2 id="plan-names" className="text-heading font-semibold text-fg">
          Plan names
        </h2>
        <p className="mt-1 text-label text-fg-muted">Shown on Pricing, in the plan picker, on upgrade buttons and on invoices.</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {planOrder.map((p) => {
            const saved = store.planNames?.[p];
            const d = planDrafts[p] ?? { name: saved?.name ?? '', intendedFor: saved?.intendedFor ?? '' };
            return (
              <li key={p} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] sm:items-end">
                <TextInput id={`plan-name-${p}`} label={`Name (was “${originalPlanText[p].name}”)`} placeholder={originalPlanText[p].name} value={d.name} onChange={(e) => setPlanDrafts((x) => ({ ...x, [p]: { ...d, name: e.target.value.slice(0, 24) } }))} />
                <TextInput id={`plan-for-${p}`} label="Intended for" placeholder={originalPlanText[p].intendedFor} value={d.intendedFor} onChange={(e) => setPlanDrafts((x) => ({ ...x, [p]: { ...d, intendedFor: e.target.value.slice(0, 80) } }))} />
                <Button size="sm" variant="secondary" disabled={d.name === (saved?.name ?? '') && d.intendedFor === (saved?.intendedFor ?? '')} onClick={() => setPending({ kind: 'plan', plan: p, name: d.name, intendedFor: d.intendedFor })}>
                  Save
                </Button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-caption text-fg-subtle">Leave a box empty to use the original. Translations follow the English name until each language is updated in Localisation.</p>
      </section>
      )}

      {areas.map((area) => (
        <section key={area} aria-labelledby={`fig-${slug(area)}`} className="mt-10 scroll-mt-28">
          <h2 id={`fig-${slug(area)}`} className="text-heading font-semibold text-fg">
            {area}
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {shown
              .filter((f) => f.area === area)
              .map((f) => {
                const value = current(f);
                const changed = typeof store.figures?.[f.key] === 'number';
                const draft = drafts[f.key] ?? '';
                const n = Number(draft.replace(/[^\d.]/g, ''));
                const err = draft && (!Number.isFinite(n) || n < f.min || n > f.max) ? `Between ${unitLabel(f, f.min)} and ${unitLabel(f, f.max)}` : undefined;
                return (
                  <li key={f.key} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-end">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                        {f.label} {changed && <Badge tone="info">Changed</Badge>}
                      </p>
                      <p className="mt-0.5 text-caption text-fg-muted">{f.help}</p>
                      <p className="mt-0.5 text-caption text-fg-subtle">{`Now ${unitLabel(f, value)} · original ${unitLabel(f, f.default)}`}</p>
                    </div>
                    <TextInput id={`fig-${f.key}`} label="New value" inputMode="decimal" placeholder={String(value)} value={draft} error={err} onChange={(e) => setDrafts((d) => ({ ...d, [f.key]: e.target.value }))} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" disabled={!draft || !!err || n === value} onClick={() => setPending({ kind: 'figure', f, value: n })}>
                        Save
                      </Button>
                      {changed && (
                        <Button size="sm" variant="tertiary" onClick={() => setPending({ kind: 'figure', f, value: null })}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}

      <ReasonDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        destructive={false}
        title={pending?.kind === 'figure' ? (pending.value === null ? `Reset ${pending.f.label}` : `Change ${pending.f.label}`) : pending ? `Rename ${originalPlanText[pending.plan].name}` : ''}
        description="Applies straight away for every workspace."
        confirmLabel="Apply change"
      />
    </div>
  );
}
