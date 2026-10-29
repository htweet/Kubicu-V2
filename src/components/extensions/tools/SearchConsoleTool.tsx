import React, { useMemo } from 'react';
import { CheckCircle2Icon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { InstalledExtension } from '../../../types/marketplace';
import type { PageDocument } from '../../../types/page';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useEditor } from '../../../contexts/EditorContext';
import { useOps } from '../../../contexts/OpsContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { sitemapEntries } from '../../../utils/seo';
import { sitePages } from '../../../utils/sitePages';
import { activeExtraSpaces, readSpacePage } from '../../../utils/spaces';
import { Button } from '../../ui/Button';
import { ToolSection, ToolStat } from './ToolSection';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Search Console & SEO (D232): sitemap from published spaces, plus pages missing a search description. */
export function SearchConsoleTool({ rec }: {rec: InstalledExtension;}) {
  const { data: commerce } = useCommerce();
  const { data: ops } = useOps();
  const { state } = useEditor();
  const { current } = useWorkspace();

  const { entries, missing } = useMemo(() => {
    const docs: PageDocument[] = [state.published, ...activeExtraSpaces(current).map((s) => readSpacePage(current.id, s.id)?.published ?? null)].filter((d): d is PageDocument => !!d);
    const all = docs.flatMap((d, i) => sitemapEntries(d, i === 0 ? commerce : null, i === 0 ? ops.services : []));
    const unique = Array.from(new Map(all.map((e) => [e.url, e])).values());
    const gaps = docs.flatMap((d) => [
    ...(!d.seo.noIndex && !d.seo.description?.trim() ? [`${d.title || d.handle} — home`] : []),
    ...sitePages(d).
    filter((p) => !p.membersOnly && !p.seo.noIndex && !p.seo.description?.trim()).
    map((p) => `${d.title || d.handle} — ${p.title}`)]
    );
    return { entries: unique, missing: gaps };
  }, [state.published, current, commerce, ops.services]);

  const download = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((e) => `  <url><loc>${esc(e.url)}</loc><lastmod>${e.updated.slice(0, 10)}</lastmod></url>`).join('\n')}\n</urlset>\n`;
    const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sitemap downloaded', { description: 'Submit it in Search Console → Sitemaps.' });
  };

  return (
    <ToolSection title="Search readiness">
      <p className="flex items-center gap-1.5 text-label text-fg">
        <CheckCircle2Icon size={15} className="text-success" aria-hidden />
        Verification tag is on your live pages{rec.settings.verification ? ` (…${rec.settings.verification.slice(-6)})` : ''}. Press Verify in Search Console.
      </p>
      <dl className="grid grid-cols-2 gap-4">
        <ToolStat label="Addresses in the sitemap" value={entries.length} hint="Published spaces only" />
        <ToolStat label="Missing a search description" value={missing.length} />
      </dl>
      {missing.length > 0 &&
      <div>
          <ul className="flex max-h-40 flex-col divide-y divide-line overflow-y-auto">
            {missing.map((m) =>
          <li key={m} className="py-2 text-label text-fg">
                {m}
              </li>
          )}
          </ul>
          <p className="mt-1 text-caption text-fg-muted">Add one in the canvas: Publish → Search &amp; sharing.</p>
        </div>
      }
      <Button size="sm" leadingIcon={DownloadIcon} onClick={download} disabled={entries.length === 0} className="self-start">
        Download sitemap.xml
      </Button>
    </ToolSection>);

}