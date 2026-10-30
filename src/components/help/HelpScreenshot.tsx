import React from 'react';
import { ChevronRightIcon, LockIcon, SearchIcon } from 'lucide-react';
import type { HelpShot, HelpShotItem } from '../../types/help';
import { cn } from '../../utils/cn';

const APP_NAV = ['Overview', 'My Spaces', 'Media', 'Templates', 'Commerce', 'Bookings', 'Audience', 'Short links', 'Analytics', 'Automations', 'Extensions', 'Settings'];
const CANVAS_TABS = ['Blocks', 'Layers', 'Pages', 'Templates', 'Check'];

/**
 * A labelled picture of a KUBICU screen for the help guide (D274). Drawn from a short description rather
 * than captured, so it never goes stale or shows anyone's real data. Numbered markers match the steps.
 */
export function HelpScreenshot({ shot, compact }: {shot: HelpShot;compact?: boolean;}) {
  return (
    <figure className="m-0">
      <div aria-hidden className={cn('overflow-hidden rounded-2xl border border-line-strong bg-sunken', compact ? 'p-2' : 'p-3 md:p-5')}>
        {shot.frame === 'app' && <AppFrame shot={shot} />}
        {shot.frame === 'canvas' && <CanvasFrame shot={shot} />}
        {shot.frame === 'phone' && <PhoneFrame shot={shot} />}
        {shot.frame === 'site' && <SiteFrame shot={shot} />}
      </div>
      {!compact &&
      <figcaption className="mt-2 text-caption text-fg-subtle">
          Illustration of “{shot.title}”. Numbers match the steps; your own details will differ.
        </figcaption>
      }
    </figure>);

}

