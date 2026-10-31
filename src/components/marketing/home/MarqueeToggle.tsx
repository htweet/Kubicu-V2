import React from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { useT } from '../../../contexts/LocaleContext';
import { cn } from '../../../utils/cn';

/**
 * A visible pause/play control for a moving strip (D430, WCAG 2.2.2). Hover and keyboard focus already pause it;
 * this gives touch users the same control. Hidden when the visitor has asked for reduced motion, since the strip
 * doesn't move then.
 */
export function MarqueeToggle({ paused, onToggle, className }: {paused: boolean;onToggle: () => void;className?: string;}) {
  const { t } = useT();
  const label = paused ? t('Play moving examples') : t('Pause moving examples');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(20_20_18)] text-white transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-cobalt))] focus-visible:ring-offset-2 motion-reduce:hidden',
        className
      )}>
      
      {paused ? <PlayIcon size={16} fill="currentColor" aria-hidden /> : <PauseIcon size={16} fill="currentColor" aria-hidden />}
    </button>);

}