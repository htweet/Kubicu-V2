import React, { useRef } from 'react';
import { useElementWidth } from '../../hooks/useElementWidth';
import { TruckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { formatNgn } from '../../utils/format';

interface Row {
  id: string;
  area: string;
  price: string;
  time: string;
}

/**
 * Delivery & returns (D181). Rates either follow the shop's own delivery settings — so the page and
 * checkout never disagree — or are written by hand. Returns are always the owner's own words.
 */
export function DeliveryBlock({ block, theme, mode }: BlockProps<'delivery'>) {
  const c = block.content;
  const ref = useRef<HTMLElement>(null);
  const width = useElementWidth(ref);
  const catalog = useCatalog();
  const f = catalog?.fulfilment;
  const fromShop = c.source === 'shop';

  const rows: Row[] = fromShop ?
  f?.deliveryEnabled ?
  f.zones.map((z) => ({ id: z.id, area: z.name, price: z.feeNgn > 0 ? formatNgn(z.feeNgn) : 'Free', time: z.eta })) :
  [] :
  c.zones.filter((z) => z.area.trim()).map((z) => ({ ...z, area: z.area.trim() }));
  const freeOver = fromShop && f?.deliveryEnabled && f.freeDeliveryOverNgn ? `Free delivery on orders over ${formatNgn(f.freeDeliveryOverNgn)}.` : '';
  const pickup = fromShop ? f?.pickupEnabled ? [f.pickupAddress, f.pickupHours].filter((s) => s.trim()).join(' · ') || 'Available — details when you order' : '' : c.pickup.trim();
  const returns = c.returns.trim();

  if (!rows.length && !pickup && !returns) {
    if (mode !== 'edit') return null;
    return (
      <BlockPlaceholder
        icon={TruckIcon}
        title={fromShop ? 'No delivery or pickup set up in your shop yet' : 'Add where you deliver'}
        hint={fromShop ? 'Turn on delivery zones or pickup in Commerce → Settings, or write your own rates here. Add your returns policy too.' : 'Each area needs a name. Add your returns policy in your own words.'}
        theme={theme} />);


  }

  const label = { color: theme.mutedText };
  const rule = `1px solid ${mix(theme.text, 10)}`;
  const display = { fontFamily: fontsFor(theme).display, color: theme.text };
  // Side by side only when the block itself is wide enough for the price table to breathe — a narrow column,
  // a phone or the canvas phone preview stacks Returns under Delivery instead of squeezing the table.
  const twoCol = !!returns && (rows.length > 0 || !!pickup) && width >= 640;
  const showTime = width >= 380;

  return (
    <section ref={ref}>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <div className={twoCol ? 'grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-x-10' : 'flex flex-col'}>
        <div>
          {rows.length > 0 &&
          <div className="py-5" style={{ borderTop: rule }}>
              <h3 className="text-[17px] font-medium" style={display}>
                Delivery
              </h3>
              <table className="mt-3 w-full text-left text-[15px]">
                <caption className="sr-only">Delivery areas, prices and times</caption>
                <thead>
                  <tr className="text-[12.5px]" style={label}>
                    <th scope="col" className="pb-2 font-medium">Area</th>
                    <th scope="col" className="pb-2 text-right font-medium">Price</th>
                    {showTime && <th scope="col" className="pb-2 pl-4 text-right font-medium">Usually</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) =>
                <tr key={r.id} style={{ borderTop: `1px solid ${mix(theme.text, 7)}` }}>
                      <th scope="row" className="py-2.5 pr-3 align-top font-normal" style={{ color: theme.text }}>
                        {r.area}
                        {r.time && !showTime &&
                    <span className="block text-[13px]" style={label}>
                            {r.time}
                          </span>
                    }
                      </th>
                      <td className="whitespace-nowrap py-2.5 text-right align-top font-medium tabular-nums" style={{ color: theme.text }}>
                        {r.price || '—'}
                      </td>
                      {showTime &&
                  <td className="py-2.5 pl-4 text-right align-top" style={label}>
                          {r.time || '—'}
                        </td>
                  }
                    </tr>
                )}
                </tbody>
              </table>
              {freeOver &&
            <p className="mt-3 text-[14px]" style={label}>
                  {freeOver}
                </p>
            }
            </div>
          }
          {pickup &&
          <div className="py-5" style={{ borderTop: rule }}>
              <h3 className="text-[17px] font-medium" style={display}>
                Pickup
              </h3>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed" style={label}>
                {pickup}
              </p>
            </div>
          }
        </div>
        {returns &&
        <div className="py-5" style={{ borderTop: rule }}>
            <h3 className="text-[17px] font-medium" style={display}>
              Returns
            </h3>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed" style={label}>
              {returns}
            </p>
          </div>
        }
      </div>
      {c.note.trim() &&
      <p className="mt-2 text-[13.5px]" style={label}>
          {c.note.trim()}
        </p>
      }
    </section>);

}