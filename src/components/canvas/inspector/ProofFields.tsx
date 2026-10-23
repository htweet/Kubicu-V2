import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useProof } from '../../../hooks/useProof';
import { ratingSummary, showable } from '../../../utils/proof';
import { TextInput } from '../../ui/TextInput';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';

/** Inspector for the Proof block (D91). Content lives in Proof of work, not in the block. */
export function ProofFields({ block }: {block: BlockOf<'proof'>;}) {
  const { actions } = useEditor();
  const { current } = useWorkspace();
  const { data } = useProof(current.id);
  const c = block.content;
  const set = (patch: Partial<typeof c>, field: string) => actions.updateContent(block.id, 'proof', patch, field);
  const { count } = ratingSummary(data?.reviews ?? []);
  const shown = data?.reviews.filter(showable).length ?? 0;
  const work = data?.work.filter((w) => w.published).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <TextInput id={`${block.id}-title`} label="Heading" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <Field id={`${block.id}-show`} label="Show">
        <Segmented
          ariaLabel="What to show"
          fullWidth
          value={c.show}
          onChange={(v) => set({ show: v }, 'show')}
          options={[
          { value: 'both', label: 'Both' },
          { value: 'reviews', label: 'Reviews' },
          { value: 'work', label: 'Work' }]
          } />
        
      </Field>
      <Field id={`${block.id}-limit`} label="Most to show">
        <Segmented
          ariaLabel="Most items to show"
          fullWidth
          value={String(c.limit) as '3' | '5' | '10'}
          onChange={(v) => set({ limit: Number(v) }, 'limit')}
          options={[
          { value: '3', label: '3' },
          { value: '5', label: '5' },
          { value: '10', label: '10' }]
          } />
        
      </Field>
      <p className="text-caption text-fg-subtle">
        {count} verified review{count === 1 ? '' : 's'} ({shown} with permission to show words) · {work} piece{work === 1 ? '' : 's'} of delivered work shown. Newest first.
      </p>
      <Link to="/app/proof" className="inline-flex items-center gap-1 text-label font-semibold text-fg hover:underline">
        Manage in Proof of work <ArrowUpRightIcon size={14} aria-hidden />
      </Link>
    </div>);

}