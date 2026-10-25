import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BadgeCheckIcon, LayoutTemplateIcon, LockIcon, PaletteIcon, SearchIcon, StarIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { TemplateThumb } from '../components/templates/TemplateThumb';
import { TemplatePreviewSheet } from '../components/templates/TemplatePreviewSheet';
import { BuyTemplateDialog } from '../components/templates/BuyTemplateDialog';
import { SharedLibrary } from '../components/templates/SharedLibrary';
import { CreatorListingInfo } from '../components/templates/CreatorListingInfo';
import { MyTemplates } from '../components/templates/MyTemplates';
import { BusinessKits } from '../components/templates/BusinessKits';
import { EliteCollection } from '../components/templates/EliteCollection';
import { ArtworkCollection } from '../components/templates/ArtworkCollection';
import { NewSpaceDialog } from '../components/spaces/NewSpaceDialog';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useEditor } from '../contexts/EditorContext';
import { useTeam } from '../contexts/TeamContext';
import { useApplyTemplate } from '../hooks/useApplyTemplate';
import { examplePages } from '../data/examples';
import type { ExamplePage } from '../data/examples/build';
import type { TemplateListing } from '../types/templateListing';
import { moodLabels, templateMood, templatePrice, type ColourMood } from '../data/templateMarket';
import { activeSale, averageStars, listingAsExample, useTemplateStore } from '../utils/templateListings';
import { formatNaira as formatNgn } from '../utils/format';

type Price = 'all' | 'free' | 'premium';
type Source = 'all' | 'kubicu' | 'creators' | 'themes';
type Tab = 'browse' | 'kits' | 'mine';

interface Item {
  ex: ExamplePage;
  listing?: TemplateListing;
  type: string;
}

