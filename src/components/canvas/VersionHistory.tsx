import React, { useState } from 'react';
import { toast } from 'sonner';
import { BookmarkPlusIcon, HistoryIcon, RotateCcwIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';

export function VersionHistory() {
  const { state, actions } = useEditor();
  const [label, setLabel] = useState('');
  const liveId = state.versions.find((v) => v.kind === 'published')?.id;

  const restore = (id: string, name: string) => {
    actions.restoreVersion(id);
    toast(`Restored “${name}” to your draft`, {
      description: 'Publish to make it live.',
      action: { label: 'Undo', onClick: () => actions.undo() }
    });
  };

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          actions.saveSnapshot(label);
          toast('Snapshot saved');
          setLabel('');
        }}>
        
        <label htmlFor="snapshot-name" className="text-label font-medium text-fg">
          Save a snapshot of your draft
        </label>
        <div className="flex gap-2">
          <input
            id="snapshot-name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Before Harmattan launch"
            className={cn(fieldControlClass, 'h-9 min-w-0 flex-1 text-label')} />
          
          <Button type="submit" variant="secondary" size="md" leadingIcon={BookmarkPlusIcon} className="h-9">
            Save
          </Button>
        </div>
      </form>

      {state.versions.length === 0 ?
      <EmptyState icon={HistoryIcon} title="No versions yet" description="Each publish and snapshot is saved here." /> :

      <ol className="relative flex flex-col">
          {state.versions.map((v, i) =>
        <li key={v.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < state.versions.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 h-full w-px bg-line" />}
              <span
            aria-hidden
            className={cn('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2', v.id === liveId ? 'border-success bg-success' : 'border-line-strong bg-raised')} />
          
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-label font-semibold text-fg">{v.label}</p>
                  {v.id === liveId ?
              <Badge tone="success">Live</Badge> :

              <Badge tone={v.kind === 'published' ? 'neutral' : 'info'}>{v.kind === 'published' ? 'Published' : 'Snapshot'}</Badge>
              }
                </div>
                <p className="text-caption text-fg-subtle" title={formatTimestamp(v.createdAt)}>
                  {formatRelative(v.createdAt)} · {v.doc.blocks.length} blocks
                </p>
                {v.note && <p className="mt-1 text-caption text-fg-muted">{v.note}</p>}
                <Button variant="tertiary" size="sm" leadingIcon={RotateCcwIcon} className="-ml-3 mt-1" onClick={() => restore(v.id, v.label)}>
                  Restore to draft
                </Button>
              </div>
            </li>
        )}
        </ol>
      }
    </div>);

}