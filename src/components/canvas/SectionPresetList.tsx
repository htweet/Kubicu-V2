import React from 'react';
import { toast } from 'sonner';
import { LayoutTemplateIcon, PlusIcon } from 'lucide-react';
import { sectionGroups, sectionPresets, type SectionPreset } from '../../data/sectionPresets';
import { useEditor } from '../../contexts/EditorContext';
import { cn } from '../../utils/cn';

/** Ready-made sections in the picker (D172). Inserting adds real, editable blocks below the selection. */
export function SectionPresetList({ query, touch, onInserted }: {query: string;touch?: boolean;onInserted?: () => void;}) {
  const { state, actions } = useEditor();
  const q = query.trim().toLowerCase();
  const items = sectionPresets.filter((p) => !q || `${p.name} ${p.description} ${p.shape} ${p.group} section`.toLowerCase().includes(q));
  if (items.length === 0) return null;

  const insert = (p: SectionPreset) => {
    actions.insertBlocks(p.build({ name: state.draft.title }), p.name);
    toast(`Added “${p.name}”`, { description: 'Replace anything marked [Add …] — the page can’t publish until you do.', action: { label: 'Undo', onClick: () => actions.undo() } });
    onInserted?.();
  };

  return (
    <div className="flex flex-col gap-5">
      {sectionGroups.map((g) => {
        const list = items.filter((p) => p.group === g);
        if (list.length === 0) return null;
        return (
          <section key={g} aria-label={g}>
            <h4 className="mb-1 px-1 text-[11.5px] font-medium text-fg-subtle">{g}</h4>
            <ul className="flex flex-col gap-0.5">
              {list.map((p) =>
              <li key={p.id}>
                  <button
                  type="button"
                  onClick={() => insert(p)}
                  aria-label={`Add section: ${p.name}. ${p.shape}`}
                  className={cn('group relative flex w-full items-start gap-3 rounded-md px-2 text-left transition-colors duration-150 hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', touch ? 'py-3 pr-14' : 'py-2')}>
                  
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-action">
                      <LayoutTemplateIcon size={15} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label font-medium text-fg">{p.name}</span>
                      <span className="block text-caption text-fg-subtle">{p.description}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-fg-muted">{p.shape}</span>
                    </span>
                    <span aria-hidden className={cn('absolute right-0 top-0 flex h-full items-start rounded-r-md pl-2 pr-1.5 pt-2 transition-opacity duration-150', touch ? 'opacity-100' : 'bg-sunken opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}>
                      <span className={cn('flex items-center justify-center rounded-full bg-action text-action-fg', touch ? 'h-10 w-10' : 'h-8 w-8')}>
                        <PlusIcon size={14} />
                      </span>
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </section>);

      })}
    </div>);

}