import React from 'react';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Block } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { currentLook, type LookOption } from '../../../utils/blockLooks';
import { cn } from '../../../utils/cn';

/** One place to switch a block between its ready-made looks (D177). Words, photos and items always stay. Translated in D313. */
export function LookPicker({ block, options }: {block: Block;options: LookOption[];}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const current = currentLook(block, options);
  const groupName = `look-${block.id}`;

  const choose = (look: LookOption) => {
    if (look.id === current?.id) return;
    actions.applyLook(block.id, look);
    toast(tr('Look changed to: {name}', { name: tr(look.name) }), {
      description: tr(block.parentId ? 'Your words, photos and items stayed. Width and background still come from the container.' : 'Your words, photos and items stayed.'),
      action: { label: tr('Undo'), onClick: () => actions.undo() }
    });
  };

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{tr('Look')}</legend>
      <ul className="flex flex-col gap-1.5">
        {options.map((o) => {
          const on = o.id === current?.id;
          return (
            <li key={o.id}>
              <label
                className={cn(
                  'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-focus',
                  on ? 'border-select bg-action-soft' : 'border-line hover:bg-sunken'
                )}>
                
                <input type="radio" name={groupName} className="sr-only" checked={on} onChange={() => choose(o)} />
                <span
                  aria-hidden
                  className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', on ? 'border-action bg-action text-action-fg' : 'border-line-strong bg-raised')}>
                  
                  {on && <CheckIcon size={11} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-label font-medium text-fg">{tr(o.name)}</span>
                  {o.note && <span className="block text-caption text-fg-muted">{tr(o.note)}</span>}
                </span>
              </label>
            </li>);

        })}
      </ul>
      {!current &&
      <p className="mt-2 text-caption text-fg-muted" role="status">
          {tr('Custom settings — none of the looks match exactly. Picking one changes only the layout, never your words.')}
        </p>
      }
    </fieldset>);

}