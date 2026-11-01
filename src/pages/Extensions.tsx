import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PuzzleIcon, SearchIcon } from 'lucide-react';
import type { ExtensionCategory, ExtensionInfo } from '../types/marketplace';
import { PageHeader } from '../components/shell/PageHeader';
import { TextInput } from '../components/ui/TextInput';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import { ExtensionIcon } from '../components/extensions/ExtensionIcon';
import { ExtensionDetail } from '../components/extensions/ExtensionDetail';
import { InstallExtensionDialog } from '../components/extensions/InstallExtensionDialog';
import { worksWithLine } from '../components/extensions/WorksWith';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { averageRating, extensionById, extensionCategories, extensions } from '../data/extensions';
import { plans } from '../data/plans';
import { formatNaira as formatNgn } from '../utils/format';
import { cn } from '../utils/cn';
import { Section } from '../components/ui/layout/Section';
import { Card } from '../components/ui/layout/Card';
import { List } from '../components/ui/layout/ListRow';
import { listedCommunity, useSubmissions } from '../utils/extensionSubmissions';
import { useModuleAvailability } from '../utils/admin/moduleFlags';

type View = 'browse' | 'installed';

/** Curated extension marketplace (D67). */
export function Extensions() {
  const market = useMarketplace();
  // Add-ons KUBICU switched off stay listed but can't be installed (D464).
  const availability = useModuleAvailability();
  const { current } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('browse');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ExtensionCategory | 'all'>('all');
  const [install, setInstall] = useState<{ext: ExtensionInfo;mode: 'install' | 'settings';} | null>(null);
  const [subs] = useSubmissions();
  const open = params.get('ext') ? extensionById[params.get('ext')!] ?? null : null;
  const setOpen = (id: string | null) => setParams(id ? { ext: id } : {}, { replace: true });

  const installedCount = Object.keys(market.data.installed).length;
  const catalogue = useMemo(() => [...extensions, ...listedCommunity(subs)], [subs]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return catalogue.filter(
      (e) =>
      (view === 'browse' ? !e.retired || !!market.data.installed[e.id] : !!market.data.installed[e.id]) && (
      cat === 'all' || e.category === cat) && (
      !term || `${e.name} ${e.summary} ${e.publisher}`.toLowerCase().includes(term))
    );
  }, [q, cat, view, market.data.installed, catalogue]);
  const picks = extensions.filter((e) => e.staffPick && !e.retired);
  const showPicks = view === 'browse' && !q && cat === 'all';

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Extensions" context={current.name} description="Add features to your workspace. Every extension is built by KUBICU or reviewed by our team before it’s listed, and shows exactly what it can do before you install." />

      {showPicks &&
      <Section id="ext-picks" title="Staff picks" description="Chosen by the KUBICU team for most new workspaces." className="mt-8">
          <ul className="grid gap-4 md:grid-cols-3">
            {picks.map((e) =>
          <li key={e.id}>
                <button type="button" onClick={() => setOpen(e.id)} className="flex h-full w-full flex-col gap-3 rounded-lg border border-line bg-raised p-5 text-left transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <ExtensionIcon ext={e} size="lg" />
                  <span>
                    <span className="block text-body font-semibold text-fg">{e.name}</span>
                    <span className="mt-1 block text-label text-fg-muted">{e.summary}</span>
                  </span>
                  <span className="mt-auto flex flex-wrap items-center gap-2 text-caption text-fg-subtle">
                    {!availability.ext(e.id) ? <Badge tone="neutral">Currently not available</Badge> : market.data.installed[e.id] ? <Badge tone="success" dot>Installed</Badge> : <span>{e.priceNgn ? `${formatNgn(e.priceNgn)}/mo` : 'Free'}</span>}
                    <span>· {plans[e.minPlan].name}+</span>
                  </span>
                </button>
              </li>
          )}
          </ul>
        </Section>
      }

      <section aria-label="All extensions" className="mt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Tabs<View>
            idPrefix="ext"
            ariaLabel="Extensions"
            value={view}
            onChange={setView}
            items={[
            { id: 'browse', label: 'Browse' },
            { id: 'installed', label: 'Installed', badge: installedCount || undefined }]
            } />
          
          <div className="md:w-[280px]">
            <TextInput id="ext-search" label="Search extensions" leadingIcon={SearchIcon} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} fieldClassName="[&>label]:sr-only" />
          </div>
        </div>
        <div className="scroll-quiet mt-4 flex gap-1.5 overflow-x-auto overflow-y-hidden" role="group" aria-label="Category">
          {(['all', ...(Object.keys(extensionCategories) as ExtensionCategory[])] as const).map((c) =>
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={cn('h-8 shrink-0 rounded-full border px-3 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', cat === c ? 'border-action bg-action-soft text-action' : 'border-line text-fg-muted hover:bg-sunken')}>
            
              {c === 'all' ? 'All' : extensionCategories[c]}
            </button>
          )}
        </div>

        {list.length === 0 ?
        <EmptyState className="mt-6" icon={PuzzleIcon} title={view === 'installed' && !installedCount ? 'Nothing installed yet' : 'No extensions match'} description={view === 'installed' && !installedCount ? 'Browse the catalogue to add features.' : 'Try another search or category.'} /> :

        <Card as="div" body="flush" className="mt-4">
          <List label="Extensions">
            {list.map((e) => {
              const rec = market.data.installed[e.id];
              const rating = averageRating(e);
              return (
                <li key={e.id}>
                  <button type="button" onClick={() => setOpen(e.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left md:px-6 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <ExtensionIcon ext={e} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-label font-semibold text-fg">{e.name}</span>
                        {e.verified === 'community' ? <Badge tone="neutral">By {e.publisher}</Badge> : e.preview && <Badge tone="info">Preview</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-caption text-fg-muted">{e.summary}</span>
                      <span className="mt-0.5 block truncate text-caption text-fg-subtle">
                        {e.worksWith?.length ? `Works with ${worksWithLine(e.worksWith)}` : `${e.publisher} · ${extensionCategories[e.category]}`}
                        {rating !== null && ` · ★ ${rating.toFixed(1)}`}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      {e.retired ?
                      <Badge tone="info">Moved to {e.retired.movedTo}</Badge> :
                      !availability.ext(e.id) ?
                      <Badge tone="neutral">Currently not available</Badge> :
                      rec ?
                      <Badge tone={rec.paused ? 'warning' : 'success'} dot>
                          {rec.paused ? 'Paused' : 'Installed'}
                        </Badge> :

                      <span className="text-caption text-fg-muted">
                          {e.priceNgn ? `${formatNgn(e.priceNgn)}/mo` : 'Free'} · {plans[e.minPlan].name}+
                        </span>
                      }
                    </span>
                  </button>
                </li>);

            })}
          </List>
          </Card>
        }
      </section>

      <ExtensionDetail ext={open} onClose={() => setOpen(null)} onInstall={(ext, mode) => setInstall({ ext, mode })} />
      <InstallExtensionDialog ext={install?.ext ?? null} mode={install?.mode} onClose={() => setInstall(null)} />
    </div>);

}