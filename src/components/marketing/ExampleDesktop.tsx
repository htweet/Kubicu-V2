import React from 'react';
import type { PageDocument } from '../../types/page';
import { PageSurface } from '../blocks/PageSurface';
import { PageLayoutView } from '../blocks/PageLayoutView';
import { cn } from '../../utils/cn';

const WIDTH = 1200;

interface ExampleDesktopProps {
  doc: PageDocument;
  /** Rendered width of the browser window on screen. */
  width?: number;
  /** Rendered height of the visible page area. */
  height?: number;
  /** Address shown in the browser bar. */
  address?: string;
  className?: string;
}

/** A real, scaled render of an example page in its computer arrangement, in a light browser frame (D273). Decorative. */
export function ExampleDesktop({ doc, width = 720, height = 440, address = 'kub.icu/you', className }: ExampleDesktopProps) {
  const scale = width / WIDTH;
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);
  return (
    <div aria-hidden className={cn('overflow-hidden rounded-[18px] bg-[rgb(18_18_20)] shadow-3', className)} style={{ width }}>
      <div className="flex h-9 items-center gap-3 px-4">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </span>
        <span className="mx-auto truncate rounded-full bg-white/10 px-4 py-0.5 font-mono text-[11px] text-white/70">{address}</span>
        <span className="w-[42px]" />
      </div>
      <div className="pointer-events-none relative overflow-hidden" style={{ height, background: doc.theme.background }}>
        <div className="[container-type:inline-size]" style={{ width: WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <PageSurface theme={doc.theme} fluid>
            <PageLayoutView doc={doc} blocks={visible} theme={doc.theme} mode="edit" wide />
          </PageSurface>
        </div>
      </div>
    </div>
  );
}
