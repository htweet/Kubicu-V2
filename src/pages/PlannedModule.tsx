import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheckIcon, PenToolIcon, CheckIcon } from 'lucide-react';
import { plannedModules } from '../data/plannedModules';
import { workspaceNav } from '../data/navigation';
import { roadmapBatches } from '../data/roadmap';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { NotFound } from './NotFound';

export function PlannedModule() {
  const { module } = useParams();
  const navigate = useNavigate();
  const info = plannedModules.find((m) => m.slug === module);
  if (!info) return <NotFound embedded />;
  const Icon = workspaceNav.find((n) => n.id === info.slug)?.icon;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 md:px-10 md:py-12">
      <section className="overflow-hidden rounded-lg border border-line bg-raised shadow-1">
        <div className="dot-stage px-6 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-3">
            {Icon &&
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-action text-action-fg shadow-2">
                <Icon size={26} strokeWidth={2.25} aria-hidden />
              </span>
            }
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">Planned · Batch {info.batch}</Badge>
              <span className="text-caption font-medium text-fg-muted">{info.phase}</span>
            </div>
          </div>
          <h1 className="mt-6 font-display text-title font-semibold text-fg md:text-display">{info.title}</h1>
          <p className="mt-3 max-w-2xl text-body text-fg-muted md:text-[17px] md:leading-relaxed">{info.summary}</p>
        </div>

        <div className="border-t border-line px-6 py-5 md:px-10">
          <h2 className="sr-only">Where this sits in the roadmap</h2>
          <ol className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Delivery batches">
            {roadmapBatches.map((b) => {
              const isThis = b.batch === info.batch;
              return (
                <li key={b.batch} className="min-w-[96px] flex-1">
                  <span
                    aria-hidden
                    className={cn('block h-1.5 rounded-full', b.done ? 'bg-success' : isThis ? 'bg-action' : 'bg-sunken')} />
                  
                  <span className={cn('mt-2 block text-caption', isThis ? 'font-semibold text-fg' : 'text-fg-subtle')}>
                    <span className="sr-only">{b.done ? 'Done: ' : isThis ? 'This module: ' : 'Upcoming: '}</span>
                    {b.batch}. {b.name}
                  </span>
                </li>);

            })}
          </ol>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <section aria-labelledby="capabilities">
          <h2 id="capabilities" className="text-heading font-semibold text-fg">
            What it will do
          </h2>
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
            {info.capabilities.map((c) =>
            <li key={c} className="flex items-start gap-3 border-t border-line py-3.5 text-body text-fg">
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-action-soft text-action">
                  <CheckIcon size={12} strokeWidth={3} />
                </span>
                {c}
              </li>
            )}
          </ul>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-md bg-sunken p-5">
            <ShieldCheckIcon size={20} strokeWidth={2.25} className="text-action" aria-hidden />
            <p className="mt-3 text-label font-semibold text-fg">Our promise</p>
            <p className="mt-1 text-label text-fg-muted">{info.guardrail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button leadingIcon={PenToolIcon} onClick={() => navigate('/app/canvas')}>
              Back to your page
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app')}>
              Overview
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">Nothing on this screen works yet. It describes what’s coming so the navigation stays honest.</p>
        </aside>
      </div>
    </div>);

}