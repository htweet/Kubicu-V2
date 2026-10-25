import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MonitorIcon, SmartphoneIcon } from 'lucide-react';
import type { PageTheme } from '../../../types/page';
import type { CommerceData } from '../../../types/commerce';
import { StorefrontView } from '../../storefront/StorefrontView';
import { ProductDetailView } from '../../storefront/ProductDetailView';
import { fontsFor } from '../../blocks/pageStyle';
import { Segmented } from '../../ui/Segmented';
import { shopProducts } from '../../../utils/commerce/storefront';

interface StorefrontLivePreviewProps {
  theme: PageTheme;
  data: CommerceData;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
}

const WIDTH = { phone: 390, desktop: 1180 } as const;

/**
 * The real shop and product page, drawn with the unsaved settings and the page's theme, scaled to
 * fit (D196). It can't be clicked — it's a picture of what shoppers get.
 */
export function StorefrontLivePreview({ theme, data, ordering, whatsappPhone }: StorefrontLivePreviewProps) {
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  const [view, setView] = useState<'shop' | 'product'>('shop');
  const outer = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const first = shopProducts(data)[0];

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const ro = new ResizeObserver(() => setBox({ width: o.clientWidth, height: i.scrollHeight }));
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    inner.current?.setAttribute('inert', '');
  }, []);

  const w = WIDTH[device];
  const scale = box.width ? Math.min(1, box.width / w) : 0.5;
  const fonts = fontsFor(theme);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented<'shop' | 'product'> ariaLabel="Preview page" size="sm" value={view} onChange={setView} options={[{ value: 'shop', label: 'Shop' }, { value: 'product', label: 'Product page' }]} />
        <Segmented<'phone' | 'desktop'>
          ariaLabel="Preview size"
          size="sm"
          value={device}
          onChange={setDevice}
          options={[
          { value: 'phone', label: 'Phone', icon: SmartphoneIcon },
          { value: 'desktop', label: 'Desktop', icon: MonitorIcon }]
          } />
        
      </div>
      <div ref={outer} className="max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-lg border border-line" aria-label="Shop preview" role="img">
        <div style={{ height: box.height * scale, width: '100%' }}>
          <div
            ref={inner}
            className="origin-top-left"
            style={{ width: w, transform: `scale(${scale})`, background: theme.background, color: theme.text, fontFamily: fonts.body, padding: device === 'phone' ? '20px' : '32px 40px' }}>
            
            {view === 'product' && first ?
            <ProductDetailView theme={theme} data={data} product={first} ordering={ordering} whatsappPhone={whatsappPhone} shopHref="#" productHref={() => '#'} shopKey={null} /> :
            view === 'product' ?
            <p className="py-16 text-center text-[15px]" style={{ color: theme.mutedText }}>
                Add a product to see its page.
              </p> :

            <StorefrontView theme={theme} data={data} productHref={() => '#'} ordering={ordering} whatsappPhone={whatsappPhone} shopKey={null} />
            }
          </div>
        </div>
      </div>
    </div>);

}