/** Template marketplace (D67) with creator-made templates and selling (D70). */
export function TemplatesMarket() {
  const market = useMarketplace();
  const { current } = useWorkspace();
  const { state, actions } = useEditor();
  const team = useTeam();
  const canEdit = team.can('pages.edit').allowed;
  const canBuy = team.can('billing.manage').allowed;
  const applyTemplate = useApplyTemplate();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab');
  const tab: Tab = rawTab === 'mine' || rawTab === 'kits' ? rawTab : 'browse';
  const [sellOpen, setSellOpen] = useState(params.get('sell') === '1');
  const [store, update] = useTemplateStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [region, setRegion] = useState('all');
  const [mood, setMood] = useState<ColourMood | 'all'>('all');
  const [price, setPrice] = useState<Price>('all');
  const [source, setSource] = useState<Source>('all');
  const [preview, setPreview] = useState<Item | null>(null);
  const [buying, setBuying] = useState<ExamplePage | null>(null);
  const [confirm, setConfirm] = useState<ExamplePage | null>(null);
  const [spaceFrom, setSpaceFrom] = useState<ExamplePage | null>(null);

  const items: Item[] = useMemo(
    () => [
    ...examplePages.map((ex) => ({ ex, type: ex.category })),
    ...store.listings.
    filter((l) => l.status === 'listed' && l.listedDoc).
    map((l) => ({ ex: listingAsExample(l, activeSale(store, l.id, current.id)?.doc ?? l.listedDoc as NonNullable<typeof l.listedDoc>), listing: l, type: l.category }))],

    [store, current.id]
  );
  const owns = (it: Item) => it.listing ? it.listing.priceNgn === 0 || it.listing.workspaceId === current.id || !!activeSale(store, it.listing.id, current.id) : market.hasLicence(it.ex.id);
  const types = useMemo(() => Array.from(new Set(items.map((i) => i.type))).sort(), [items]);
  const regions = useMemo(() => Array.from(new Set(items.map((i) => i.ex.city))).sort(), [items]);
  const list = items.filter(({ ex, listing, type: t }) => {
    const term = q.trim().toLowerCase();
    const p = templatePrice(ex.id);
    return (
      (type === 'all' || t === type) && (
      region === 'all' || ex.city === region) && (
      mood === 'all' || templateMood(ex) === mood) && (
      price === 'all' || (price === 'premium' ? p > 0 : p === 0)) && (
      source === 'all' || (source === 'themes' ? listing?.kind === 'theme' : source === 'creators' ? !!listing : !listing)) && (
      !term || `${ex.name} ${ex.category} ${ex.bestFor} ${ex.description} ${listing?.creatorName ?? ''}`.toLowerCase().includes(term)));

  });

  const confirmIsTheme = !!confirm && items.find((i) => i.ex.id === confirm.id)?.listing?.kind === 'theme';
  const setTab = (t: Tab) => setParams(t === 'browse' ? {} : { tab: t }, { replace: true });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Templates" context={current.name} description="Layouts made for real businesses — by KUBICU and by other creators, every one reviewed. Apply one to your page, start a campaign with it, or sell your own." />

      <div className="mt-6">
        <Tabs<Tab>
          items={[
          { id: 'browse', label: 'Browse' },
          { id: 'kits', label: 'Business kits' },
          { id: 'mine', label: 'My templates' }]
          }
          value={tab}
          onChange={setTab}
          ariaLabel="Templates"
          idPrefix="tpl" />
        
      </div>

      {tab === 'kits' ?
      <div className="mt-8" role="tabpanel" id="tpl-panel-kits" aria-labelledby="tpl-tab-kits">
          <BusinessKits />
        </div> :
      tab === 'mine' ?
      <div className="mt-8" role="tabpanel" id="tpl-panel-mine" aria-labelledby="tpl-tab-mine">
          <MyTemplates sellOpen={sellOpen} setSellOpen={setSellOpen} />
        </div> :

      <div role="tabpanel" id="tpl-panel-browse" aria-labelledby="tpl-tab-browse">
          <EliteCollection templates={examplePages} hrefFor={(e) => `/templates/${e.id}`} onOpen={(e) => setPreview({ ex: e, type: e.category })} />
          <ArtworkCollection templates={examplePages} hrefFor={(e) => `/templates/${e.id}`} onOpen={(e) => setPreview({ ex: e, type: e.category })} />
          <h2 className="mt-12 text-heading font-semibold text-fg">All templates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
            <TextInput id="tpl-search" label="Search" leadingIcon={SearchIcon} placeholder="Bakery, salon, creator…" value={q} onChange={(e) => setQ(e.target.value)} />
            <SelectInput<string> id="tpl-type" label="Business type" value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...types.map((t) => ({ value: t, label: t }))]} />
            <SelectInput<string> id="tpl-region" label="Region" value={region} onChange={setRegion} options={[{ value: 'all', label: 'Everywhere' }, ...regions.map((r) => ({ value: r, label: r }))]} />
            <SelectInput<ColourMood | 'all'> id="tpl-mood" label="Colour mood" value={mood} onChange={setMood} options={[{ value: 'all', label: 'Any' }, ...(Object.keys(moodLabels) as ColourMood[]).map((m) => ({ value: m, label: moodLabels[m] }))]} />
            <SelectInput<Price>
            id="tpl-price"
            label="Price"
            value={price}
            onChange={setPrice}
            options={[
            { value: 'all', label: 'Free and paid' },
            { value: 'free', label: 'Free' },
            { value: 'premium', label: 'Paid' }]
            } />
          
            <SelectInput<Source>
            id="tpl-source"
            label="Made by"
            value={source}
            onChange={setSource}
            options={[
            { value: 'all', label: 'Everyone' },
            { value: 'kubicu', label: 'KUBICU' },
            { value: 'creators', label: 'Creators' },
            { value: 'themes', label: 'Themes only' }]
            } />
          
          </div>

          {list.length === 0 ?
        <EmptyState className="mt-8" icon={LayoutTemplateIcon} title="No templates match" description="Try fewer filters." /> :

        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {list.map((it) => {
            const { ex, listing } = it;
            const p = templatePrice(ex.id);
            const owned = owns(it);
            const avg = listing ? averageStars(listing) : null;
            return (
              <li key={ex.id}>
                    <button type="button" onClick={() => setPreview(it)} className="group flex w-full flex-col gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="relative block overflow-hidden rounded-[16px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                        <TemplateThumb doc={ex.doc} width={240} height={340} />
                        {listing?.kind === 'theme' &&
                    <span className="absolute right-2 top-2">
                            <Badge tone="info" icon={PaletteIcon}>
                              Theme
                            </Badge>
                          </span>
                    }
                        {p > 0 &&
                    <span className="absolute left-2 top-2">
                            <Badge tone="accent" icon={owned ? undefined : LockIcon}>
                              {owned ? 'Owned' : formatNgn(p)}
                            </Badge>
                          </span>
                    }
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-label font-semibold text-fg">{ex.category}</span>
                        <span className="flex items-center gap-1.5 truncate text-caption text-fg-subtle">
                          {listing ?
                      <>
                              <BadgeCheckIcon size={12} className="shrink-0 text-action" aria-hidden />
                              <span className="truncate">{listing.creatorName}</span>
                              {avg !== null &&
                        <span className="flex shrink-0 items-center gap-0.5">
                                  · <StarIcon size={11} className="fill-current text-warning" aria-hidden /> {avg}
                                </span>
                        }
                            </> :

                      <>
                              {ex.name} · {ex.city}
                            </>
                      }
                        </span>
                      </span>
                    </button>
                  </li>);

          })}
            </ul>
        }

          <div className="mt-16 border-t border-line pt-10">
            <SharedLibrary />
          </div>
        </div>
      }

      <TemplatePreviewSheet
        template={preview?.ex ?? null}
        owned={!!preview && owns(preview)}
        canEdit={canEdit}
        onClose={() => setPreview(null)}
        onBuy={(t) => setBuying(t)}
        onApply={(t) => setConfirm(t)}
        onNewSpace={(t) => {
          setPreview(null);
          setSpaceFrom(t);
        }}
        extra={preview?.listing ? <CreatorListingInfo listing={store.listings.find((l) => l.id === preview.listing?.id) ?? preview.listing} store={store} update={update} workspaceId={current.id} workspaceName={current.name} canBuy={canBuy} /> : undefined} />
      
      <BuyTemplateDialog
        template={buying}
        onClose={() => setBuying(null)}
        onBought={(t) => {
          // Re-point the open preview at the version just bought.
          const it = items.find((i) => i.ex.id === t.id);
          if (it) setPreview(it);
        }} />
      
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? confirmIsTheme ? `Use the “${confirm.category}” theme?` : `Apply “${confirm.category}” to your main page?` : ''}
        description={
        confirmIsTheme ?
        'Only the look changes — colours, fonts, button shape and background. Your blocks and words stay. You can undo in the canvas, and your live page doesn’t change until you publish.' :
        'Your current draft is saved as a snapshot first. Your live page doesn’t change until you publish.'
        }
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              if (!confirm) return;
              if (confirmIsTheme) actions.replaceBlocks(state.draft.blocks, confirm.doc.theme);else
              applyTemplate(confirm.category, confirm.doc);
              setConfirm(null);
              setPreview(null);
              navigate('/app/canvas');
            }}>
            
              {confirmIsTheme ? 'Use theme and open canvas' : 'Apply and open canvas'}
            </Button>
          </>
        } />
      
      <NewSpaceDialog open={!!spaceFrom} onClose={() => setSpaceFrom(null)} mainDoc={state.draft} initialKind="campaign" template={spaceFrom ? { name: spaceFrom.category, doc: spaceFrom.doc } : null} />
    </div>);

}