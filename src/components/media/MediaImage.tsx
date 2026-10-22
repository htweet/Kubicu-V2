import React from 'react';
import { useMediaSrc } from '../../hooks/useMediaSrc';
import { cn } from '../../utils/cn';

type MediaImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {src: string;};

/** `<img>` that understands library references. A missing library image shows a quiet placeholder, never a broken icon. */
export function MediaImage({ src, className, style, alt, ...rest }: MediaImageProps) {
  const resolved = useMediaSrc(src);
  if (!resolved) {
    return <span role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={cn('block bg-[rgba(127,127,127,0.16)]', className)} style={style} />;
  }
  return <img src={resolved} alt={alt} className={className} style={style} {...rest} />;
}