import React from 'react';
import { MessageCircleIcon, UtensilsIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle, PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { formatNgn, whatsappLink } from '../../utils/format';
import { useCatalog } from '../../contexts/CatalogContext';
import { resolveMenuItem } from '../../utils/commerce/catalog';
import { waNumber } from '../../utils/businessWhatsApp';
import { useT } from '../../contexts/LocaleContext';

/** Fixed wording follows the visitor's language (D503); dishes, notes and the seller's closed message stay as written. */
export function MenuBlock({ block, theme, mode }: BlockProps<'menu'>) {
  const { t: tr } = useT();
  const c = block.content;
  const catalog = useCatalog();
  const categories = c.categories
    .map((cat) => ({ ...cat, items: cat.items.map((i) => resolveMenuItem(i, catalog)).filter((i): i is NonNullable<typeof i> => !!i && !!i.name) }))
    .filter((cat) => cat.items.length > 0);
  if (categories.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={UtensilsIcon} title="Add menu items" hint="Categories, dishes and prices" theme={theme} tall /> : null;
  }

  return (
    <section className="p-5" style={cardStyle(theme)}>
      <BlockTitle theme={theme} aside={!c.orderingOpen ? <PageChip theme={theme} tone="muted">{tr('Ordering paused')}</PageChip> : undefined}>
        {c.title || tr('Menu')}
      </BlockTitle>
      {c.note && <p className="-mt-1 mb-4 text-[13px] leading-relaxed" style={{ color: theme.mutedText }}>{c.note}</p>}
      <div className="flex flex-col gap-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3 className="mb-1 text-[13px] font-semibold" style={{ color: theme.mutedText }}>{cat.name}</h3>
            <ul>
              {cat.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3" style={{ borderTop: `1px solid ${mix(theme.text, 9)}` }}>
                  <div className="min-w-0" style={{ opacity: item.available ? 1 : 0.6 }}>
                    <p className="text-[15px] font-medium leading-snug" style={{ color: theme.text, fontFamily: fontsFor(theme).body }}>
                      {item.name}
                      {!item.available && <span className="ml-2 align-middle"><PageChip theme={theme} tone="muted">{tr('Sold out today')}</PageChip></span>}
                    </p>
                    {item.description && <p className="mt-0.5 text-[13px] leading-snug" style={{ color: theme.mutedText }}>{item.description}</p>}
                    {item.tags && <p className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>{item.tags}</p>}
                  </div>
                  <p className="shrink-0 text-[15px] font-semibold tabular-nums" style={{ color: theme.text }}>
                    {item.priceNgn !== null ? formatNgn(item.priceNgn) : <span className="text-[13px] font-medium" style={{ color: theme.mutedText }}>{tr('Ask')}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {c.orderingOpen ? (
        waNumber(c.whatsappPhone) && (
          <PageAction
            mode={mode}
            href={whatsappLink(waNumber(c.whatsappPhone), 'Hello! I’d like to order from your menu:\n')}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
            style={buttonStyle(theme, 'featured')}
          >
            <MessageCircleIcon size={17} aria-hidden />
            {tr('Order on WhatsApp')}
          </PageAction>
        )
      ) : (
        <p className="mt-5 rounded-lg px-4 py-3 text-center text-[14px]" style={{ background: mix(theme.text, 6), color: theme.text }}>
          {c.closedMessage || tr('We’re not taking orders right now.')}
        </p>
      )}
    </section>
  );
}
