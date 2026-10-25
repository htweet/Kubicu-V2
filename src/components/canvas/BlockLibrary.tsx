import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRightIcon, LayoutGridIcon, LayoutTemplateIcon, ListIcon, SearchIcon, SearchXIcon, XIcon } from 'lucide-react';
import { sectionPresets } from '../../data/sectionPresets';
import { SectionPresetList } from './SectionPresetList';
import type { BlockType } from '../../types/page';
import { blockDefinitions, blockOrder, plannedBlocks } from '../../data/blockRegistry';
import { blockSearchText, libraryCategories, libraryCategoryOf, type LibraryCategoryId } from '../../data/blockTaxonomy';
import { useEditor } from '../../contexts/EditorContext';
import { blockName, layerName } from '../../utils/blocks';
import { MAX_CHILDREN, childrenOf, placementFor } from '../../utils/containers';
import { suggestBlocks } from '../../utils/blockSuggestions';
import { useBlockShelf } from '../../hooks/useBlockShelf';
import { EmptyState } from '../ui/EmptyState';
import { fieldControlClass } from '../ui/Field';
import { PlanLock } from '../ui/PlanLock';
import { cn } from '../../utils/cn';
import { SavedSectionsList } from './SavedSectionsList';
import { BlockCard } from './BlockCard';
import { BlockRow } from './BlockRow';
import { LookRow } from './LookRow';
import { blockCatalog, catalogLooks, type BlockPreset } from '../../data/blockCatalog';
import { BlockDetails } from './BlockDetails';
import type { BlockStatus } from './BlockStatusChip';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast } from '../../data/plans';
import { useMarketplace } from '../../contexts/MarketplaceContext';

interface BlockLibraryProps {
  onAdded?: (id: string) => void;
  touch?: boolean;
}

type Filter = 'all' | 'sections' | LibraryCategoryId;

/**
 * The block picker (D166): search with everyday synonyms, 13 categories, suggested / favourites / recent,
 * real mini previews in the page's theme, and a details step before adding. Same component on phones (`touch`).
 */
