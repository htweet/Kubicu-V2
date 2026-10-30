import React from 'react';
import { ChevronDownIcon, FileTextIcon, HomeIcon, Settings2Icon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useT } from '../../contexts/LocaleContext';
import { Menu, type MenuItem } from '../ui/Menu';
import { homeLabel, pageTitle, sitePages } from '../../utils/sitePages';
import { cn } from '../../utils/cn';

interface PageSwitcherProps {
  /** Opens the Pages manager. */
  onManage: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

/** Which page of the site is on the canvas, and a quick way to switch. Page names show as the owner typed them. */
export function PageSwitcher({ onManage, className, size = 'md' }: PageSwitcherProps) {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const site = state.site;
  const pages = sitePages(site);

  const items: MenuItem[] = [
  { id: 'home', label: homeLabel(site), icon: HomeIcon, selected: state.activePageId === null, onSelect: () => actions.setPage(null) },
  ...pages.map((p) => ({
    id: p.id,
    label: p.title || tr('Untitled'),
    reason: `/${p.path}${p.hideFromNav ? ` · ${tr('not in menu')}` : ''}`,
    icon: FileTextIcon,
    selected: state.activePageId === p.id,
    onSelect: () => actions.setPage(p.id)
  })),
  { id: 'manage', label: pages.length ? tr('Manage pages') : tr('Add a page'), icon: Settings2Icon, onSelect: onManage }];


  return (
    <Menu
      align="start"
      className={className}
      items={items}
      trigger={(p) =>
      <button
        type="button"
        {...p}
        aria-label={tr('Page: {name}. Switch page', { name: pageTitle(site, state.activePageId) })}
        className={cn(
          'inline-flex max-w-[180px] items-center gap-1.5 rounded-md border border-line bg-raised font-medium text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          size === 'sm' ? 'h-7 px-2 text-caption' : 'h-8 px-2.5 text-label'
        )}>
        
          {state.activePageId === null ? <HomeIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden /> : <FileTextIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />}
          <span className="truncate">{pageTitle(site, state.activePageId)}</span>
          {pages.length > 0 && <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{pages.length + 1}</span>}
          <ChevronDownIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
        </button>
      } />);


}