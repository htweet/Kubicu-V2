import React from 'react';
import { FolderPlusIcon, ImagesIcon, InboxIcon } from 'lucide-react';
import type { MediaFolder } from '../../types/media';
import { MediaFolderIcon } from './MediaFolderIcon';
import { cn } from '../../utils/cn';

export const ALL_MEDIA = '__all';
export const UNFILED_MEDIA = '__none';

interface MediaFolderRailProps {
  folders: MediaFolder[];
  counts: Map<string, number>;
  total: number;
  unfiled: number;
  value: string;
  onChange: (id: string) => void;
  onNewFolder: () => void;
  canManage: boolean;
}

/** Folder navigation: everything, the default folders, your own folders, then loose images. A row of chips on phones. */
export function MediaFolderRail({ folders, counts, total, unfiled, value, onChange, onNewFolder, canManage }: MediaFolderRailProps) {
  const system = folders.filter((f) => f.system);
  const own = folders.filter((f) => !f.system);

  const item = (id: string, label: string, count: number, icon: React.ReactNode) => {
    const on = value === id;
    return (
      <li key={id} className="shrink-0 lg:shrink">
        <button
          type="button"
          aria-current={on ? 'true' : undefined}
          onClick={() => onChange(id)}
          className={cn(
            'flex h-10 w-full items-center gap-2 whitespace-nowrap rounded-md px-2.5 text-left text-label transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            'border lg:border-0',
            on ? 'border-line-strong bg-sunken font-semibold text-fg' : 'border-line text-fg-muted hover:bg-sunken hover:text-fg',
          )}
        >
          {icon}
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span className="pl-1 text-caption tabular-nums text-fg-subtle">{count}</span>
        </button>
      </li>
    );
  };

  const heading = (text: string) => <p className="hidden px-2.5 pb-1 pt-4 text-caption font-semibold text-fg-subtle lg:block">{text}</p>;

  return (
    <nav aria-label="Media folders" className="lg:w-56 lg:shrink-0">
      <ul className="scroll-quiet flex gap-2 overflow-x-auto overflow-y-hidden pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {item(ALL_MEDIA, 'All images', total, <span className="flex h-6 w-6 shrink-0 items-center justify-center text-fg-subtle" aria-hidden><ImagesIcon size={15} /></span>)}
        <li className="contents">{heading('Default folders')}</li>
        {system.map((f) => item(f.id, f.name, counts.get(f.id) ?? 0, <MediaFolderIcon folder={f} />))}
        <li className="contents">{heading('Your folders')}</li>
        {own.map((f) => item(f.id, f.name, counts.get(f.id) ?? 0, <MediaFolderIcon folder={f} open={value === f.id} />))}
        {canManage && (
          <li className="shrink-0 lg:shrink">
            <button
              type="button"
              onClick={onNewFolder}
              className="flex h-10 w-full items-center gap-2 whitespace-nowrap rounded-md border border-dashed border-line-strong px-2.5 text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:border-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
                <FolderPlusIcon size={15} />
              </span>
              New folder
            </button>
          </li>
        )}
        <li className="hidden lg:block lg:pt-3">
          <span className="block border-t border-line" aria-hidden />
        </li>
        {item(UNFILED_MEDIA, 'Not in a folder', unfiled, <span className="flex h-6 w-6 shrink-0 items-center justify-center text-fg-subtle" aria-hidden><InboxIcon size={15} /></span>)}
      </ul>
    </nav>
  );
}