export function BlockLibrary({ onAdded, touch }: BlockLibraryProps) {
  const { state, actions } = useEditor();
  const plan = usePlan();
  const market = useMarketplace();
  const shelf = useBlockShelf();
  const theme = state.draft.theme;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<BlockType | null>(null);
  const q = query.trim().toLowerCase();
  const selected = state.draft.blocks.find((b) => b.id === state.selectedId);
  // Containers (D167): with a container (or a block in one) selected, new blocks go inside while there's room.
  const inside = placementFor(state.draft.blocks, state.selectedId, 'text').container;
  const placement = inside ?
  `Adds inside “${layerName(inside)}” · ${childrenOf(state.draft.blocks, inside.id).length} of ${MAX_CHILDREN} used` :
  selected ?
  `Adds below “${layerName(selected)}”` :
  'Adds to the end of your page';

  const statusOf = (type: BlockType): BlockStatus => {
    const def = blockDefinitions[type];
    if (def.requiresApp && !market.isActive(def.requiresApp)) return 'app';
    if (def.minPlan && !planAtLeast(plan.id, def.minPlan)) return 'plan';
    return 'available';
  };

  const matches = useMemo(() => blockOrder.filter((type) => (!q || blockSearchText(type).includes(q)) && (filter === 'all' || libraryCategoryOf(type) === filter)), [q, filter]);
  const plannedMatches = plannedBlocks.filter((p) => (!q || `${p.name} ${p.description}`.toLowerCase().includes(q)) && (filter === 'all' || filter === 'smart'));
  const suggestions = useMemo(
    () => suggestBlocks(state.draft.blocks, { bookingsActive: market.isActive('bookings') }, shelf.dismissed).filter((s) => statusOf(s.type) !== 'app'),
    // statusOf reads plan/market, both in deps via market
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.draft.blocks, market, shelf.dismissed]
  );

  const add = (type: BlockType, preset?: BlockPreset) => {
    if (statusOf(type) === 'app') return;
    // Compatibility (D174): say so when the selected container can't hold this block.
    const where = placementFor(state.draft.blocks, state.selectedId, type);
    const id = actions.addBlock(type, undefined, undefined, preset);
    if (where.blocked) toast(`${blockDefinitions[type].name} added below ${blockName(where.blocked.container)}`, { description: where.blocked.reason });
    shelf.used(type);
    setDetail(null);
    onAdded?.(id);
  };
  // Ready-made looks (D171): every idea in the brief that is a setup of an existing block.
  const lookMatches = useMemo(
    () => catalogLooks.filter((e) => e.type && (filter === 'all' || e.category === filter) && (!q || `${e.name} ${e.note ?? ''} ${blockSearchText(e.type)}`.toLowerCase().includes(q))),
    [q, filter]
  );
  const howtos = blockCatalog.filter((e) => e.kind === 'howto' && (filter === 'all' || e.category === filter) && (!q || `${e.name} ${e.note}`.toLowerCase().includes(q)));

  const listView = shelf.view === 'list';
  const card = (type: BlockType, note?: string, key?: string) =>
  listView ?
  <BlockRow
    key={key ?? type}
    type={type}
    status={statusOf(type)}
    favourite={shelf.favourites.includes(type)}
    touch={touch}
    note={note}
    onOpen={() => setDetail(type)}
    onAdd={() => add(type)}
    onToggleFavourite={() => shelf.toggleFavourite(type)} /> :


  <BlockCard
    key={key ?? type}
    type={type}
    theme={theme}
    status={statusOf(type)}
    favourite={shelf.favourites.includes(type)}
    touch={touch}
    note={note}
    onOpen={() => setDetail(type)}
    onAdd={() => add(type)}
    onToggleFavourite={() => shelf.toggleFavourite(type)} />;


  const grid = listView ? 'flex flex-col gap-0.5' : 'grid grid-cols-2 gap-2.5';

  if (detail) {
    return (
      <BlockDetails
        type={detail}
        theme={theme}
        status={statusOf(detail)}
        favourite={shelf.favourites.includes(detail)}
        placement={placement}
        touch={touch}
        onBack={() => setDetail(null)}
        onAdd={() => add(detail)}
        onToggleFavourite={() => shelf.toggleFavourite(detail)} />);


  }

  const browsing = !q && filter === 'all';
  const sectionMatchCount = q ? sectionPresets.filter((p) => `${p.name} ${p.description} ${p.shape} ${p.group} section`.toLowerCase().includes(q)).length : 0;
  const favourites = shelf.favourites.filter((t) => blockOrder.includes(t));
  const recent = shelf.recent.filter((t) => blockOrder.includes(t) && !favourites.includes(t)).slice(0, 4);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col gap-2.5 bg-raised px-4 pb-3 pt-4">
        <label htmlFor="block-search" className="sr-only">
          Search blocks
        </label>
        <div className="relative">
          <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            id="block-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — try “photo”, “appointment”, “shop”"
            className={cn(fieldControlClass, 'pl-9 text-label', touch ? 'h-11' : 'h-9')} />
          
        </div>
        {/* Horizontal-only strip (no vertical scroll): category chips. */}
        <div className="scroll-quiet -mx-4 flex gap-1.5 overflow-x-auto overflow-y-hidden px-4 pb-0.5" role="group" aria-label="Block categories">
          {([{ id: 'all', label: 'All', icon: null }, { id: 'sections', label: 'Sections', icon: LayoutTemplateIcon }, ...libraryCategories] as {id: Filter;label: string;icon: typeof SearchIcon | null;}[]).map((c) => {
            const Icon = c.icon;
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(c.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-caption font-medium transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  touch ? 'h-9' : 'h-7',
                  active ? 'border-transparent bg-inverse text-fg-inverse' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                )}>
                
                {Icon && <Icon size={12} aria-hidden />}
                {c.label}
              </button>);

          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-caption text-fg-subtle">{placement}</p>
          {/* List (compact) or grid (previews) — remembered on this device. */}
          <div role="group" aria-label="Block view" className="flex shrink-0 rounded-md border border-line p-0.5">
            {([
            { v: 'list', icon: ListIcon, label: 'List view' },
            { v: 'grid', icon: LayoutGridIcon, label: 'Grid view with previews' }] as
            const).map(({ v, icon: Icon, label }) =>
            <button
              key={v}
              type="button"
              aria-pressed={shelf.view === v}
              aria-label={label}
              title={label}
              onClick={() => shelf.setView(v)}
              className={cn(
                'flex items-center justify-center rounded-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                touch ? 'h-9 w-9' : 'h-6 w-7',
                shelf.view === v ? 'bg-sunken text-fg' : 'text-fg-subtle hover:text-fg'
              )}>
              
                <Icon size={14} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      {browsing &&
      <p className="px-4 pb-1 text-[11.5px] text-fg-subtle">
          {blockOrder.length} blocks and {catalogLooks.length} ready-made looks — all {blockCatalog.length} ideas in the block catalogue.
        </p>
      }
      {filter === 'sections' ?
      <div className="flex flex-col gap-6 px-3 pb-6">
          <SavedSectionsList query={query} touch={touch} onInserted={() => onAdded?.(state.selectedId ?? '')} />
          <Shelf title="Ready-made sections" hint="Real blocks you can edit. Anything marked [Add …] must be replaced before publishing.">
            <SectionPresetList query={query} touch={touch} onInserted={() => onAdded?.(state.selectedId ?? '')} />
          </Shelf>
        </div> :
      matches.length === 0 && plannedMatches.length === 0 && lookMatches.length === 0 && !(q && sectionMatchCount > 0) ?
      <EmptyState icon={SearchXIcon} title="No blocks found" description={`Nothing matches “${query}”. Try “button”, “photo”, “form” or pick a category.`} /> :

      <div className="flex flex-col gap-6 px-3 pb-6">
          {browsing &&
        <button
          type="button"
          onClick={() => setFilter('sections')}
          className="flex items-center gap-3 rounded-md border border-line bg-canvas px-3 py-3 text-left transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
              <LayoutTemplateIcon size={18} className="shrink-0 text-action" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-label font-semibold text-fg">{sectionPresets.length} ready-made sections</span>
                <span className="block text-caption text-fg-subtle">Hero + portfolio, menu + ordering, schedule + speakers and more</span>
              </span>
              <ChevronRightIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
            </button>
        }
          {q && sectionMatchCount > 0 &&
        <Shelf title="Ready-made sections">
              <SectionPresetList query={query} touch={touch} onInserted={() => onAdded?.(state.selectedId ?? '')} />
            </Shelf>
        }
          {browsing && suggestions.length > 0 &&
        <Shelf title="Suggested" hint="Simple rules based on what's on your page">
              <ul className={grid}>
                {suggestions.map((s) => card(s.type, s.reason, s.id))}
              </ul>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {suggestions.map((s) =>
            <button key={s.id} type="button" onClick={() => shelf.dismiss(s.id)} className="inline-flex items-center gap-1 text-caption text-fg-subtle hover:text-fg">
                    <XIcon size={11} aria-hidden /> Don’t suggest {blockDefinitions[s.type].name.toLowerCase()}
                  </button>
            )}
              </div>
            </Shelf>
        }
          {browsing && favourites.length > 0 &&
        <Shelf title="Favourites">
              <ul className={grid}>{favourites.map((t) => card(t))}</ul>
            </Shelf>
        }
          {browsing && recent.length > 0 &&
        <Shelf title="Recently used">
              <ul className={grid}>{recent.map((t) => card(t))}</ul>
            </Shelf>
        }
          {(browsing || q) && <SavedSectionsList query={query} touch={touch} onInserted={() => onAdded?.(state.selectedId ?? '')} />}

          {libraryCategories.map((c) => {
          const items = matches.filter((t) => libraryCategoryOf(t) === c.id);
          const looks = lookMatches.filter((e) => e.category === c.id);
          const tips = howtos.filter((e) => e.category === c.id);
          if (items.length === 0 && looks.length === 0 && tips.length === 0) return null;
          return (
            <Shelf key={c.id} title={c.label} hint={filter === c.id ? c.description : undefined}>
                {items.length > 0 && <ul className={grid}>{items.map((t) => card(t))}</ul>}
                {looks.length > 0 &&
              <div className={items.length ? 'mt-3' : undefined}>
                    <p className="mb-1 px-1 text-[11.5px] font-medium text-fg-subtle">Ready-made looks</p>
                    <ul className="flex flex-col gap-0.5">
                      {looks.map((e) =>
                  <LookRow key={e.n} entry={e} status={statusOf(e.type as BlockType)} touch={touch} onAdd={() => add(e.type as BlockType, e.preset?.())} />
                  )}
                    </ul>
                  </div>
              }
                {tips.map((e) =>
              <p key={e.n} className="mt-2 rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">
                    <span className="font-semibold text-fg">{e.name}:</span> {e.note}
                  </p>
              )}
              </Shelf>);

        })}

          {plannedMatches.length > 0 &&
        <Shelf title="Planned" hint="Shown so you know they're coming — they can't be added yet">
              <ul className="flex flex-col gap-1.5">
                {plannedMatches.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-md border border-dashed border-line-strong px-2.5 py-2" aria-disabled="true">
                      <Icon size={15} className="shrink-0 text-fg-subtle" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-label font-medium text-fg-muted">{p.name}</span>
                        <span className="block text-caption text-fg-subtle">{p.description}</span>
                        <PlanLock kind={p.availability}>{p.note}</PlanLock>
                      </span>
                    </li>);

            })}
              </ul>
            </Shelf>
        }

          {!market.isActive('bookings') && browsing &&
        <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
              Want customers to book a time? The Booking block comes with the free Bookings app.{' '}
              <Link to="/app/extensions?ext=bookings" className="font-semibold text-fg underline-offset-2 hover:underline">
                Get Bookings
              </Link>
            </p>
        }
        </div>
      }
    </div>);

}

function Shelf({ title, hint, children }: {title: string;hint?: string;children: React.ReactNode;}) {
  const id = `shelf-${title.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <section aria-labelledby={id}>
      <div className="mb-2 px-1">
        <h3 id={id} className="text-caption font-semibold text-fg">
          {title}
        </h3>
        {hint && <p className="text-[11.5px] text-fg-subtle">{hint}</p>}
      </div>
      {children}
    </section>);

}