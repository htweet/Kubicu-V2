import React from 'react';
import { StarIcon } from 'lucide-react';

/** Read-only star rating. Colour comes from the parent so it works in the app and on themed pages. */
export function Stars({ rating, size = 14, color }: {rating: number;size?: number;color?: string;}) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`} style={color ? { color } : undefined}>
      {[1, 2, 3, 4, 5].map((n) =>
      <StarIcon key={n} size={size} aria-hidden className={n <= Math.round(rating) ? 'fill-current' : 'opacity-30'} />
      )}
    </span>);

}