import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplateIcon, LockIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { TemplateThumb } from '../components/templates/TemplateThumb';
import { TemplatePreviewSheet } from '../components/templates/TemplatePreviewSheet';
import { BuyTemplateDialog } from '../components/templates/BuyTemplateDialog';
import { SharedLibrary } from '../components/templates/SharedLibrary';
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
import { moodLabels, templateMood, templatePrice, type ColourMood } from '../data/templateMarket';
import { formatNgn } from '../utils/format';

type Price = 'all' | 'free' | 'premium';

/** Template marketplace in the workspace (D67): filter, preview, buy premium, apply or start a campaign. */
export function TemplatesMarket() {
  const market = useMarketplace();
  const { current } = useWorkspace();
  const { state } = useEditor();
  const canEdit = useTeam().can('pages.edit').allowed;
  const applyTemplate = useApplyTemplate();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [region, setRegion] = useState('all');
  const [mood, setMood] = useState<ColourMood | 'all'>('all');
  const [price, setPrice] = useState<Price>('all');
  const [preview, setPreview] = useState<ExamplePage | null>(null);
  const [buying, setBuying] = useState<ExamplePage | null>(null);
  const [confirm, setConfirm] = useState<ExamplePage | null>(null);
  const [spaceFrom, setSpaceFrom] = useState<ExamplePage | null>(null);

  const types = useMemo(() => Array.from(new Set(examplePages.map((e) => e.category))).sort(), []);
  const regions = useMemo(() => Array.from(new Set(examplePages.map((e) => e.city))).sort(), []);
  const list = examplePages.filter((e) => {
    const term = q.trim().toLowerCase();
    const p = templatePrice(e.id);
    return (
      (type === 'all' || e.category === type) && (
      region === 'all' || e.city === region) && (
      mood === 'all' || templateMood(e) === mood) && (
      price === 'all' || (price === 'premium' ? p > 0 : p === 0)) && (
      !term || `${e.name} ${e.category} ${e.bestFor} ${e.description}`.toLowerCase().includes(term)));

  });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Templates" context={current.name} description="Layouts made for real businesses. Preview on phone and desktop, apply to your page, or start a campaign with one. Your products, links and contact details stay." />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <TextInput id="tpl-search" label="Search" leadingIcon={SearchIcon} placeholder="Bakery, salon, launch…" value={q} onChange={(e) => setQ(e.target.value)} />
        <SelectInput<string> id="tpl-type" label="Business type" value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...types.map((t) => ({ value: t, label: t }))]} />
        <SelectInput<string> id="tpl-region" label="Region" value={region} onChange={setRegion} options={[{ value: 'all', label: 'Everywhere' }, ...regions.map((r) => ({ value: r, label: r }))]} />
        <SelectInput<ColourMood | 'all'> id="tpl-mood" label="Colour mood" value={mood} onChange={setMood} options={[{ value: 'all', label: 'Any' }, ...(Object.keys(moodLabels) as ColourMood[]).map((m) => ({ value: m, label: moodLabels[m] }))]} />
        <SelectInput<Price>
          id="tpl-price"
          label="Price"
          value={price}
          onChange={setPrice}
          options={[
          { value: 'all', label: 'Free and premium' },
          { value: 'free', label: 'Free' },
          { value: 'premium', label: 'Premium' }]
          } />
        
      </div>

      {list.length === 0 ?
      <EmptyState className="mt-8" icon={LayoutTemplateIcon} title="No templates match" description="Try fewer filters." /> :

      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {list.map((e) => {
          const p = templatePrice(e.id);
          const owned = market.hasLicence(e.id);
          return (
            <li key={e.id}>
                <button type="button" onClick={() => setPreview(e)} className="group flex w-full flex-col gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <span className="relative block overflow-hidden rounded-[16px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                    <TemplateThumb doc={e.doc} width={240} height={340} />
                    {p > 0 &&
                  <span className="absolute left-2 top-2">
                        <Badge tone="accent" icon={owned ? undefined : LockIcon}>
                          {owned ? 'Owned' : formatNgn(p)}
                        </Badge>
                      </span>
                  }
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-label font-semibold text-fg">{e.category}</span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {e.name} · {e.city}
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

      <TemplatePreviewSheet
        template={preview}
        owned={!!preview && market.hasLicence(preview.id)}
        canEdit={canEdit}
        onClose={() => setPreview(null)}
        onBuy={(t) => setBuying(t)}
        onApply={(t) => setConfirm(t)}
        onNewSpace={(t) => {
          setPreview(null);
          setSpaceFrom(t);
        }} />
      
      <BuyTemplateDialog template={buying} onClose={() => setBuying(null)} />
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? `Apply “${confirm.category}” to your main page?` : ''}
        description="Your current draft is saved as a snapshot first. Your live page doesn’t change until you publish."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              if (!confirm) return;
              applyTemplate(confirm.category, confirm.doc);
              setConfirm(null);
              setPreview(null);
              navigate('/app/canvas');
            }}>
            
              Apply and open canvas
            </Button>
          </>
        } />
      
      <NewSpaceDialog open={!!spaceFrom} onClose={() => setSpaceFrom(null)} mainDoc={state.draft} initialKind="campaign" template={spaceFrom ? { name: spaceFrom.category, doc: spaceFrom.doc } : null} />
    </div>);

}