import React, { useState } from 'react';
import { toast } from 'sonner';
import { BookmarkIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import type { SavedSection } from '../../types/page';
import { useLibrary } from '../../contexts/LibraryContext';
import { useEditor } from '../../contexts/EditorContext';
import { blockDefinitions } from '../../data/blockRegistry';
import { Menu } from '../ui/Menu';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { cn } from '../../utils/cn';

interface SavedSectionsListProps {
  query: string;
  touch?: boolean;
  onInserted?: (firstId: string | null) => void;
}

/** Workspace sections at the top of the block library. Hidden entirely until one exists. */
export function SavedSectionsList({ query, touch, onInserted }: SavedSectionsListProps) {
  const library = useLibrary();
  const { state, actions } = useEditor();
  const [renaming, setRenaming] = useState<SavedSection | null>(null);
  const [name, setName] = useState('');
  const q = query.trim().toLowerCase();
  const items = library.sections.filter((s) => !q || `${s.name} section saved`.toLowerCase().includes(q));
  if (items.length === 0) return null;

  const insert = (s: SavedSection) => {
    actions.insertBlocks(s.blocks, s.name);
    toast(`Added “${s.name}”`, { action: { label: 'Undo', onClick: () => actions.undo() } });
    onInserted?.(state.selectedId);
  };

  const remove = (s: SavedSection) => {
    const removed = library.deleteSection(s.id);
    toast(`Deleted “${s.name}” from your library`, {
      description: 'Pages that already use it keep their copy.',
      action: removed ? { label: 'Undo', onClick: () => library.restoreSection(removed) } : undefined,
    });
  };

  return (
    <section aria-labelledby="cat-saved">
      <h3 id="cat-saved" className="px-2 pb-1.5 text-caption font-semibold text-fg-subtle">
        Your sections
      </h3>
      <ul className="flex flex-col">
        {items.map((s) => (
          <li key={s.id} className="group flex items-center gap-1 rounded-md pr-1 hover:bg-sunken">
            <button
              type="button"
              onClick={() => insert(s)}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                touch ? 'py-3' : 'py-2',
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-canvas text-action">
                <BookmarkIcon size={15} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-label font-medium text-fg">{s.name}</span>
                <span className="block truncate text-caption text-fg-subtle">
                  {s.blocks.length} block{s.blocks.length === 1 ? '' : 's'} · {s.blocks.slice(0, 3).map((b) => blockDefinitions[b.type].name).join(', ')}
                </span>
              </span>
            </button>
            <Menu
              items={[
                {
                  id: 'rename',
                  label: 'Rename',
                  icon: PencilIcon,
                  onSelect: () => {
                    setName(s.name);
                    setRenaming(s);
                  },
                },
                { id: 'delete', label: 'Delete from library', icon: Trash2Icon, destructive: true, onSelect: () => remove(s) },
              ]}
              trigger={(props) => (
                <button
                  type="button"
                  {...props}
                  aria-label={`More actions for ${s.name}`}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-sm text-fg-subtle hover:bg-raised hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    touch ? 'h-10 w-10' : 'h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                  )}
                >
                  <MoreHorizontalIcon size={14} aria-hidden />
                </button>
              )}
            />
          </li>
        ))}
      </ul>

      <Dialog
        open={!!renaming}
        onClose={() => setRenaming(null)}
        size="sm"
        title="Rename section"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                if (renaming) library.renameSection(renaming.id, name);
                setRenaming(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="pb-2">
          <TextInput id="rename-section" label="Section name" value={name} maxLength={48} onChange={(e) => setName(e.target.value)} />
        </div>
      </Dialog>
    </section>
  );
}
