import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { examplePages, goalLabels, type ExampleGoal } from '../../data/examples';
import type { ExamplePage } from '../../data/examples/build';
import { blankTemplateDoc } from '../../data/templates';
import { templatePrice } from '../../data/templateMarket';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useApplyTemplate } from '../../hooks/useApplyTemplate';
import type { PageDocument } from '../../types/page';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TemplateThumb } from '../templates/TemplateThumb';
import { BuyTemplateDialog } from '../templates/BuyTemplateDialog';
import { TemplatePreviewDialog } from '../templates/TemplatePreviewDialog';
import { formatNaira as formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';

interface PendingTemplate {
  name: string;
  doc: PageDocument;
}

const goals: (ExampleGoal | 'all')[] = ['all', 'sell', 'book', 'audience', 'showcase', 'events', 'support'];

export function TemplatesPanel() {
  const applyTemplate = useApplyTemplate();
  const market = useMarketplace();
  const library = useLibrary();
  const [pending, setPending] = useState<PendingTemplate | null>(null);
  const [buying, setBuying] = useState<ExamplePage | null>(null);
  const [goal, setGoal] = useState<ExampleGoal | 'all'>('all');
  const [previewing, setPreviewing] = useState<ExamplePage | null>(null);

  const list = useMemo(() => examplePages.filter((e) => goal === 'all' || e.goals.includes(goal)), [goal]);

  const pick = (e: ExamplePage) => {
    if (templatePrice(e.id) > 0 && !market.hasLicence(e.id)) setBuying(e);else
    setPending({ name: e.category, doc: e.doc });
  };

  const apply = () => {
    if (!pending) return;
    applyTemplate(pending.name, pending.doc);
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
      <p className="text-caption text-fg-subtle">
        Layouts built around a goal. Tap one to preview the whole page first. We keep your name and photo, and remove the example’s prices, links and quotes so nothing fictional goes live.
      </p>

      <div role="group" aria-label="Filter by goal" className="-mx-1 flex flex-wrap gap-1.5">
        {goals.map((g) =>
        <button
          key={g}
          type="button"
          aria-pressed={goal === g}
          onClick={() => setGoal(g)}
          className={cn(
            'h-7 rounded-full border px-2.5 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            goal === g ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg-muted hover:text-fg'
          )}>
          
            {g === 'all' ? 'All' : goalLabels[g]}
          </button>
        )}
      </div>

      {library.templates.length > 0 && goal === 'all' &&
      <section aria-labelledby="tpl-yours">
          <h3 id="tpl-yours" className="mb-2 text-label font-semibold text-fg">
            Your templates <span className="font-normal text-fg-subtle">· private</span>
          </h3>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
            {library.templates.map((t) => {
            const doc: PageDocument = { ...blankTemplateDoc, id: t.id, title: t.name, theme: t.theme, blocks: t.blocks };
            return (
              <li key={t.id}>
                  <TemplateCard name={t.name} meta={t.origin === 'assistant' ? 'Composed by the AI assistant' : 'Saved by you'} doc={doc} onUse={() => setPending({ name: t.name, doc })} />
                </li>);

          })}
          </ul>
        </section>
      }

      <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
        {goal === 'all' &&
        <li>
            <TemplateCard name="Blank page" meta="Start from scratch" doc={blankTemplateDoc} onUse={() => setPending({ name: 'Blank page', doc: blankTemplateDoc })} />
          </li>
        }
        {list.map((e) => {
          const price = templatePrice(e.id);
          const locked = price > 0 && !market.hasLicence(e.id);
          return (
            <li key={e.id}>
              <TemplateCard name={e.category} meta={price > 0 ? locked ? `Premium · ${formatNgn(price)}` : 'Premium · owned' : e.name} doc={e.doc} locked={locked} preview onUse={() => setPreviewing(e)} />
            </li>);

        })}
      </ul>

      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <Link to="/app/templates" className="text-caption font-semibold text-action hover:underline">
          More templates, including creators’ →
        </Link>
        <Link to="/app/templates?tab=mine&sell=1" className="text-caption font-semibold text-action hover:underline">
          Sell this page as a template →
        </Link>
      </div>

      <Dialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending ? `Replace your draft with the “${pending.name}” layout?` : ''}
        description="Your current draft is saved as a snapshot first, so you can undo or restore it from version history. Your live page doesn’t change until you publish."
        footer={
        <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={apply} data-autofocus>
              Replace draft
            </Button>
          </>
        } />
      
      <TemplatePreviewDialog
        template={previewing}
        onClose={() => setPreviewing(null)}
        useLabel="Use this layout"
        onUse={(t) => {
          setPreviewing(null);
          pick(t);
        }}
        onBuy={(t) => {
          setPreviewing(null);
          setBuying(t);
        }} />
      
      <BuyTemplateDialog template={buying} onClose={() => setBuying(null)} onBought={(t) => setPending({ name: t.category, doc: t.doc })} />
    </div>);

}

function TemplateCard({ name, meta, doc, locked, preview, onUse }: {name: string;meta: string;doc: PageDocument;locked?: boolean;preview?: boolean;onUse: () => void;}) {
  return (
    <button
      type="button"
      onClick={onUse}
      className="group flex w-full flex-col gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      aria-label={preview ? `Preview the ${name} template` : `Use the ${name} layout`}>
      
      <span className="relative block overflow-hidden rounded-[14px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
        <TemplateThumb doc={doc} width={130} height={190} />
        {locked &&
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-inverse text-fg-inverse">
            <LockIcon size={12} aria-hidden />
          </span>
        }
      </span>
      <span className="min-w-0">
        <span className="block truncate text-label font-semibold text-fg">{name}</span>
        <span className="block truncate text-caption text-fg-subtle">{meta}</span>
      </span>
    </button>);

}