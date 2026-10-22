import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { examplePages, goalLabels, type ExampleGoal } from '../../data/examples';
import { blankTemplateDoc } from '../../data/templates';
import { useEditor } from '../../contexts/EditorContext';
import { prepareStarter } from '../../utils/starterKit';
import type { PageDocument } from '../../types/page';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TemplateThumb } from '../templates/TemplateThumb';
import { cn } from '../../utils/cn';

interface PendingTemplate {
  name: string;
  doc: PageDocument;
}

const goals: (ExampleGoal | 'all')[] = ['all', 'sell', 'book', 'audience', 'showcase', 'events', 'support'];

export function TemplatesPanel() {
  const { state, actions } = useEditor();
  const [pending, setPending] = useState<PendingTemplate | null>(null);
  const [goal, setGoal] = useState<ExampleGoal | 'all'>('all');

  const list = useMemo(() => examplePages.filter((e) => goal === 'all' || e.goals.includes(goal)), [goal]);

  const apply = () => {
    if (!pending) return;
    const profile = state.draft.blocks.find((b) => b.type === 'profile');
    const identity =
    profile?.type === 'profile' ?
    { name: profile.content.name, tagline: profile.content.tagline, avatarUrl: profile.content.avatarUrl, location: profile.content.location } :
    { name: state.draft.title };
    const { doc, hidden } = prepareStarter(pending.doc, identity);
    actions.saveSnapshot(`Before “${pending.name}” template`);
    actions.applyTemplate({ ...doc, title: state.draft.title });
    toast(`Applied “${pending.name}”`, {
      description:
      hidden.length > 0 ?
      `${hidden.length} block${hidden.length === 1 ? ' is' : 's are'} hidden until you add your own links or details. Find them in Layers.` :
      'Your previous draft is saved in version history.',
      action: { label: 'Undo', onClick: () => actions.undo() }
    });
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
      <p className="text-caption text-fg-subtle">
        Layouts built around a goal. We keep your name and photo, and remove the example’s prices, links and quotes so nothing fictional goes live.
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

      <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
        {goal === 'all' &&
        <li>
            <TemplateCard name="Blank page" meta="Start from scratch" doc={blankTemplateDoc} onUse={() => setPending({ name: 'Blank page', doc: blankTemplateDoc })} />
          </li>
        }
        {list.map((e) =>
        <li key={e.id}>
            <TemplateCard name={e.category} meta={e.name} doc={e.doc} onUse={() => setPending({ name: e.category, doc: e.doc })} />
          </li>
        )}
      </ul>

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
      
    </div>);

}

function TemplateCard({ name, meta, doc, onUse }: {name: string;meta: string;doc: PageDocument;onUse: () => void;}) {
  return (
    <button
      type="button"
      onClick={onUse}
      className="group flex w-full flex-col gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      aria-label={`Use the ${name} layout`}>
      
      <span className="block overflow-hidden rounded-[14px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
        <TemplateThumb doc={doc} width={130} height={190} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-label font-semibold text-fg">{name}</span>
        <span className="block truncate text-caption text-fg-subtle">{meta}</span>
      </span>
    </button>);

}