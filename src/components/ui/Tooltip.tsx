import React from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom';
  align?: 'center' | 'start' | 'end';
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, side = 'top', align = 'center', children, className }: TooltipProps) {
  return (
    <span className={cn('group/tip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-[240px] rounded-sm bg-inverse px-2.5 py-1.5 text-caption font-medium text-fg-inverse shadow-2',
          'opacity-0 transition-[opacity,transform] duration-150 ease-out',
          'group-hover/tip:opacity-100 group-hover/tip:delay-300 group-focus-within/tip:opacity-100',
          side === 'top' ? 'bottom-full mb-2 translate-y-1 group-hover/tip:translate-y-0' : 'top-full mt-2 -translate-y-1 group-hover/tip:translate-y-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'start' && 'left-0',
          align === 'end' && 'right-0'
        )}>
        
        {content}
      </span>
    </span>);

}