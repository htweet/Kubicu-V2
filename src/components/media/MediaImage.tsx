import React from 'react';
import { ImageIcon } from 'lucide-react';
import { useMediaSrc } from '../../hooks/useMediaSrc';
import { useDataSaver } from '../../contexts/DataSaverContext';
import { cn } from '../../utils/cn';

type MediaImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string };

/**
 * `<img>` that understands library references. A missing library image shows a quiet placeholder, never a broken icon.
 * In data saver (public pages only) the image waits, showing its description until the visitor taps "Show photos".
 */
export function MediaImage({ src, className, style, alt, ...rest }: MediaImageProps) {
  const resolved = useMediaSrc(src);
  const { imagesShown } = useDataSaver();
  if (!resolved) {
    return <span role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={cn('block bg-[rgba(127,127,127,0.16)]', className)} style={style} />;
  }
  if (!imagesShown) {
    return (
      <span role={alt ? 'img' : undefined} aria-label={alt ? `${alt} (photo not loaded to save data)` : undefined} aria-hidden={alt ? undefined : true} className={cn('flex items-center justify-center overflow-hidden bg-[rgba(127,127,127,0.14)] text-[rgba(127,127,127,0.9)]', className)} style={style}>
        <span className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
          <ImageIcon size={16} aria-hidden className="shrink-0" />
          {alt && <span className="line-clamp-2 text-[11px] leading-tight">{alt}</span>}
        </span>
      </span>
    );
  }
  return <img src={resolved} alt={alt} className={className} style={style} {...rest} />;
}
