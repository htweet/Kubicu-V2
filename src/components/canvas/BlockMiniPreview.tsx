import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { BlockType, PageTheme } from '../../types/page';
import { createBlock } from '../../utils/blocks';
import { BlockRenderer } from '../blocks/BlockRenderer';
import { fontsFor } from '../blocks/pageStyle';

interface BlockMiniPreviewProps {
  type: BlockType;
  theme: PageTheme;
  /** Rendered width of the preview box in px; the block is drawn at 360px and scaled down. */
  width: number;
  height: number;
}

const DRAW = 360;

/**
 * A real, scaled-down rendering of a block with its default content in the page's theme (D166).
 * Decorative and inert — the card around it carries the name and the action. Renders only once visible.
 */
export function BlockMiniPreview({ type, theme, width, height }: BlockMiniPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const block = useMemo(() => createBlock(type), [type]);
  const scale = width / DRAW;

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      aria-hidden
      // inert: nothing inside a preview can be focused or clicked.
      {...{ inert: '' } as Record<string, string>}
      className="pointer-events-none relative overflow-hidden"
      style={{ width, height, background: theme.material?.backdrop ?? theme.background, color: theme.text, fontFamily: fontsFor(theme).body }}>
      
      {visible &&
      <div className="absolute left-0 top-0 origin-top-left p-4" style={{ width: DRAW, transform: `scale(${scale})` }}>
          <BlockRenderer block={block} theme={theme} mode="edit" />
        </div>
      }
    </div>);

}