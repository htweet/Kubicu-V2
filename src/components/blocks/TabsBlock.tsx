import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { ContainerPlaceholder } from './ContainerPlaceholder';
import { useBlockChildren } from '../../contexts/BlockChildrenContext';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { useElementWidth } from '../../hooks/useElementWidth';
import { planAtLeast } from '../../data/plans';
import { MAX_CHILDREN, slotName } from '../../utils/containers';
import { cardRadius, fontsFor, mix } from './pageStyle';

/**
 * Tabs (D167): each block inside is one tab. Follows the WAI-ARIA tabs pattern (arrow keys, Home/End).
 * Narrow widths switch to an accordion when set; the Free plan shows every panel one under another.
 * Inactive panels stay rendered (hidden) so forms keep what visitors typed.
 */
export function TabsBlock({ block, theme, mode }: BlockProps<'tabs'>) {
  const ctx = useBlockChildren();
  const plan = useRenderPlan();
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const uid = useId().replace(/:/g, '');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const c = block.content;
  const kids = ctx?.childrenOf(block.id) ?? [];
  const selectedId = ctx?.selectedId ?? null;

  // On the canvas, selecting a block inside opens its tab.
  useEffect(() => {
    if (!selectedId) return;
    const i = kids.findIndex((k) => k.id === selectedId);
    if (i >= 0) {
      setActive(i);
      setOpen((prev) => new Set(prev).add(i));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!ctx) return mode === 'edit' ? <ContainerPlaceholder kind="tabs" theme={theme} /> : null;
  if (mode !== 'edit' && kids.length === 0) return null;

  const n = kids.length;
  const current = Math.min(active, Math.max(n - 1, 0));
  const unlocked = planAtLeast(plan.id, 'creator');
  const stacked = !unlocked;
  const accordion = unlocked && c.phoneStyle === 'accordion' && width > 0 && width < 560;
  const label = (i: number) => slotName(block, i, kids[i]);
  const accent = theme.accent === theme.text ? theme.text : theme.accent;
  const body = fontsFor(theme).body;
  const radius = Math.max(cardRadius(theme) - 4, 6);
  const panel = (i: number) => ctx.render(kids[i], theme, { index: i, count: n, container: block });

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % n;else
    if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;else
    if (e.key === 'Home') next = 0;else
    if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  let content: React.ReactNode = null;
  if (n > 0 && stacked) {
    content =
    <div className="flex flex-col gap-6">
        {kids.map((k, i) =>
      <section key={k.id} aria-label={label(i)}>
            <h3 className="mb-2 text-[17px] font-semibold" style={{ color: theme.text, fontFamily: body }}>
              {label(i)}
            </h3>
            {panel(i)}
          </section>
      )}
      </div>;

  } else if (n > 0 && accordion) {
    content =
    <div style={{ borderTop: `1px solid ${mix(theme.text, 16)}` }}>
        {kids.map((k, i) => {
        const isOpen = open.has(i);
        return (
          <div key={k.id} style={{ borderBottom: `1px solid ${mix(theme.text, 16)}` }}>
              <h3 className="m-0">
                <button
                type="button"
                id={`${uid}-acc-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${uid}-accp-${i}`}
                onClick={() =>
                setOpen((prev) => {
                  const s = new Set(prev);
                  if (s.has(i)) s.delete(i);else
                  s.add(i);
                  return s;
                })
                }
                className="flex min-h-[48px] w-full items-center justify-between gap-3 py-3 text-left text-[16px] font-semibold focus-visible:outline-none focus-visible:ring-2"
                style={{ color: theme.text, fontFamily: body, ['--tw-ring-color' as string]: theme.text }}>
                
                  {label(i)}
                  <ChevronDownIcon size={18} aria-hidden className="shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none" style={{ transform: isOpen ? 'rotate(180deg)' : undefined, color: theme.mutedText }} />
                </button>
              </h3>
              <div id={`${uid}-accp-${i}`} role="region" aria-labelledby={`${uid}-acc-${i}`} hidden={!isOpen} className="pb-4">
                {panel(i)}
              </div>
            </div>);

      })}
      </div>;

  } else if (n > 0) {
    content =
    <>
        <div
        role="tablist"
        aria-label="Sections"
        className="scroll-quiet -mx-1 mb-5 flex gap-1 overflow-x-auto overflow-y-hidden px-1"
        style={c.style === 'underline' ? { borderBottom: `1px solid ${mix(theme.text, 16)}` } : undefined}>
        
          {kids.map((k, i) => {
          const on = i === current;
          const pill = c.style === 'pills';
          return (
            <button
              key={k.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${uid}-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className="relative min-h-[44px] shrink-0 whitespace-nowrap px-4 text-[15px] font-semibold transition-[color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2"
              style={{
                fontFamily: body,
                color: pill ? on ? theme.accentText : theme.text : on ? theme.text : theme.mutedText,
                background: pill ? on ? accent : mix(theme.text, 6) : 'transparent',
                borderRadius: pill ? 999 : radius,
                ['--tw-ring-color' as string]: theme.text
              }}>
              
                {label(i)}
                {!pill && <span aria-hidden className="absolute inset-x-3 -bottom-px h-[2px] rounded-full" style={{ background: on ? accent : 'transparent' }} />}
              </button>);

        })}
        </div>
        {kids.map((k, i) =>
      <div key={k.id} role="tabpanel" id={`${uid}-panel-${i}`} aria-labelledby={`${uid}-tab-${i}`} hidden={i !== current} tabIndex={0} className="focus-visible:outline-none">
            {panel(i)}
          </div>
      )}
      </>;

  }

  return (
    <div ref={ref}>
      {content}
      {mode === 'edit' && n === 0 && <ContainerPlaceholder kind="tabs" theme={theme} hint="Empty tabs — each block you add is one tab" />}
      {mode === 'edit' && n < MAX_CHILDREN && ctx.addSlot?.(block, theme)}
    </div>);

}