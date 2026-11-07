import React from "react";
import { PanelLeftOpenIcon, PanelRightOpenIcon, BoxIcon } from "lucide-react";
import { useSideTip } from "../../hooks/useSideTip";
import { cn } from "../../utils/cn";
export interface RailItem {
  id: string;
  label: string;
  icon: BoxIcon;
  active?: boolean;
  badge?: number;
  onSelect: () => void;
}
interface PanelRailProps {
  side: 'left' | 'right';
  expandLabel: string;
  onExpand: () => void;
  items: RailItem[];
}

/** Slim icon rail shown when a canvas panel is collapsed. Every icon reopens the panel straight to that view. */
export function PanelRail({
  side,
  expandLabel,
  onExpand,
  items
}: PanelRailProps) {
  const tip = useSideTip(side === 'left' ? 'right' : 'left');
  const ExpandIcon = side === 'left' ? PanelLeftOpenIcon : PanelRightOpenIcon;
  const btn = (label: string, onClick: () => void, children: React.ReactNode, active = false) => <button type="button" aria-label={label} onClick={() => {
    tip.hide();
    onClick();
  }} onMouseEnter={tip.show(label)} onMouseLeave={tip.hide} onFocus={tip.show(label)} onBlur={tip.hide} className={cn('relative flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', active ? 'bg-action-soft text-action' : 'text-fg-muted hover:bg-sunken hover:text-fg')}>
      {children}
    </button>;
  return <div className="flex h-full flex-col items-center gap-1 bg-raised py-3">
      {btn(expandLabel, onExpand, <ExpandIcon size={19} strokeWidth={2.1} aria-hidden />)}
      <span aria-hidden className="my-1.5 h-px w-6 bg-line" />
      {items.map(it => <React.Fragment key={it.id}>
          {btn(it.badge ? `${it.label}, ${it.badge}` : it.label, it.onSelect, <>
              <it.icon size={19} strokeWidth={2.1} aria-hidden />
              {it.badge !== undefined && it.badge > 0 && <span aria-hidden className="absolute right-0 top-0 min-w-[18px] rounded-full bg-fg px-1 text-center text-[11px] font-semibold leading-[18px] text-canvas tabular-nums">{it.badge > 99 ? '99+' : it.badge}</span>}
            </>, it.active)}
        </React.Fragment>)}
      {tip.node}
    </div>;
}