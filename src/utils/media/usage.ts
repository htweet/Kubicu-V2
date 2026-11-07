import type { Block, PageDocument, PageVersion, SavedSection } from '../../types/page';
import { homeLabel, sitePages } from '../sitePages';
import type { Product } from '../../types/commerce';
import type { MediaUse } from '../../types/media';
import { blockName } from '../blocks';
import { containsString, mediaRef } from './refs';

export interface UsageSources {
  draft: PageDocument;
  published: PageDocument | null;
  versions: PageVersion[];
  products: Product[];
  sections: SavedSection[];
}

/** Every place an image is used. `history` alone doesn't count as “in use”. */
export function findUses(assetId: string, src: UsageSources): MediaUse[] {
  const ref = mediaRef(assetId);
  const uses: MediaUse[] = [];

  const onPage = (blocks: Block[], pageId: string | null, where: string) =>
    blocks.forEach((b) => {
      if (containsString(b, ref))
        uses.push({
          kind: 'block',
          label: blockName(b),
          detail: `${b.visibility.hidden ? 'Hidden block' : 'Block'} on ${where}`,
          to: `/app/canvas/${src.draft.id}?block=${b.id}${pageId ? `&page=${pageId}` : ''}`,
        });
    });
  const multi = sitePages(src.draft).length > 0;
  onPage(src.draft.blocks, null, multi ? `your ${homeLabel(src.draft)} page` : 'your page');
  sitePages(src.draft).forEach((p) => onPage(p.blocks, p.id, `your ${p.title || 'Untitled'} page`));
  if (src.published && containsString(src.published, ref) && !containsString(src.draft, ref)) {
    uses.push({ kind: 'live', label: 'Your live page', detail: 'Still shown until you next publish' });
  }
  src.products.forEach((p) => {
    if (containsString(p.images, ref)) uses.push({ kind: 'product', label: p.name || 'Untitled product', detail: p.kind === 'digital' ? 'Digital product photo' : 'Product photo', to: p.kind === 'ticket' ? `/app/commerce/events?edit=${p.eventId}` : `/app/commerce/${p.kind === 'digital' ? 'digital' : 'products'}?edit=${p.id}` });
  });
  src.sections.forEach((s) => {
    if (containsString(s.blocks, ref)) uses.push({ kind: 'section', label: s.name, detail: 'Saved section' });
  });
  if (!uses.some((u) => u.kind === 'live') && src.versions.some((v) => containsString(v.doc, ref))) {
    uses.push({ kind: 'history', label: 'Version history', detail: 'Kept so older versions restore correctly' });
  }
  return uses;
}

export function isInUse(uses: MediaUse[]): boolean {
  return uses.some((u) => u.kind !== 'history');
}

/** Whether the data must be kept after removal (live page or history still point at it). */
export function needsKeeping(assetId: string, src: Pick<UsageSources, 'published' | 'versions'>): boolean {
  const ref = mediaRef(assetId);
  return (!!src.published && containsString(src.published, ref)) || src.versions.some((v) => containsString(v.doc, ref));
}
