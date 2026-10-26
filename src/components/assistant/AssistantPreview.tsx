import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CheckIcon, Loader2Icon, MonitorIcon, SmartphoneIcon } from 'lucide-react';
import type { AssistantSession } from '../../types/assistant';
import type { Block, PageDocument, PageTheme } from '../../types/page';
import { PageSurface } from '../blocks/PageSurface';
import { PageLayoutView } from '../blocks/PageLayoutView';
import { IconButton } from '../ui/IconButton';
import { blockName } from '../../utils/blocks';
import { cn } from '../../utils/cn';

type Viewport = 'phone' | 'desktop';

interface AssistantPreviewProps {
  session: AssistantSession;
  doc: PageDocument;
  blocks: Block[];
  theme: PageTheme;
  label: string;
  /** The page as it is now, while a change is proposed — shown under "Before". */
  before?: {blocks: Block[];theme: PageTheme;} | null;
  /** The section a change is about, or the one the owner tapped. */
  highlightId?: string;
  /** After the build: tapping a section starts a conversation about it. */
  onPickSection?: (blockId: string) => void;
}

interface SectionBox {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

const WIDTH: Record<Viewport, number> = { phone: 390, desktop: 1180 };

/** The page as it's being built, at a real phone or desktop width scaled to fit (D211). */
export function AssistantPreview({ session, doc, blocks, theme, label, before, highlightId, onPickSection }: AssistantPreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('phone');
  const [side, setSide] = useState<'after' | 'before'>('after');
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(600);
  const [innerH, setInnerH] = useState(800);
  const [boxes, setBoxes] = useState<SectionBox[]>([]);

  // A new proposal always opens on "After".
  useEffect(() => setSide('after'), [before]);

  const comparing = !!before && side === 'before';
  const shownBlocks = comparing ? before!.blocks : blocks;
  const shownTheme = comparing ? before!.theme : theme;

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (frameRef.current) setFrameW(frameRef.current.clientWidth);
      if (innerRef.current) setInnerH(innerRef.current.scrollHeight);
    });
    if (frameRef.current) ro.observe(frameRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [viewport]);

  const width = WIDTH[viewport];
  const scale = Math.min(1, (frameW - (viewport === 'phone' ? 48 : 32)) / width);
  const visible = shownBlocks.filter((b) => !b.visibility.hidden);
  const building = session.stage === 'building' || session.stage === 'paused';
  const total = session.plan?.units.length ?? 0;
  const measuring = !!onPickSection || !!highlightId;

  // Where each top-level section sits in the scaled frame, for tapping and highlighting.
  useLayoutEffect(() => {
    if (!measuring || !innerRef.current) return setBoxes([]);
    const measure = () => {
      const root = innerRef.current;
      if (!root) return;
      const base = root.getBoundingClientRect();
      const list: SectionBox[] = [];
      root.querySelectorAll<HTMLElement>('[data-preview-block]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height < 4) return;
        list.push({ id: el.dataset.previewBlock as string, top: r.top - base.top, left: r.left - base.left, width: r.width, height: r.height });
      });
      setBoxes(list);
    };
    const raf = window.requestAnimationFrame(measure);
    const t = window.setTimeout(measure, 300); // images and fonts settle
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [measuring, visible.length, shownBlocks, scale, innerH, viewport]);

  const byId = new Map(shownBlocks.map((b) => [b.id, b]));

  return (
    <section aria-label="Live preview" className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
        <div className="flex min-w-0 items-center gap-2 text-label">
          {building ? <Loader2Icon size={15} className={cn('shrink-0 text-action', session.stage === 'building' && 'animate-spin')} aria-hidden /> : null}
          <span className="truncate font-semibold text-fg">{comparing ? 'Your page now' : label}</span>
          {building &&
          <span className="shrink-0 text-fg-muted" aria-live="polite">
              {session.stage === 'paused' ? 'Paused · ' : ''}
              {Math.min(session.built, total)} of {total} sections
            </span>
          }
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {before &&
          <div role="group" aria-label="Compare" className="flex rounded-md border border-line bg-sunken p-0.5">
              {(['before', 'after'] as const).map((s) =>
            <button
              key={s}
              type="button"
              aria-pressed={side === s}
              onClick={() => setSide(s)}
              className={cn('h-8 rounded-[5px] px-2.5 text-caption font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', side === s ? 'bg-raised text-fg shadow-1 ring-1 ring-line-strong' : 'text-fg-muted hover:bg-raised/60')}>
              
                  {s === 'before' ? 'Before' : 'After'}
                </button>
            )}
            </div>
          }
          <div className="flex items-center gap-1" role="group" aria-label="Preview size">
            <IconButton icon={SmartphoneIcon} label="Phone preview" size="sm" active={viewport === 'phone'} aria-pressed={viewport === 'phone'} onClick={() => setViewport('phone')} />
            <IconButton icon={MonitorIcon} label="Desktop preview" size="sm" active={viewport === 'desktop'} aria-pressed={viewport === 'desktop'} onClick={() => setViewport('desktop')} />
          </div>
        </div>
      </div>

      {session.plan && (building || session.stage === 'done') && <BuildChecklist session={session} />}
      {onPickSection && <p className="shrink-0 border-b border-line bg-raised px-4 py-2 text-caption text-fg-muted">Tap a section to ask for a change to it.</p>}

      <div ref={frameRef} className="scroll-quiet min-h-0 flex-1 overflow-y-auto bg-sunken">
        <div className={cn('mx-auto py-6', viewport === 'phone' ? 'px-6' : 'px-4')} style={{ width: width * scale + (viewport === 'phone' ? 48 : 32) }}>
          <div className="relative" style={{ width: width * scale, height: Math.max(innerH * scale, 200) }}>
            <div
              aria-hidden
              className={cn('pointer-events-none absolute inset-0 overflow-hidden border border-line-strong shadow-2', viewport === 'phone' ? 'rounded-[28px]' : 'rounded-lg')}
              style={{ background: shownTheme.background }}>
              
              <div ref={innerRef} className="[container-type:inline-size]" style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <PageSurface theme={shownTheme} fluid>
                  <PageLayoutView doc={doc} blocks={visible} theme={shownTheme} mode="edit" wide={viewport === 'desktop'} />
                  {visible.length === 0 && <div className="p-10 text-center text-[15px] opacity-60">Your page will appear here.</div>}
                </PageSurface>
              </div>
            </div>

            {/* Tappable sections (after the build) and the highlighted one. */}
            {boxes.map((box) => {
              const b = byId.get(box.id);
              if (!b) return null;
              const lit = box.id === highlightId && !comparing;
              const style = { top: box.top, left: box.left, width: box.width, height: box.height };
              if (onPickSection && !comparing)
              return (
                <button
                  key={box.id}
                  type="button"
                  aria-label={`Ask for a change to the ${blockName(b).toLowerCase()} section`}
                  aria-pressed={lit}
                  onClick={() => onPickSection(box.id)}
                  className={cn(
                    'group absolute rounded-md outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-focus',
                    lit ? 'ring-2 ring-action' : 'hover:ring-2 hover:ring-action/60'
                  )}
                  style={style}>
                  
                    <span className={cn('absolute left-2 top-2 rounded-full bg-action px-2 py-0.5 text-[11px] font-semibold text-action-fg', lit ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}>
                      {blockName(b)}
                    </span>
                  </button>);

              return lit ? <span key={box.id} aria-hidden className="pointer-events-none absolute rounded-md ring-2 ring-action" style={style} /> : null;
            })}
          </div>
          <p className="sr-only">The preview shows {visible.length} visible sections.</p>
        </div>
      </div>
    </section>);

}

