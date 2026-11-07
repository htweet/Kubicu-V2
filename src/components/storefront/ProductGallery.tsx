import React from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Product, ShopProductPageStyle } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { mix } from '../blocks/pageStyle';

interface ProductGalleryProps {
  theme: PageTheme;
  product: Product;
  layout: ShopProductPageStyle;
  index: number;
  onIndex: (i: number) => void;
}

/** Product photos in the chosen product-page layout (D196). Stacked shows every photo; the others use thumbnails. */
export function ProductGallery({ theme, product, layout, index, onIndex }: ProductGalleryProps) {
  const soldOutStyle = product.variants.every((v) => product.trackStock && product.kind === 'physical' && v.stock <= 0) ? { filter: 'grayscale(0.6)' } : undefined;
  const ratio = layout === 'full' ? 'aspect-[4/5] md:aspect-[16/8]' : 'aspect-[4/5]';

  if (!product.images.length) {
    return (
      <div className={`flex ${ratio} w-full items-center justify-center rounded-lg`} style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
        <ShoppingBagIcon size={32} aria-hidden />
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className="scroll-quiet -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-5 md:mx-0 md:flex-col md:overflow-visible md:px-0">
        {product.images.map((img, i) => (
          <MediaImage key={img.id} src={img.url} alt={img.alt || `${product.name}, photo ${i + 1}`} className="aspect-[4/5] w-[85%] shrink-0 snap-center rounded-lg object-cover md:w-full" style={soldOutStyle} loading={i ? 'lazy' : undefined} />
        ))}
      </div>
    );
  }

  const image = product.images[index] ?? product.images[0];
  return (
    <div className="flex flex-col gap-3">
      <MediaImage src={image.url} alt={image.alt} className={`${ratio} w-full rounded-lg object-cover`} style={soldOutStyle} />
      {product.images.length > 1 && (
        <div className="scroll-quiet flex gap-2 overflow-x-auto overflow-y-hidden" role="group" aria-label="Product photos">
          {product.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Photo ${i + 1} of ${product.images.length}`}
              aria-pressed={i === index}
              onClick={() => onIndex(i)}
              className="h-20 w-16 shrink-0 overflow-hidden rounded-md transition-opacity duration-150"
              style={{ outline: i === index ? `2px solid ${theme.text}` : 'none', outlineOffset: 2, opacity: i === index ? 1 : 0.65 }}
            >
              <MediaImage src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
