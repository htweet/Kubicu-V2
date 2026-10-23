import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Kbd } from '../ui/Kbd';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl';

const groups: {title: string;items: {keys: string[];label: string;}[];}[] = [
{
  title: 'Editing',
  items: [
  { keys: [mod, 'Z'], label: 'Undo' },
  { keys: [mod, 'Shift', 'Z'], label: 'Redo' },
  { keys: [mod, 'D'], label: 'Duplicate the selected block' },
  { keys: ['Delete'], label: 'Delete the selected block (when it has focus)' },
  { keys: ['Esc'], label: 'Deselect, or close a panel or dialog' }]

},
{
  title: 'Moving around',
  items: [
  { keys: ['Tab'], label: 'Move between blocks and controls' },
  { keys: ['Enter'], label: 'Select the focused block' },
  { keys: ['Alt', '↑'], label: 'Move the focused layer up' },
  { keys: ['Alt', '↓'], label: 'Move the focused layer down' }]

},
{
  title: 'Workspace',
  items: [
  { keys: [mod, 'K'], label: 'Open the command menu' },
  { keys: [mod, '\\'], label: 'Hide or show both side panels' },
  { keys: [mod, '/'], label: 'Show these shortcuts' }]

}];


/** Every canvas shortcut in one place (D76). None uses a single character key on its own. */
export function ShortcutsDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts" description="Every action also has a button, so none of these is required.">
      <div className="flex flex-col gap-5 pb-2">
        {groups.map((g) =>
        <section key={g.title} aria-labelledby={`sc-${g.title}`}>
            <h3 id={`sc-${g.title}`} className="text-label font-semibold text-fg">
              {g.title}
            </h3>
            <dl className="mt-2 divide-y divide-line border-y border-line">
              {g.items.map((it) =>
            <div key={it.label} className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-label text-fg-muted">{it.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1">
                    {it.keys.map((k) =>
                <Kbd key={k}>{k}</Kbd>
                )}
                  </dd>
                </div>
            )}
            </dl>
          </section>
        )}
      </div>
    </Dialog>);

}