function AppFrame({ shot }: {shot: HelpShot;}) {
  const nav = shot.nav && !APP_NAV.includes(shot.nav) ? [...APP_NAV.slice(0, 9), shot.nav, ...APP_NAV.slice(9)] : APP_NAV;
  return (
    <div className="flex min-h-[300px] overflow-hidden rounded-xl border border-line bg-raised shadow-sm">
      <div className="hidden w-[150px] shrink-0 flex-col gap-0.5 border-r border-line bg-sunken/60 p-2.5 sm:flex">
        <div className="mb-2 flex items-center gap-2 px-1.5">
          <span className="h-5 w-5 rounded-md bg-fg" />
          <span className="text-[11px] font-bold text-fg">Workspace</span>
        </div>
        {nav.map((n) =>
        <span key={n} className={cn('truncate rounded-md px-2 py-1 text-[11px]', n === shot.nav ? 'bg-action-soft font-semibold text-action' : 'text-fg-muted')}>
            {n}
          </span>
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        {shot.sheet && <div className="absolute inset-0 bg-fg/10" />}
        <div className={cn('flex flex-col gap-3 p-4', shot.sheet && 'opacity-60')}>
          <Header shot={shot} />
          {!shot.sheet && <Items items={shot.items} />}
        </div>
        {shot.sheet &&
        <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-[340px] flex-col gap-3 border-l border-line bg-raised p-4 shadow-xl">
            <p className="text-[13px] font-bold text-fg">{shot.sheet}</p>
            <Items items={shot.items} />
          </div>
        }
      </div>
    </div>);

}

function Header({ shot }: {shot: HelpShot;}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        {shot.path &&
        <p className="flex flex-wrap items-center gap-0.5 text-[10.5px] text-fg-subtle">
            {shot.path.split('→').map((p, i, all) =>
          <React.Fragment key={i}>
                {p.trim()}
                {i < all.length - 1 && <ChevronRightIcon size={10} />}
              </React.Fragment>
          )}
          </p>
        }
        <p className="text-[15px] font-bold leading-tight text-fg">{shot.title}</p>
      </div>
      {shot.actions &&
      <div className="flex flex-wrap gap-1.5">
          {shot.actions.map((a, i) =>
        <Item key={i} item={a} />
        )}
        </div>
      }
    </div>);

}

function CanvasFrame({ shot }: {shot: HelpShot;}) {
  return (
    <div className="flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-line bg-raised shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <span className="text-[11px] font-semibold text-fg">{shot.path ?? 'My page'}</span>
        <span className="flex gap-1.5">
          <span className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-fg-muted">Preview</span>
          <span className="rounded-md bg-action px-2 py-0.5 text-[10.5px] font-semibold text-action-fg">Publish</span>
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[132px] shrink-0 flex-col gap-0.5 border-r border-line p-2 sm:flex">
          {CANVAS_TABS.map((t) =>
          <span key={t} className={cn('rounded-md px-2 py-1 text-[11px]', t === shot.nav ? 'bg-action-soft font-semibold text-action' : 'text-fg-muted')}>
              {t}
            </span>
          )}
        </div>
        <div className="hidden flex-1 items-start justify-center bg-sunken/70 p-4 md:flex">
          <div className="flex w-[150px] flex-col gap-2 rounded-[18px] border border-line bg-raised p-3">
            <span className="mx-auto h-9 w-9 rounded-full bg-line-strong" />
            <span className="mx-auto h-2 w-20 rounded bg-line-strong" />
            <span className="h-6 rounded-md bg-line" />
            <span className="h-6 rounded-md bg-line ring-2 ring-action" />
            <span className="h-6 rounded-md bg-line" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 border-l border-line p-4 md:w-[260px]">
          <p className="text-[13px] font-bold text-fg">{shot.title}</p>
          <Items items={shot.items} />
        </div>
      </div>
    </div>);

}

function PhoneFrame({ shot }: {shot: HelpShot;}) {
  return (
    <div className="mx-auto w-full max-w-[290px] rounded-[34px] border-[6px] border-fg bg-raised p-3 shadow-lg">
      <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-line-strong" />
      {shot.path && <p className="mb-2 flex items-center justify-center gap-1 truncate text-[10px] text-fg-subtle"><LockIcon size={9} /> {shot.path}</p>}
      <p className="mb-3 text-center text-[14px] font-bold text-fg">{shot.title}</p>
      <Items items={shot.items} />
    </div>);

}

function SiteFrame({ shot }: {shot: HelpShot;}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-raised shadow-sm">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1 rounded-md bg-sunken px-2 py-0.5 text-[10.5px] text-fg-subtle">
          <SearchIcon size={10} /> <span className="truncate">{shot.path ?? 'kub.icu'}</span>
        </span>
      </div>
      <div className="mx-auto flex max-w-[460px] flex-col gap-3 p-5">
        <p className="text-[16px] font-bold text-fg">{shot.title}</p>
        <Items items={shot.items} />
      </div>
    </div>);

}

/** Consecutive buttons sit in one row, like a real toolbar. */
function Items({ items }: {items: HelpShotItem[];}) {
  const groups: HelpShotItem[][] = [];
  items.forEach((it) => {
    const last = groups[groups.length - 1];
    if (it.kind === 'button' && last && last[0].kind === 'button') last.push(it);else
    groups.push([it]);
  });
  return (
    <div className="flex flex-col gap-2.5">
      {groups.map((g, i) =>
      g[0].kind === 'button' ?
      <div key={i} className="flex flex-wrap gap-1.5">
            {g.map((it, j) =>
        <Item key={j} item={it} />
        )}
          </div> :

      <Item key={i} item={g[0]} />

      )}
    </div>);

}

function Marker({ n }: {n?: number;}) {
  if (!n) return null;
  return (
    <span className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-action text-[10.5px] font-bold text-action-fg ring-2 ring-raised">
      {n}
    </span>);

}

