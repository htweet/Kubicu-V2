import React, { useLayoutEffect, useRef, useState } from 'react';
import { MonitorIcon, SmartphoneIcon } from 'lucide-react';
import type { PageTheme } from '../../../types/page';
import type { CommerceData } from '../../../types/commerce';
import { StorefrontView } from '../../storefront/StorefrontView';
import { ProductDetailView } from '../../storefront/ProductDetailView';
import { fontsFor } from '../../blocks/pageStyle';
import { Segmented } from '../../ui/Segmented';
import { shopProducts } from '../../../utils/commerce/storefront';
import { PreviewFrame } from './PreviewFrame';
import { cn } from '../../../utils/cn';

interface StorefrontLivePreviewProps {
  theme: PageTheme;
  data: CommerceData;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
}

type Device = 'phone' | 'desktop';
type View = 'shop' | 'product';

const WIDTH: Record<Device, number> = { phone: 390, desktop: 1180 };
const PAD: Record<Device, string> = { phone: '20px 16px 28px', desktop: '36px 44px 48px' };
/** A real screen height for each size; the shop scrolls inside it (D196b). */
const HEIGHT: Record<Device, number> = { phone: 760, desktop: 760 };

/**
 * The real shop and product page, drawn with the unsaved settings and the page's theme (D196).
 * Each size is laid out in a frame of its true width — so phones get the phone layout — then
 * scaled to fit the column. It can't be clicked; it's a picture of what shoppers get.
 */
export function StorefrontLivePreview({ theme, data, ordering, whatsappPhone }: StorefrontLivePreviewProps) {
  const [device, setDevice] = useState<Device>('phone');
  const [view, setView] = useState<View>('shop');
  const outer = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState(0);
  const first = shopProducts(data)[0];

  useLayoutEffect(() => {
    const o = outer.current;
    if (!o) return;
    const ro = new ResizeObserver(() => setAvail(o.clientWidth));
    ro.observe(o);
    setAvail(o.clientWidth);
    return () => ro.disconnect();
  }, []);

  const w = WIDTH[device];
  const h = HEIGHT[device];
  // Phones keep air around the device (and room for its bezel); desktop fills the column inside a small inset.
  const room = device === 'phone' ? Math.max(0, avail - 48) : Math.max(0, avail - 24);
  const scale = room ? Math.min(1, room / w) : 0.5;
  const fonts = fontsFor(theme);
  const label = `${view === 'shop' ? 'Shop' : 'Product page'} preview, ${device === 'phone' ? 'phone' : 'desktop'} size`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Segmented<View> ariaLabel="Preview page" size="sm" value={view} onChange={setView} options={[{ value: 'shop', label: 'Shop' }, { value: 'product', label: 'Product page' }]} />
        <Segmented<Device>
          ariaLabel="Preview size"
          size="sm"
          value={device}
          onChange={setDevice}
          options={[
            { value: 'phone', label: 'Phone', icon: SmartphoneIcon, iconOnly: true },
            { value: 'desktop', label: 'Desktop', icon: MonitorIcon, iconOnly: true },
          ]}
        />
      </div>
      <div ref={outer} role="img" aria-label={label} className={cn('overflow-hidden rounded-lg border border-line', device === 'phone' ? 'bg-sunken py-5' : 'bg-sunken p-3')}>
        <div className="mx-auto" style={{ width: w * scale, height: h * scale }}>
          <div
            className={cn('origin-top-left overflow-hidden', device === 'phone' ? 'rounded-[34px]' : 'rounded-md ring-1 ring-line')}
            style={{
              width: w,
              height: h,
              transform: `scale(${scale})`,
              background: theme.background,
              boxShadow: device === 'phone' ? '0 0 0 7px #1c1c1e, 0 18px 40px -12px rgba(0,0,0,0.35)' : '0 10px 30px -14px rgba(0,0,0,0.3)',
            }}
          >
            <PreviewFrame key={`${device}-${view}`} width={w} height={h} title={label}>
              <div style={{ background: theme.background, color: theme.text, fontFamily: fonts.body, padding: PAD[device], minHeight: h }}>
                {view === 'product' && first ? (
                  <ProductDetailView theme={theme} data={data} product={first} ordering={ordering} whatsappPhone={whatsappPhone} shopHref="#" productHref={() => '#'} shopKey={null} />
                ) : view === 'product' ? (
                  <p className="py-16 text-center text-[15px]" style={{ color: theme.mutedText }}>
                    Add a product to see its page.
                  </p>
                ) : (
                  <StorefrontView theme={theme} data={data} productHref={() => '#'} ordering={ordering} whatsappPhone={whatsappPhone} shopKey={null} />
                )}
              </div>
            </PreviewFrame>
          </div>
        </div>
      </div>
      <p className="text-caption text-fg-subtle">Scroll inside the preview to see the whole {view === 'shop' ? 'shop' : 'page'}. Taps are switched off here.</p>
    </div>
  );
}
