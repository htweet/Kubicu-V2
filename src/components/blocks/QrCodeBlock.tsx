import React from 'react';
import { useParams } from 'react-router-dom';
import { QrCodeIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { QrPreview } from '../domains/QrPreview';
import { styleOf } from '../../utils/domains/qr';
import { pageHref } from '../../utils/sitePages';
import { cardStyle } from './pageStyle';

const sizes = { sm: 140, md: 200, lg: 260 } as const;

/**
 * QR code (D170): this page (tagged ?src=qr so scans show as QR visits in Analytics) or any link.
 * Black on white for reliable scanning whatever the theme. Designed, printable codes stay in Domains & QR.
 */
export function QrCodeBlock({ block, theme, mode }: BlockProps<'qrCode'>) {
  const c = block.content;
  const { handle } = useParams();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kubicu.app';
  const url = c.target === 'url' ? c.url.trim() : `${origin}${pageHref(handle ?? 'your-page', '')}?src=qr`;
  if (!url || c.target === 'url' && !/^https?:\/\//i.test(url)) return mode === 'edit' ? <BlockPlaceholder icon={QrCodeIcon} title="Add a link for the code" hint="Or choose “This page”" theme={theme} /> : null;
  const px = sizes[c.size];
  return (
    <figure className="mx-auto flex w-fit flex-col items-center p-5" style={cardStyle(theme)}>
      <div className="rounded-md bg-white p-2" style={{ width: px }}>
        <QrPreview url={url} style={styleOf({ centre: false }, '')} alt={c.target === 'page' ? 'QR code that opens this page' : `QR code that opens ${url.replace(/^https?:\/\//, '')}`} />
      </div>
      {c.caption && <figcaption className="mt-3 max-w-[16rem] text-center text-[14px] font-medium" style={{ color: theme.text }}>{c.caption}</figcaption>}
      {mode === 'edit' && c.target === 'page' && <p className="mt-1 text-center text-[11px]" style={{ color: theme.mutedText }}>On your live page this opens your page’s address.</p>}
    </figure>);

}