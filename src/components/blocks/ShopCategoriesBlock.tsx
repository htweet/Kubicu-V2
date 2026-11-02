import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRightIcon, TagsIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { useCatalog } from '../../contexts/CatalogContext';
import { pageHref } from '../../utils/sitePages';
import { STOREFRONT_PATH } from '../../utils/commerce/storefront';
import { accentOf, buttonRadius, cardRadius, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/** Shop categories (D170): Commerce collections as shortcuts into the shop, with a real product photo where there is one. */
export function ShopCategoriesBlock({ block, theme, mode }: BlockProps<'shopCategories'>) {
  const { t: tr } = useT();
  const c = block.content;
  const data = useCatalog();
  const { handle } = useParams();
  const active = (data?.products ?? []).filter((p) => p.status === 'active');
  const all = (data?.collections ?? []).filter((col) => active.some((p) => p.collectionIds.includes(col.id)));
  const chosen = c.collectionIds.length ? c.collectionIds.map((id) => all.find((x) => x.id === id)).filter((x): x is (typeof all)[number] => !!x) : all;
  if (chosen.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={TagsIcon} title="No collections with products yet" hint="Create collections in Commerce → Products and add products to them" theme={theme} /> : null;
  const href = (id: string) => `${pageHref(handle ?? '', STOREFRONT_PATH)}?c=${id}`;
  const display = fontsFor(theme).display;

  if (c.layout === 'chips') {
    return (
      <section>
        <SectionHeading theme={theme} title={c.title} />
        <ul className="flex flex-wrap gap-2">
          {chosen.map((col) =>
          <li key={col.id}>
              <PageAction mode={mode} href={href(col.id)} newTab={false} className="inline-flex h-11 items-center px-5 text-[14px] font-semibold" style={{ background: mix(theme.text, 6), color: theme.text, borderRadius: buttonRadius(theme) }}>
                {col.name}
              </PageAction>
            </li>
          )}
        </ul>
      </section>);

  }
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <ul className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))' }}>
        {chosen.map((col) => {
          const items = active.filter((p) => p.collectionIds.includes(col.id));
          const img = items.find((p) => p.images[0])?.images[0];
          return (
            <li key={col.id} className="flex">
              <PageAction mode={mode} href={href(col.id)} newTab={false} className="group flex w-full flex-col">
                <div className="aspect-[4/3] overflow-hidden" style={{ borderRadius: cardRadius(theme), background: mix(accentOf(theme), 12, theme.background) }}>
                  {img ? <MediaImage src={img.url} alt="" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" /> : null}
                </div>
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[17px] font-medium" style={{ fontFamily: display, color: theme.text }}>{col.name}</span>
                  <ArrowRightIcon size={16} aria-hidden style={{ color: theme.text }} />
                </span>
                <span className="text-[13px]" style={{ color: theme.mutedText }}>{tr('Items: {n}', { n: items.length })}</span>
              </PageAction>
            </li>);

        })}
      </ul>
    </section>);

}