function Item({ item }: {item: HelpShotItem;}) {
  const ring = 'marker' in item && item.marker ? 'ring-2 ring-action/70' : '';
  switch (item.kind) {
    case 'heading':
      return (
        <div>
          <p className="text-[12.5px] font-bold text-fg">{item.label}</p>
          {item.sub && <p className="text-[11px] text-fg-muted">{item.sub}</p>}
        </div>);

    case 'button':
      return (
        <span className={cn('relative inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 text-[11px] font-semibold', item.primary ? 'bg-action text-action-fg' : 'border border-line-strong text-fg', ring)}>
          {item.label}
          <Marker n={item.marker} />
        </span>);

    case 'field':
      return (
        <div className={cn('relative rounded-md', ring)}>
          <p className="mb-0.5 text-[10.5px] font-semibold text-fg-muted">{item.label}</p>
          <p className="truncate rounded-md border border-line-strong bg-field px-2 py-1.5 text-[11px] text-fg">{item.value || '\u00a0'}</p>
          <Marker n={item.marker} />
        </div>);

    case 'toggle':
      return (
        <div className={cn('relative flex items-center justify-between gap-2 rounded-md py-0.5', ring)}>
          <span className="text-[11px] text-fg">{item.label}</span>
          <span className={cn('flex h-4 w-7 shrink-0 items-center rounded-full p-0.5', item.on ? 'justify-end bg-action' : 'justify-start bg-line-strong')}>
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          <Marker n={item.marker} />
        </div>);

    case 'tabs':
      return (
        <div className={cn('relative flex gap-3 overflow-hidden border-b border-line', ring)}>
          {item.tabs.map((t, i) =>
          <span key={t} className={cn('whitespace-nowrap pb-1.5 text-[11px]', i === (item.active ?? 0) ? 'border-b-2 border-action font-semibold text-fg' : 'text-fg-muted')}>
              {t}
            </span>
          )}
          <Marker n={item.marker} />
        </div>);

    case 'chips':
      return (
        <div className={cn('relative flex flex-wrap gap-1.5 rounded-md', ring)}>
          {item.chips.map((c, i) =>
          <span key={c} className={cn('rounded-full px-2 py-0.5 text-[10.5px]', i === item.active ? 'bg-fg text-raised' : 'border border-line text-fg-muted')}>
              {c}
            </span>
          )}
          <Marker n={item.marker} />
        </div>);

    case 'row':
      return (
        <div className={cn('relative flex items-center justify-between gap-2 rounded-md border border-line px-2.5 py-2', ring)}>
          <span className="min-w-0">
            <span className="block truncate text-[11.5px] font-semibold text-fg">{item.label}</span>
            {item.meta && <span className="block truncate text-[10.5px] text-fg-muted">{item.meta}</span>}
          </span>
          {item.badge && <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[10px] font-semibold text-fg-muted">{item.badge}</span>}
          <Marker n={item.marker} />
        </div>);

    case 'stats':
      return (
        <div className={cn('relative grid grid-cols-2 gap-2 sm:grid-cols-4', ring)}>
          {item.stats.map((s, i) =>
          <div key={s.label} className="rounded-md border border-line px-2.5 py-2">
              <p className="truncate text-[10px] text-fg-muted">{s.label}</p>
              <p className={cn('font-bold text-fg', i === 0 ? 'text-[16px]' : 'text-[13px]')}>{s.value}</p>
            </div>
          )}
          <Marker n={item.marker} />
        </div>);

    case 'chart':
      return (
        <div className={cn('relative rounded-md border border-line p-2.5', ring)}>
          {item.label && <p className="mb-1.5 text-[10.5px] font-semibold text-fg-muted">{item.label}</p>}
          <div className="flex h-14 items-end gap-1">
            {[30, 45, 38, 60, 52, 70, 64, 80, 72, 88, 76, 95].map((h, i) =>
            <span key={i} className="flex-1 rounded-sm bg-action/70" style={{ height: `${h}%` }} />
            )}
          </div>
          <Marker n={item.marker} />
        </div>);

    case 'note':
      return (
        <p className={cn('relative rounded-md px-2.5 py-2 text-[11px] leading-snug', item.tone === 'warning' ? 'bg-warning-soft text-warning' : item.tone === 'success' ? 'bg-success-soft text-success' : 'bg-info-soft text-info', ring)}>
          {item.label}
          <Marker n={item.marker} />
        </p>);

    case 'chat':
      return (
        <div className={cn('flex', item.from === 'you' ? 'justify-end' : 'justify-start')}>
          <p className={cn('relative max-w-[85%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug', item.from === 'you' ? 'rounded-br-sm bg-action text-action-fg' : 'rounded-bl-sm bg-sunken text-fg', ring)}>
            {item.label}
            <Marker n={item.marker} />
          </p>
        </div>);

  }
}