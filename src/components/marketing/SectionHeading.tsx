import React from 'react';
import { Reveal } from './Reveal';
import { cn } from '../../utils/cn';

interface SectionHeadingProps {
  id: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

/** Website section heading: display title, optional lead and right-side action. */
export function SectionHeading({ id, title, lead, align = 'left', action, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn('flex flex-wrap items-end justify-between gap-6', align === 'center' && 'flex-col items-center text-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        <h2 id={id} className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-fg md:text-[40px]">
          {title}
        </h2>
        {lead && <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">{lead}</p>}
      </div>
      {action}
    </Reveal>);

}