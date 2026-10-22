import React from 'react';
import { MediaImage } from '../media/MediaImage';
import { DownloadIcon, ExternalLinkIcon, FileIcon, LinkIcon, ShieldCheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { CheckoutButton } from './CheckoutButton';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { canSell, findProduct, formatBytes } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';

export function DownloadBlock({ block, theme, mode }: BlockProps<'download'>) {
  const c = block.content;
  const catalog = useCatalog();
  const linked = c.source === 'catalog';
  const product = linked ? findProduct(catalog, c.productId) : undefined;

  if (linked) {
    if (!product || product.kind !== 'digital' || !canSell(product)) {
      return mode === 'edit' ?
      <BlockPlaceholder
        icon={LinkIcon}
        title={product ? `“${product.name}” isn’t ready to sell` : 'Choose a digital product'}
        hint={product ? 'It must be active with a scanned file. Visitors won’t see this block yet.' : 'Pick one from Commerce in the inspector.'}
        theme={theme} /> :

      null;
    }
    const asset = product.digital!;
    const ext = asset.fileName.split('.').pop()?.toUpperCase() ?? '';
    const limits = [asset.downloadLimit ? `${asset.downloadLimit} downloads` : null, asset.expiryDays ? `${asset.expiryDays}-day link` : null].filter(Boolean).join(' · ');
    const cover = product.images[0];
    return (
      <article className="flex gap-4 p-4" style={cardStyle(theme)}>
        {cover ?
        <MediaImage src={cover.url} alt={cover.alt} loading="lazy" className="h-24 w-20 shrink-0 rounded-md object-cover" /> :

        <span className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
            <FileIcon size={22} aria-hidden />
          </span>
        }
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[16px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title || product.name}</h3>
            <PageChip theme={theme}>{product.priceNgn !== null ? formatNgn(product.priceNgn) : 'Price on request'}</PageChip>
          </div>
          {(c.description || product.description) && <p className="mt-1 text-[13px] leading-snug" style={{ color: theme.mutedText }}>{c.description || product.description}</p>}
          <p className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>{[ext, formatBytes(asset.sizeBytes)].filter(Boolean).join(' · ')}</p>
          <CheckoutButton
            mode={mode}
            onAdd={(cart) => cart.add(product.id, product.variants[0]?.id)}
            className="mt-3 flex h-10 items-center justify-center gap-2 text-[14px] font-semibold"
            style={buttonStyle(theme, 'featured')}>
            
            {c.ctaLabel || 'Buy and download'}
          </CheckoutButton>
          <p className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: theme.mutedText }}>
            <ShieldCheckIcon size={11} aria-hidden />
            Delivered by secure link after payment{limits ? ` · ${limits}` : ''}
          </p>
        </div>
      </article>);

  }

  if (!c.title) {
    return mode === 'edit' ? <BlockPlaceholder icon={DownloadIcon} title="Add a file" hint="Title, format and a link to the file" theme={theme} /> : null;
  }
  const paid = c.access === 'paid';
  const meta = [c.format, c.fileSize].filter(Boolean).join(' · ');

  return (
    <article className="flex gap-4 p-4" style={cardStyle(theme)}>
      {c.coverUrl ?
      <MediaImage src={c.coverUrl} alt={c.coverAlt} loading="lazy" className="h-24 w-20 shrink-0 rounded-md object-cover" /> :

      <span className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
          <FileIcon size={22} aria-hidden />
        </span>
      }
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title}</h3>
          <PageChip theme={theme} tone={paid ? 'neutral' : 'muted'}>
            {paid ? c.priceNgn !== null ? formatNgn(c.priceNgn) : 'Paid' : 'Free'}
          </PageChip>
        </div>
        {c.description && <p className="mt-1 text-[13px] leading-snug" style={{ color: theme.mutedText }}>{c.description}</p>}
        {meta && <p className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>{meta}</p>}
        <PageAction
          mode={mode}
          href={c.url}
          className="mt-3 flex h-10 items-center justify-center gap-2 text-[14px] font-semibold"
          style={buttonStyle(theme, paid ? 'featured' : 'default')}
          ariaLabel={`${c.ctaLabel || (paid ? 'Buy' : 'Download')} ${c.title}${paid ? ' (opens the seller’s payment page)' : ''}`}>
          
          {paid ? <ExternalLinkIcon size={15} aria-hidden /> : <DownloadIcon size={15} aria-hidden />}
          {c.ctaLabel || (paid ? 'Buy' : 'Download')}
        </PageAction>
        {paid && <p className="mt-1.5 text-[11px]" style={{ color: theme.mutedText }}>Payment happens on the seller’s own checkout, not KUBICU.</p>}
      </div>
    </article>);

}