function BuildChecklist({ session }: {session: AssistantSession;}) {
  const plan = session.plan!;
  const total = plan.units.length;
  const done = session.stage === 'done';
  const steps = [
  { label: 'Page layout', state: done || session.built >= total ? 'done' : session.built > 0 ? 'doing' : 'todo' },
  { label: 'Theme', state: session.built > 0 || done ? 'done' : 'todo' },
  { label: 'Photos', state: !session.images.length ? 'skip' : done || session.built >= Math.min(3, total) ? 'done' : 'doing' },
  { label: 'Main action', state: done || session.built >= 2 ? 'done' : 'doing' },
  { label: 'Checks', state: done ? 'done' : 'todo' }] as
  const;
  return (
    <ol aria-label="Build progress" className="scroll-quiet flex shrink-0 gap-4 overflow-x-auto overflow-y-hidden border-b border-line px-4 py-2.5">
      {steps.map((s) =>
      <li key={s.label} className="flex shrink-0 items-center gap-1.5 text-caption">
          <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border',
            s.state === 'done' && 'border-success bg-success text-white',
            s.state === 'doing' && 'border-action',
            s.state === 'todo' && 'border-line-strong',
            s.state === 'skip' && 'border-dashed border-line-strong'
          )}
          aria-hidden>
          
            {s.state === 'done' && <CheckIcon size={10} strokeWidth={3} />}
            {s.state === 'doing' && <span className="h-1.5 w-1.5 rounded-full bg-action" />}
          </span>
          <span className={s.state === 'done' ? 'text-fg' : 'text-fg-muted'}>
            {s.label}
            <span className="sr-only"> — {s.state === 'done' ? 'done' : s.state === 'doing' ? 'in progress' : s.state === 'skip' ? 'skipped' : 'to do'}</span>
          </span>
        </li>
      )}
      {plan.gaps.length > 0 && !session.removed && <li className="ml-auto shrink-0 text-caption text-warning">{plan.gaps.length} to fill</li>}
    </ol>);

}