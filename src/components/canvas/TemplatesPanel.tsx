import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { examplePages, goalLabels, type ExampleGoal } from '../../data/examples';
import type { ExamplePage } from '../../data/examples/build';
import { blankTemplateDoc } from '../../data/templates';
import { templatePrice } from '../../data/templateMarket';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useT } from '../../contexts/LocaleContext';
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
  /** Shown in the confirmation; already in the screen language. */
  name: string;
  /** Saved with the snapshot; stays English so version history reads the same for everyone. */
  key: string;
  doc: PageDocument;
}

const goals: (ExampleGoal | 'all')[] = ['all', 'sell', 'book', 'audience', 'showcase', 'events', 'support'];

/** Canvas → Templates. Translated in D312; example business names and your own template names stay as written. */
export function TemplatesPanel() {
  const { t: tr } = useT();
  const applyTemplate = useApplyTemplate();
  const market = useMarketplace();
  const library = useLibrary();
  const [pending, setPending] = useState<PendingTemplate | null>(null);
  const [buying, setBuying] = useState<ExamplePage | null>(null);
  const [goal, setGoal] = useState<ExampleGoal | 'all'>('all');
  const [previewing, setPreviewing] = useState<ExamplePage | null>(null);

  const list = useMemo(() => examplePages.filter((e) => goal === 'all' || e.goals.includes(goal)), [goal]);

  const fromExample = (e: ExamplePage): PendingTemplate => ({ name: tr(e.category), key: e.category, doc: e.doc });

  const pick = (e: ExamplePage) => {
    if (templatePrice(e.id) > 0 && !market.hasLicence(e.id)) setBuying(e);else
    setPending(fromExample(e));
  };

  const apply = () => {
    if (!pending) return;
    applyTemplate(pending.key, pending.doc);
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
      <p className="text-caption text-fg-subtle">
        {tr('Layouts built around a goal. Tap one to preview the whole page first. We keep your name and photo, and remove the example’s prices, links and quotes so nothing fictional goes live.')}
      </p>

      <div role="group" aria-label={tr('Filter by goal')} className="-mx-1 flex flex-wrap gap-1.5">
        {goals.map((g) =>
        <button
          key={g}
          type="button"
          aria-pressed={goal === g}
          onClick={() => setGoal(g)}
          className={cn(
            'h-7 whitespace-nowrap rounded-full border px-2.5 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            goal === g ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg-muted hover:text-fg'
          )}>
          
            {tr(g === 'all' ? 'All' : goalLabels[g])}
          </button>
        )}
      </div>

      {library.templates.length > 0 && goal === 'all' &&
      <section aria-labelledby="tpl-yours">
          <h3 id="tpl-yours" className="mb-2 text-label font-semibold text-fg">
            {tr('Your templates')} <span className="font-normal text-fg-subtle">· {tr('private')}</span>
          </h3>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
            {library.templates.map((t) => {
            const doc: PageDocument = { ...blankTemplateDoc, id: t.id, title: t.name, theme: t.theme, blocks: t.blocks };
            return (
              <li key={t.id}>
                  <TemplateCard
                  name={t.name}
                  meta={tr(t.origin === 'assistant' ? 'Composed by the AI assistant' : 'Saved by you')}
                  doc={doc}
                  ariaLabel={tr('Use the layout: {name}', { name: t.name })}
                  onUse={() => setPending({ name: t.name, key: t.name, doc })} />
                
                </li>);

          })}
          </ul>
        </section>
      }

      <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
        {goal === 'all' &&
        <li>
            <TemplateCard
            name={tr('Blank page')}
            meta={tr('Start from scratch')}
            doc={blankTemplateDoc}
            ariaLabel={tr('Use the layout: {name}', { name: tr('Blank page') })}
            onUse={() => setPending({ name: tr('Blank page'), key: 'Blank page', doc: blankTemplateDoc })} />
          
          </li>
        }
        {list.map((e) => {
          const price = templatePrice(e.id);
          const locked = price > 0 && !market.hasLicence(e.id);
          const name = tr(e.category);
          return (
            <li key={e.id}>
              <TemplateCard
                name={name}
                meta={price > 0 ? locked ? tr('Premium · {price}', { price: formatNgn(price) }) : tr('Premium · owned') : e.name}
                doc={e.doc}
                locked={locked}
                ariaLabel={tr('Preview the template: {name}', { name })}
                onUse={() => setPreviewing(e)} />
              
            </li>);

        })}
      </ul>

      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <Link to="/app/templates" className="text-caption font-semibold text-action hover:underline">
          {tr('More templates, including creators’ →')}
        </Link>
        <Link to="/app/templates?tab=mine&sell=1" className="text-caption font-semibold text-action hover:underline">
          {tr('Sell this page as a template →')}
        </Link>
      </div>

      <Dialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending ? tr('Replace your draft with this layout? {name}', { name: pending.name }) : ''}
        description={tr('Your current draft is saved as a snapshot first, so you can undo or restore it from version history. Your live page doesn’t change until you publish.')}
        footer={
        <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              {tr('Cancel')}
            </Button>
            <Button onClick={apply} data-autofocus>
              {tr('Replace draft')}
            </Button>
          </>
        } />
      
      <TemplatePreviewDialog
        template={previewing}
        onClose={() => setPreviewing(null)}
        useLabel={tr('Use this layout')}
        onUse={(t) => {
          setPreviewing(null);
          pick(t);
        }}
        onBuy={(t) => {
          setPreviewing(null);
          setBuying(t);
        }} />
      
      <BuyTemplateDialog template={buying} onClose={() => setBuying(null)} onBought={(t) => setPending(fromExample(t))} />
    </div>);

}

interface TemplateCardProps {
  name: string;
  meta: string;
  doc: PageDocument;
  locked?: boolean;
  ariaLabel: string;
  onUse: () => void;
}

function TemplateCard({ name, meta, doc, locked, ariaLabel, onUse }: TemplateCardProps) {
  return (
    <button type="button" onClick={onUse} className="group flex w-full flex-col gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" aria-label={ariaLabel}>
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