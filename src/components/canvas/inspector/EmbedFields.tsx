import React, { useState } from 'react';
import { CheckCircle2Icon, ChevronDownIcon, ShieldCheckIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { TextInput } from '../../ui/TextInput';
import { Switch } from '../../ui/Switch';
import { cn } from '../../../utils/cn';
import { EMBED_PROVIDERS, parseEmbed, providerMeta } from '../../../utils/embeds';

const CHECKLIST = [
'Every spoken word is in the captions, including names and Pidgin or local-language lines.',
'Important sounds are described, like [music] or [phone rings].',
'Captions appear in time with the speech and stay on screen long enough to read.',
'Text in the video (prices, phone numbers) is also said out loud or written on the page.'];


const kindLine = {
  video: '{site} video — shown in a locked-down frame',
  audio: '{site} player — shown in a locked-down frame',
  map: '{site} map — shown in a locked-down frame',
  scheduler: '{site} booking calendar — shown in a locked-down frame'
} as const;

/** Inspector for the Video & embed block (D142): safe-list link, title, and captions confirmation. Site names stay as they are. */
export function EmbedFields({ block, error }: {block: BlockOf<'video'>;error?: string;}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const c = block.content;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'video', patch, f);
  const [showSites, setShowSites] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const r = c.url.trim() ? parseEmbed(c.url) : null;
  const embed = r && r.ok ? r : null;
  const meta = embed ? providerMeta(embed.provider) : null;
  const titleLabel = embed?.kind === 'map' ? tr('Map title') : embed?.kind === 'scheduler' ? tr('Calendar title') : embed?.kind === 'audio' ? tr('Audio title') : tr('Video title');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <TextInput
          id={`${block.id}-url`}
          label={tr('Link')}
          type="url"
          inputMode="url"
          placeholder="https://youtube.com/watch?v=…"
          value={c.url}
          error={error}
          onChange={(e) => set({ url: e.target.value }, 'url')} />
        
        {embed ?
        <p className="mt-1.5 flex items-center gap-1.5 text-caption text-success">
            <ShieldCheckIcon size={13} aria-hidden />
            {tr(kindLine[embed.kind as keyof typeof kindLine] ?? kindLine.scheduler, { site: embed.name })}
          </p> :

        !error && <p className="mt-1.5 text-caption text-fg-subtle">{tr('Paste the link from the site’s Share button. Only sites on the safe list can be embedded.')}</p>
        }
        <button
          type="button"
          aria-expanded={showSites}
          aria-controls={`${block.id}-sites`}
          onClick={() => setShowSites((v) => !v)}
          className="mt-2 inline-flex min-h-[32px] items-center gap-1 text-caption font-medium text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          {tr('Which sites can I embed?')}
          <ChevronDownIcon size={13} className={cn('transition-transform duration-150 ease-out', showSites && 'rotate-180')} aria-hidden />
        </button>
        {showSites &&
        <ul id={`${block.id}-sites`} className="mt-1 grid grid-cols-1 gap-y-1.5 rounded-md border border-line bg-sunken p-3 text-caption sm:grid-cols-2 sm:gap-x-4">
            {EMBED_PROVIDERS.map((p) =>
          <li key={p.id} className="min-w-0">
                <span className="font-medium text-fg">{p.name}</span>
                <span className="block truncate text-fg-subtle">{p.example}</span>
              </li>
          )}
          </ul>
        }
      </div>

      <TextInput
        id={`${block.id}-title`}
        label={titleLabel}
        value={c.title}
        hint={tr('Read out by screen readers, so say what it is — e.g. “How to tie a gele”.')}
        onChange={(e) => set({ title: e.target.value }, 'title')} />
      

      {embed?.kind === 'video' && meta &&
      <div className="flex flex-col gap-3 border-t border-line pt-4">
          <Switch
          id={`${block.id}-captioned`}
          label={tr('This video has captions')}
          description={tr('Tick once you’ve checked them. We can’t read captions from other sites, so this is your confirmation.')}
          checked={!!c.captioned}
          onChange={(on) => set({ captioned: on }, 'captioned')} />
        
          {!c.captioned &&
        <p className="rounded-md bg-sunken p-3 text-caption text-fg-muted">
              <span className="font-medium text-fg">{tr('On {site}:', { site: meta.name })} </span>
              {tr(meta.captionsHow)}
            </p>
        }
          <button
          type="button"
          aria-expanded={showChecklist}
          aria-controls={`${block.id}-checklist`}
          onClick={() => setShowChecklist((v) => !v)}
          className="inline-flex min-h-[32px] items-center gap-1 self-start text-caption font-medium text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
            {tr('Good captions checklist')}
            <ChevronDownIcon size={13} className={cn('transition-transform duration-150 ease-out', showChecklist && 'rotate-180')} aria-hidden />
          </button>
          {showChecklist &&
        <ul id={`${block.id}-checklist`} className="flex flex-col gap-2">
              {CHECKLIST.map((item) =>
          <li key={item} className="flex items-start gap-2 text-caption text-fg-muted">
                  <CheckCircle2Icon size={14} className="mt-px shrink-0 text-fg-subtle" aria-hidden />
                  {tr(item)}
                </li>
          )}
              <li>
                <a href="/help#video-captions" target="_blank" rel="noreferrer" className="text-caption font-medium text-action underline-offset-2 hover:underline">
                  {tr('Read the captions guide')}<span className="sr-only"> ({tr('opens in a new tab')})</span>
                </a>
              </li>
            </ul>
        }
        </div>
      }
    </div>);

}