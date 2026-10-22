import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, DownloadIcon, PaletteIcon, Share2Icon, SquareStackIcon } from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { readShared, shareLibraryItem } from '../../utils/marketplace';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Dialog } from '../ui/Dialog';

/** Share saved themes and sections privately with another workspace, or import a share code (blueprint §21). */
export function SharedLibrary() {
  const lib = useLibrary();
  const { current } = useWorkspace();
  const canEdit = useTeam().can('pages.edit').allowed;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [shared, setShared] = useState<{name: string;code: string;} | null>(null);
  const items = [...lib.themes.map((t) => ({ kind: 'theme' as const, id: t.id, name: t.name })), ...lib.sections.map((s) => ({ kind: 'section' as const, id: s.id, name: s.name }))];

  const share = (kind: 'theme' | 'section', id: string) => {
    try {
      if (kind === 'theme') {
        const t = lib.themes.find((x) => x.id === id)!;
        setShared({ name: t.name, code: shareLibraryItem({ kind, name: t.name, theme: t.theme, fromWorkspace: current.name }) });
      } else {
        const s = lib.sections.find((x) => x.id === id)!;
        setShared({ name: s.name, code: shareLibraryItem({ kind, name: s.name, blocks: s.blocks, fromWorkspace: current.name }) });
      }
    } catch {
      toast.error('Couldn’t create a share code', { description: 'Browser storage is full.' });
    }
  };

  const importCode = () => {
    const item = readShared(code);
    if (!item) {
      setError('No template matches that code. Check it and try again.');
      return;
    }
    if (item.kind === 'theme' && item.theme) lib.saveTheme(item.name, item.theme);
    if (item.kind === 'section' && item.blocks) lib.saveSection(item.name, item.blocks);
    setCode('');
    setError(undefined);
    toast.success(`Added “${item.name}” from ${item.fromWorkspace}`, { description: item.kind === 'theme' ? 'Find it in the canvas → Theme → Saved themes.' : 'Find it in the canvas → Blocks → Saved sections.' });
  };

  return (
    <section aria-labelledby="shared-lib" className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <h2 id="shared-lib" className="text-label font-semibold text-fg">
          Your saved themes and sections
        </h2>
        <p className="mt-1 text-caption text-fg-muted">Share one privately with another workspace — they get a copy; yours doesn’t change.</p>
        {items.length === 0 ?
        <p className="mt-3 rounded-lg border border-dashed border-line-strong px-4 py-5 text-caption text-fg-muted">Save a theme or a group of blocks in the canvas and it appears here.</p> :

        <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-raised">
            {items.map((i) =>
          <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                {i.kind === 'theme' ? <PaletteIcon size={16} className="text-fg-subtle" aria-hidden /> : <SquareStackIcon size={16} className="text-fg-subtle" aria-hidden />}
                <span className="min-w-0 flex-1 truncate text-label text-fg">{i.name}</span>
                <span className="text-caption text-fg-subtle">{i.kind === 'theme' ? 'Theme' : 'Section'}</span>
                <Button size="sm" variant="tertiary" leadingIcon={Share2Icon} disabled={!canEdit} onClick={() => share(i.kind, i.id)}>
                  Share
                </Button>
              </li>
          )}
          </ul>
        }
      </div>
      <form
        className="flex flex-col gap-3 self-start rounded-lg border border-line bg-raised p-5"
        onSubmit={(e) => {
          e.preventDefault();
          importCode();
        }}>
        
        <h3 className="text-label font-semibold text-fg">Have a share code?</h3>
        <TextInput id="share-code" label="Share code" placeholder="KUB-XXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} error={error} hint="Someone shared a theme or section with you." />
        <Button type="submit" variant="secondary" leadingIcon={DownloadIcon} disabled={!canEdit || !code.trim()} className="self-start">
          Add to my library
        </Button>
      </form>
      <Dialog
        open={!!shared}
        onClose={() => setShared(null)}
        title={shared ? `Share “${shared.name}”` : ''}
        description="Send this code to the other workspace’s owner. In this prototype codes work between workspaces on this device."
        footer={
        <Button
          leadingIcon={CopyIcon}
          onClick={() => {
            if (shared) void navigator.clipboard?.writeText(shared.code).then(() => toast.success('Code copied'), () => toast.error('Couldn’t copy — select the code instead.'));
          }}>
          
            Copy code
          </Button>
        }>
        
        <p className="select-all rounded-md bg-sunken px-4 py-3 text-center font-mono text-heading font-semibold tracking-wider text-fg">{shared?.code}</p>
      </Dialog>
    </section>);

}