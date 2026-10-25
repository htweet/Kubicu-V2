import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, Columns3Icon, PlusIcon, XIcon } from 'lucide-react';
import type { EliteGoal, EliteUseCase, ExamplePage } from '../../data/examples/build';
import { eliteGoalLabels, eliteUseCaseLabels } from '../../data/eliteTemplates';
import { TemplateThumb } from './TemplateThumb';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { formatNaira as formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';

interface EliteCollectionProps {
  templates: ExamplePage[];
  /** Where a card opens. */
  hrefFor: (e: ExamplePage) => string;
  /** In the app, open the preview sheet instead of navigating. */
  onOpen?: (e: ExamplePage) => void;
}

/** Elite Template Library (D154): curated paid templates with use-case and goal filters, and compare up to 3. */
export function EliteCollection({ templates, hrefFor, onOpen }: EliteCollectionProps) {
  const open = (t: ExamplePage) => (ev: React.MouseEvent) => {
    if (!onOpen) return;
    ev.preventDefault();
    onOpen(t);
  };
  const [useCase, setUseCase] = useState<EliteUseCase | 'all'>('all');
  const [goal, setGoal] = useState<EliteGoal | 'all'>('all');
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const elite = useMemo(() => templates.filter((t) => t.elite).sort((a, b) => (a.elite?.number ?? 0) - (b.elite?.number ?? 0)), [templates]);
  const list = elite.filter((t) => (useCase === 'all' || t.elite?.useCase === useCase) && (goal === 'all' || t.elite?.goal === goal));
  const useCases = (Object.keys(eliteUseCaseLabels) as EliteUseCase[]).filter((u) => elite.some((t) => t.elite?.useCase === u));
  if (elite.length === 0) return null;

  const toggle = (id: string) => setCompare((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]);
  const picked = compare.map((id) => elite.find((t) => t.id === id)).filter(Boolean) as ExamplePage[];

  return (
    <section aria-labelledby="elite-title" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="elite-title" className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg md:text-[32px]">
            Elite collection
          </h2>
          <p className="mt-2 text-label text-fg-muted">Complete, art-directed pages with their own structure — heroes, side-by-side sections, grids and a clear main action. Each works with any theme. Example prices, paid once per workspace.</p>
        </div>
        <p className="text-caption text-fg-subtle" aria-live="polite">
          {list.length} of {elite.length}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Chips label="Use case" value={useCase} onChange={setUseCase} options={[['all', 'All'], ...useCases.map((u) => [u, eliteUseCaseLabels[u]] as [EliteUseCase, string])]} />
        <Chips label="Main goal" value={goal} onChange={setGoal} options={[['all', 'Any goal'], ...(Object.entries(eliteGoalLabels) as [EliteGoal, string][])]} />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const e = t.elite!;
          const on = compare.includes(t.id);
          return (
            <li key={t.id} className="flex flex-col">
              <Link to={hrefFor(t)} onClick={open(t)} className="group block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <span className="relative block overflow-hidden rounded-[16px] border border-line bg-sunken transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                  <span className="flex justify-center pt-6">
                    <TemplateThumb doc={t.doc} width={250} height={420} />
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-canvas/90 px-2.5 py-1 text-caption font-semibold tabular-nums text-fg">{String(e.number).padStart(2, '0')}</span>
                </span>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={hrefFor(t)} onClick={open(t)} className="text-heading font-semibold text-fg hover:underline">{t.name}</Link>
                  <p className="mt-0.5 text-label text-fg-muted">{t.bestFor}</p>
                </div>
                <p className="shrink-0 text-label font-semibold tabular-nums text-fg">{formatNgn(e.priceNgn)}</p>
              </div>
              <p className="mt-2 text-caption text-fg-subtle">
                {eliteGoalLabels[e.goal]} · {e.structure}
              </p>
              <button
                type="button"
                aria-pressed={on}
                disabled={!on && compare.length >= 3}
                onClick={() => toggle(t.id)}
                className="mt-3 inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-line px-3 text-caption font-medium text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50">
                
                {on ? <CheckIcon size={13} aria-hidden /> : <PlusIcon size={13} aria-hidden />} {on ? 'In compare' : 'Compare'}
              </button>
            </li>);

        })}
      </ul>

      {compare.length > 0 &&
      <div className="sticky bottom-4 z-30 mt-8 flex justify-center">
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-line-strong bg-raised px-4 py-2 shadow-3">
            <span className="text-label text-fg">{compare.length} of 3 to compare</span>
            <Button size="sm" leadingIcon={Columns3Icon} disabled={compare.length < 2} onClick={() => setComparing(true)}>
              Compare
            </Button>
            <button type="button" onClick={() => setCompare([])} className="inline-flex h-8 items-center gap-1 px-2 text-caption font-medium text-fg-muted hover:text-fg">
              <XIcon size={13} aria-hidden /> Clear
            </button>
          </div>
        </div>
      }

      <Dialog open={comparing} onClose={() => setComparing(false)} size="lg" title="Compare templates" description="Phone previews side by side. Scroll each one to see the whole page.">
        <div className="scroll-quiet -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {picked.map((t) =>
          <div key={t.id} className="flex shrink-0 flex-col items-center gap-2">
              <div className="scroll-quiet h-[460px] overflow-y-auto rounded-[22px]">
                <TemplateThumb doc={t.doc} width={200} height={1600} />
              </div>
              <Link to={hrefFor(t)} className="text-label font-semibold text-fg hover:underline">{t.name}</Link>
              <span className="text-caption tabular-nums text-fg-subtle">{t.elite ? formatNgn(t.elite.priceNgn) : ''}</span>
            </div>
          )}
        </div>
      </Dialog>
    </section>);

}

function Chips<T extends string>({ label, value, onChange, options }: {label: string;value: T;onChange: (v: T) => void;options: [T, string][];}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-20 shrink-0 text-caption text-fg-subtle">{label}</span>
      {options.map(([v, text]) =>
      <button
        key={v}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={cn(
          'h-8 rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          value === v ? 'border-fg bg-fg text-canvas' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
        )}>
        
          {text}
        </button>
      )}
    </div>);

}