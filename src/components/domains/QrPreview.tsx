import React, { useEffect, useState } from 'react';
import { QrCodeIcon } from 'lucide-react';
import { qrSvg, svgDataUrl, type QrStyle } from '../../utils/domains/qr';
import { cn } from '../../utils/cn';

/** Renders a QR code from its link and style; reports the finished SVG for downloads. */
export function QrPreview({ url, style, alt, className, onReady }: { url: string; style: QrStyle; alt: string; className?: string; onReady?: (svg: string | null) => void }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const key = `${url}|${JSON.stringify(style)}`;

  useEffect(() => {
    let alive = true;
    qrSvg(url, style)
      .then((s) => {
        if (!alive) return;
        setSvg(s);
        setFailed(false);
        onReady?.(s);
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        onReady?.(null);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed)
    return (
      <div className={cn('flex aspect-square items-center justify-center rounded-md bg-sunken text-caption text-fg-muted', className)}>
        Couldn’t draw this code
      </div>
    );
  if (!svg)
    return (
      <div className={cn('flex aspect-square items-center justify-center rounded-md bg-sunken text-fg-subtle', className)} aria-hidden>
        <QrCodeIcon size={28} />
      </div>
    );
  // A checkerboard shows through transparent codes so the setting is visible.
  return (
    <img
      src={svgDataUrl(svg)}
      alt={alt}
      className={cn('block w-full rounded-md', className)}
      style={style.transparent ? { backgroundImage: 'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%)', backgroundSize: '16px 16px' } : undefined}
    />
  );
}
