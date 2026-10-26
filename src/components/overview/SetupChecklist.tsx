import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { PlanLock } from '../ui/PlanLock';
import { cn } from '../../utils/cn';
import { allBlocks } from '../../utils/sitePages';
import { useDomains } from '../../contexts/DomainsContext';

interface Step {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  to?: string;
  planned?: string;
  /** Shown and linked, but not counted towards setup progress. */
  optional?: boolean;
}

export function SetupChecklist() {
  const { state, issues, hasUnpublishedChanges } = useEditor();
  const types = new Set(allBlocks(state.site).filter((b) => !b.visibility.hidden).map((b) => b.type));
  const canvas = `/app/canvas/${state.draft.id}`;
  const domains = useDomains().data;
  const hasDomain = domains.domains.some((d) => d.status === 'live');
  const hasQr = domains.qrs.length > 0;

  const steps: Step[] = [
  { id: 'create', label: 'Create your page', hint: 'Your space on KUBICU exists.', done: true },
  {
    id: 'contact',
    label: 'Give visitors a way to reach you',
    hint: 'Add WhatsApp, a contact block or a form.',
    done: types.has('whatsapp') || types.has('contact') || types.has('leadForm'),
    to: canvas
  },
  {
    id: 'offer',
    label: 'Feature something to buy or book',
    hint: 'A product highlight or booking CTA.',
    done: types.has('product') || types.has('booking'),
    to: canvas
  },
  {
    id: 'checks',
    label: 'Clear the pre-publish checks',
    hint: issues.length ? `${issues.length} item${issues.length === 1 ? '' : 's'} to review in the canvas.` : 'Links, images and contrast look good.',
    done: issues.length === 0,
    to: canvas
  },
  {
    id: 'publish',
    label: 'Publish your latest changes',
    hint: hasUnpublishedChanges ? 'Your draft has changes visitors can’t see yet.' : 'Visitors see your latest version.',
    done: !!state.published && !hasUnpublishedChanges,
    to: canvas
  },
  { id: 'domain', label: 'Connect your own domain', hint: 'Guided DNS setup and security certificate status.', done: hasDomain, to: '/app/domains', optional: true },
  { id: 'qr', label: 'Make a QR code for your shop', hint: 'Codes you can point somewhere else later, with scans in Analytics.', done: hasQr, to: '/app/qr', optional: true }];


  const countable = steps.filter((s) => !s.planned && !s.optional);
  const done = countable.filter((s) => s.done).length;

  return (
    <section aria-labelledby="setup-heading" className="flex flex-col">
      <div className="flex items-center gap-4">
        <ProgressRing done={done} total={countable.length} />
        <div>
          <h2 id="setup-heading" className="text-heading font-semibold text-fg">
            Setup
          </h2>
          <p className="text-caption text-fg-subtle">
            {done === countable.length ? 'All set — nice work.' : `${countable.length - done} step${countable.length - done === 1 ? '' : 's'} left`}
          </p>
        </div>
      </div>
      <ol className="mt-5 flex flex-col">
        {steps.map((step) => {
          const content =
          <>
              <span
              aria-hidden
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                step.done ? 'border-success bg-success text-canvas' : 'border-line-strong',
                step.planned && 'border-dashed'
              )}>
              
                {step.done && <CheckIcon size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-label font-medium', step.done ? 'text-fg-muted' : 'text-fg', step.planned && 'text-fg-subtle')}>
                  <span className="sr-only">{step.done ? 'Done: ' : 'To do: '}</span>
                  {step.label}
                </span>
                <span className="block text-caption text-fg-subtle">
                  {step.optional && !step.done && <span className="font-medium text-fg-muted">Optional · </span>}
                  {step.hint}
                </span>
              </span>
              {step.planned ?
            <PlanLock kind="planned">{step.planned}</PlanLock> :

            !step.done && step.to && <ArrowRightIcon size={15} className="mt-0.5 shrink-0 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
            }
            </>;

          return (
            <li key={step.id} className="border-t border-line first:border-t-0">
              {!step.done && step.to ?
              <Link to={step.to} className="group flex items-start gap-3 rounded-sm py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  {content}
                </Link> :

              <div className="flex items-start gap-3 py-3">{content}</div>
              }
            </li>);

        })}
      </ol>
    </section>);

}

function ProgressRing({ done, total }: {done: number;total: number;}) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-sunken" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-action transition-[stroke-dashoffset] duration-300 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done / total)} />
        
      </svg>
      <span className="absolute text-caption font-semibold tabular-nums text-fg">
        {done}/{total}
      </span>
    </span>);

}