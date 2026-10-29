import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { useEditor } from '../../../contexts/EditorContext';
import { useOptionalCommerce } from '../../../contexts/CommerceContext';
import { useOptionalOps } from '../../../contexts/OpsContext';
import { richResultHints, sitemapEntries, structuredData } from '../../../utils/seo';
import { publicUrl } from '../../../utils/format';
import { IndexingFields } from './IndexingFields';
import { cn } from '../../../utils/cn';

/**
 * Search engines (D124): show in search on/off, the sitemap search engines would get, and the
 * structured data that can earn richer results. Computed from the space as it is now.
 */
export function SearchEnginesSection() {
  const { state } = useEditor();
  const commerce = useOptionalCommerce()?.data ?? null;
  const services = useOptionalOps()?.data.services ?? [];
  const site = state.site;
  const hidden = !!site.branding?.hideFromSearch;
  const [showMap, setShowMap] = useState(false);
  const [showData, setShowData] = useState(false);
  const entries = useMemo(() => sitemapEntries(site, commerce, services), [site, commerce, services]);
  const data = useMemo(() => structuredData(site, commerce, services), [site, commerce, services]);
  const hints = richResultHints(data);
  const title = site.seo.title || site.title;
  const counts = entries.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.kind]: (acc[e.kind] ?? 0) + 1 }), {});

  return (
    <section className="flex flex-col gap-4 border-t border-line pt-5" aria-labelledby="search-engines-heading">
      <div>
        <h3 id="search-engines-heading" className="text-label font-medium text-fg">Search engines</h3>
        <p className="text-caption text-fg-subtle">Whether Google lists your pages and follows your links. Also in the Publish window.</p>
      </div>
      <IndexingFields idPrefix="search" />

      {!hidden &&
      <>
          <div className="rounded-md border border-line bg-canvas p-3" aria-label="How it may look on Google">
            <p className="flex items-center gap-1.5 text-meta text-fg-subtle"><SearchIcon size={11} aria-hidden /> Google result (example)</p>
            <p className="mt-1.5 truncate text-caption text-fg-muted">{publicUrl(site.handle)}</p>
            <p className="truncate text-label font-semibold text-action">{title}</p>
            <p className="line-clamp-2 text-caption text-fg-muted">{site.seo.description || 'Add a description under Search & sharing — otherwise Google picks text from your page.'}</p>
            {hints.length > 1 && <p className="mt-1.5 text-caption text-fg-subtle">May also show: {hints.slice(1).join(' · ')}</p>}
          </div>

          <div className="flex flex-col divide-y divide-line rounded-md border border-line">
            <Disclosure open={showMap} onToggle={() => setShowMap((v) => !v)} label="Sitemap" summary={`${entries.length} address${entries.length === 1 ? '' : 'es'} · ${Object.entries(counts).map(([k, n]) => `${n} ${k.toLowerCase()}${n === 1 ? '' : 's'}`).join(', ')}`}>
              <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto scroll-quiet">
                {entries.map((e, i) =>
              <li key={`${e.url}-${i}`} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2 text-caption">
                    <span className="text-fg-subtle">{e.kind}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{e.label}</span>
                      <span className="block truncate text-fg-subtle">{e.url.replace('https://', '')}</span>
                    </span>
                  </li>
              )}
              </ul>
              <p className="mt-2 text-caption text-fg-subtle">Drafts, hidden and members-only pages, sold-out-forever products and past events are left out. Updated automatically when you publish.</p>
            </Disclosure>
            <Disclosure open={showData} onToggle={() => setShowData((v) => !v)} label="Structured data" summary={hints.join(' · ')}>
              <pre className="max-h-64 overflow-auto rounded-sm bg-sunken p-2 text-[11px] leading-snug text-fg-muted scroll-quiet">{JSON.stringify({ '@context': 'https://schema.org', '@graph': data }, null, 2)}</pre>
              <p className="mt-2 text-caption text-fg-subtle">Search engines read this to show prices, stock and event dates. It’s built from your real products and events — nothing is invented.</p>
            </Disclosure>
          </div>
        </>
      }
    </section>);

}

function Disclosure({ open, onToggle, label, summary, children }: {open: boolean;onToggle: () => void;label: string;summary: string;children: React.ReactNode;}) {
  return (
    <div className="px-3 py-2.5">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <ChevronDownIcon size={15} className={cn('mt-0.5 shrink-0 text-fg-subtle transition-transform duration-150 ease-out', open && 'rotate-180')} aria-hidden />
        <span className="min-w-0">
          <span className="block text-label font-medium text-fg">{label}</span>
          <span className="block text-caption text-fg-muted">{summary}</span>
        </span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>);

}