import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '../../utils/cn';

interface IllustrativeTagProps {
  note?: string;
  className?: string;
}

export function IllustrativeTag({ note = 'Sample data for this prototype — not real.', className }: IllustrativeTagProps) {
  return (
    <Tooltip content={note}>
      <span
        tabIndex={0}
        className={cn(
          'inline-flex h-5 items-center gap-1 rounded-full border border-dashed border-line-strong px-1.5 text-meta font-medium text-fg-subtle',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          className,
        )}
      >
        <FlaskConicalIcon size={10} aria-hidden />
        Illustrative
      </span>
    </Tooltip>
  );
}
