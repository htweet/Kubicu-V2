import React, { useState } from 'react';
import { toast } from 'sonner';
import { BookmarkPlusIcon, CheckIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useLibrary } from '../../../contexts/LibraryContext';
import { fontPairs } from '../../../data/pageThemes';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { TextInput } from '../../ui/TextInput';
import { cn } from '../../../utils/cn';

/** Workspace themes: save the current look once, reuse it on any page. */
export function SavedThemes() {
  const { state, actions } = useEditor();
  const library = useLibrary();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const current = state.draft.theme;
  const alreadySaved = current.presetId.startsWith('saved:');

  const save = () => {
    const saved = library.saveTheme(name, current);
    actions.applyThemePreset(saved.theme);
    toast(`Saved “${saved.name}”`, { description: 'Available on every page in this workspace.' });
    setOpen(false);
  };

  const remove = (id: string, label: string) => {
    const removed = library.deleteTheme(id);
    toast(`Deleted “${label}”`, {
      description: 'Pages using it keep their colours.',
      action: removed ? { label: 'Undo', onClick: () => library.restoreTheme(removed) } : undefined
    });
  };

  return (
    <section aria-labelledby="saved-themes" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 id="saved-themes" className="text-label font-medium text-fg">
          Your themes
        </h3>
        <Button
          size="sm"
          variant="tertiary"
          leadingIcon={BookmarkPlusIcon}
          disabled={alreadySaved}
          title={alreadySaved ? 'This theme is already saved' : undefined}
          onClick={() => {
            setName('');
            setOpen(true);
          }}>
          
          Save current
        </Button>
      </div>
      {library.themes.length === 0 ?
      <p className="text-caption text-fg-subtle">Save your colours, fonts and button style to reuse them on other pages.</p> :

      <ul className="grid grid-cols-3 gap-2">
          {library.themes.map((t) =>
        <li key={t.id} className="group relative">
              <ThemeSwatch name={t.name} theme={t.theme} active={current.presetId === t.theme.presetId} onClick={() => actions.applyThemePreset(t.theme)} />
              <button
            type="button"
            onClick={() => remove(t.id, t.name)}
            aria-label={`Delete theme ${t.name}`}
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-overlay text-fg-subtle opacity-0 shadow-1 transition-opacity duration-150 hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus group-hover:opacity-100">
            
                <XIcon size={12} aria-hidden />
              </button>
            </li>
        )}
        </ul>
      }

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Save theme"
        description="Colours, fonts and button style are saved together."
        footer={
        <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!name.trim()}>
              Save theme
            </Button>
          </>
        }>
        
        <form
          className="pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) save();
          }}>
          
          <TextInput id="theme-name" label="Theme name" value={name} maxLength={32} placeholder="e.g. Harmattan campaign" onChange={(e) => setName(e.target.value)} />
        </form>
      </Dialog>
    </section>);

}

export function ThemeSwatch({ name, theme, active, onClick }: {name: string;theme: PageTheme;active: boolean;onClick: () => void;}) {
  const display = fontPairs.find((f) => f.id === theme.fontPair)?.display;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-md border text-left transition-[border-color] duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        active ? 'border-select ring-1 ring-select' : 'border-line hover:border-line-strong'
      )}>
      
      <span className="flex h-14 flex-col justify-between p-2" style={{ background: theme.background }}>
        <span className="text-[15px] leading-none" style={{ fontFamily: display, color: theme.text }}>
          Aa
        </span>
        <span className="h-2 w-full rounded-full" style={{ background: theme.accent }} />
      </span>
      <span className="flex items-center justify-between gap-1 bg-raised px-2 py-1.5 text-caption text-fg">
        <span className="truncate">{name}</span>
        {active && <CheckIcon size={12} className="shrink-0 text-select" aria-hidden />}
      </span>
    </button>);

}