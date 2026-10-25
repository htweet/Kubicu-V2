import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon } from 'lucide-react';
import type { BlockType, PageTheme } from '../../types/page';
import { blockDefinitions } from '../../data/blockRegistry';
import { blockNeeds, blockVariants, libraryCategories, libraryCategoryOf } from '../../data/blockTaxonomy';
import { plans } from '../../data/plans';
import { Button } from '../ui/Button';
import { BlockMiniPreview } from './BlockMiniPreview';
import { BlockStatusChip, type BlockStatus } from './BlockStatusChip';

interface BlockDetailsProps {
  type: BlockType;
  theme: PageTheme;
  status: BlockStatus;
  favourite: boolean;
  placement: string;
  touch?: boolean;
  onBack: () => void;
  onAdd: () => void;
  onToggleFavourite: () => void;
}

/** The step before adding (D166): a larger preview, what the block needs, its looks, and where it lands. */
export function BlockDetails({ type, theme, status, favourite, placement, touch, onBack, onAdd, onToggleFavourite }: BlockDetailsProps) {
  const def = blockDefinitions[type];
  const cat = libraryCategories.find((c) => c.id === libraryCategoryOf(type));
  const needs = blockNeeds(type);
  const variants = blockVariants[type];
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(260);
  React.useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="tertiary" leadingIcon={ArrowLeftIcon} onClick={onBack}>
          All blocks
        </Button>
        <button
          type="button"
          onClick={onToggleFavourite}
          aria-pressed={favourite}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-caption text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          <StarIcon size={14} className={favourite ? 'text-warning' : ''} fill={favourite ? 'currentColor' : 'none'} aria-hidden />
          {favourite ? 'Favourite' : 'Add to favourites'}
        </button>
      </div>

      <div>
        <p className="text-caption text-fg-subtle">{cat?.label}</p>
        <h3 className="mt-0.5 text-heading font-semibold text-fg">{def.name}</h3>
        <p className="mt-1 text-label text-fg-muted">{def.description}</p>
        {status !== 'available' &&
        <div className="mt-2">
            <BlockStatusChip status={status} />
          </div>
        }
      </div>

      <div ref={previewRef} className="overflow-hidden rounded-md border border-line">
        <BlockMiniPreview type={type} theme={theme} width={w} height={touch ? 260 : 220} />
      </div>

      {(needs.length > 0 || def.minPlan || def.requiresApp) &&
      <section aria-labelledby="bd-needs">
          <h4 id="bd-needs" className="text-caption font-semibold text-fg">What it needs</h4>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-caption text-fg-muted">
            {needs.map((n) =>
          <li key={n}>{n}</li>
          )}
            {def.minPlan && <li>Full block on {plans[def.minPlan].name} and above; a limited version shows on lower plans.</li>}
            {def.requiresApp && status === 'app' &&
          <li>
                Install the app first.{' '}
                <Link to={`/app/extensions?ext=${def.requiresApp}`} className="font-semibold text-fg underline underline-offset-2">
                  Open Extensions
                </Link>
              </li>
          }
          </ul>
        </section>
      }

      {variants &&
      <section aria-labelledby="bd-looks">
          <h4 id="bd-looks" className="text-caption font-semibold text-fg">Looks</h4>
          <p className="mt-1 text-caption text-fg-muted">{variants.join(' · ')} — change any time in Style.</p>
        </section>
      }

      <div className="sticky bottom-0 -mx-4 mt-1 flex flex-col gap-1.5 border-t border-line bg-raised px-4 pb-1 pt-3">
        <Button onClick={onAdd} disabled={status === 'app' || status === 'planned'} className={touch ? 'h-12' : undefined}>
          Add {def.name.toLowerCase()}
        </Button>
        <p className="text-center text-caption text-fg-subtle">{placement}</p>
        {touch &&
        <Button variant="secondary" onClick={onBack} className="h-12">
            Cancel
          </Button>
        }
      </div>
    </div>);

}