import React from 'react';
import { PlusIcon, StarIcon } from 'lucide-react';
import type { BlockType, PageTheme } from '../../types/page';
import { blockDefinitions } from '../../data/blockRegistry';
import { BlockMiniPreview } from './BlockMiniPreview';
import { BlockStatusChip, type BlockStatus } from './BlockStatusChip';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface BlockCardProps {
  type: BlockType;
  theme: PageTheme;
  status: BlockStatus;
  favourite: boolean;
  touch?: boolean;
  /** Small line under the name, e.g. a suggestion's reason. */
  note?: string;
  onOpen: () => void;
  onAdd: () => void;
  onToggleFavourite: () => void;
}

/** One block in the picker (D166): a real mini preview, the name, a status, a quick add and a favourite star. */
export function BlockCard({ type, theme, status, favourite, touch, note, onOpen, onAdd, onToggleFavourite }: BlockCardProps) {
  const { t: tr } = useT();
  const def = blockDefinitions[type];
  const name = tr(def.name);
  const Icon = def.icon;
  const canAdd = status !== 'app' && status !== 'planned';
  return (
    <li className="group relative flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-raised transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-1">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus" aria-label={tr('{name} — details', { name })}>
        <span className="block overflow-hidden border-b border-line">
          <PreviewBox type={type} theme={theme} touch={touch} />
        </span>
        <span className="flex min-w-0 flex-col gap-1 px-2.5 pb-2.5 pt-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon size={13} className="shrink-0 text-fg-subtle" aria-hidden />
            <span className="truncate text-label font-medium text-fg">{name}</span>
          </span>
          {note ? <span className="line-clamp-2 text-[11.5px] leading-snug text-fg-muted">{note}</span> : status !== 'available' && <BlockStatusChip status={status} />}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggleFavourite}
        aria-pressed={favourite}
        aria-label={favourite ? tr('Remove {name} from favourites', { name }) : tr('Add {name} to favourites', { name })}
        className={cn(
          'absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-overlay/90 shadow-1 transition-opacity duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          favourite ? 'text-warning opacity-100' : 'text-fg-subtle opacity-0 group-hover:opacity-100',
          touch && 'opacity-100',
        )}
      >
        <StarIcon size={13} fill={favourite ? 'currentColor' : 'none'} aria-hidden />
      </button>
      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={tr('Add {name}', { name })}
          className={cn(
            'absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-action text-action-fg shadow-1 transition-opacity duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            touch ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          <PlusIcon size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}

function PreviewBox({ type, theme, touch }: { type: BlockType; theme: PageTheme; touch?: boolean }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [w, setW] = React.useState(140);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(80, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} className="block w-full">
      <BlockMiniPreview type={type} theme={theme} width={w} height={touch ? 104 : 88} />
    </span>
  );
}
