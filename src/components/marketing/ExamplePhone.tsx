import React from 'react';
import type { PageDocument } from '../../types/page';
import { TemplateThumb } from '../templates/TemplateThumb';
import { cn } from '../../utils/cn';

interface ExamplePhoneProps {
  doc: PageDocument;
  /** Width on wide screens; phones get 75% of it. */
  width?: number;
  className?: string;
  /** Dark bezel on light bands, light bezel on dark ones. */
  bezel?: 'dark' | 'light';
}

/** A real, scaled render of an example page inside a phone bezel (D268). Decorative: callers caption it. */
export function ExamplePhone({ doc, width = 220, className, bezel = 'dark' }: ExamplePhoneProps) {
  const small = Math.round(width * 0.75);
  return (
    <div
      aria-hidden
      className={cn(
        'overflow-hidden rounded-[28px] border-[6px] shadow-3',
        bezel === 'dark' ? 'border-[rgb(18_18_20)] bg-[rgb(18_18_20)]' : 'border-white bg-white',
        className
      )}>
      
      <div className="hidden sm:block">
        <TemplateThumb doc={doc} width={width} height={Math.round(width * 2)} />
      </div>
      <div className="sm:hidden">
        <TemplateThumb doc={doc} width={small} height={Math.round(small * 2)} />
      </div>
    </div>);

}