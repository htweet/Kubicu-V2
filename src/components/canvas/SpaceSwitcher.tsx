import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDownIcon, LayoutGridIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { spaceKinds } from '../../data/spaceKinds';
import { readSpacePage, workspaceSpaces } from '../../utils/spaces';
import { publicUrl } from '../../utils/format';
import { Menu, type MenuItem } from '../ui/Menu';
import { cn } from '../../utils/cn';

/** Which space is on the canvas (main page, campaign or DealRoom), and a quick way to switch (D50). */
export function SpaceSwitcher({ className, compact }: {className?: string;compact?: boolean;}) {
  const { current, currentSpace, switchSpace } = useWorkspace();
  const navigate = useNavigate();
  const { canAccessSpace } = useTeam();
  // Only the spaces you can edit (D57).
  const spaces = workspaceSpaces(current).filter((s) => !s.archivedAt && canAccessSpace(s.id));
  const Kind = spaceKinds[currentSpace.kind].icon;

  const items: MenuItem[] = [
  ...spaces.map((s) => {
    const handle = s.kind === 'main' ? null : readSpacePage(current.id, s.id)?.draft.handle;
    return {
      id: s.id,
      label: s.kind === 'main' ? 'Main page' : s.name,
      reason: s.kind === 'main' ? current.name : `${spaceKinds[s.kind].label}${handle ? ` · ${publicUrl(handle)}` : ''}`,
      icon: spaceKinds[s.kind].icon,
      selected: s.id === currentSpace.id,
      onSelect: () => {
        if (s.id === currentSpace.id) return;
        switchSpace(s.id);
        navigate('/app/canvas');
      }
    };
  }),
  { id: 'manage', label: 'All spaces', icon: LayoutGridIcon, onSelect: () => navigate('/app/spaces') }];


  return (
    <Menu
      align="start"
      className={className}
      items={items}
      trigger={(p) =>
      <button
        type="button"
        {...p}
        aria-label={`Space: ${currentSpace.kind === 'main' ? 'Main page' : currentSpace.name}. Switch space`}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-md text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          compact ? 'h-7 px-1.5' : 'h-8 px-2'
        )}>
        
          <span className={cn('flex items-center justify-center rounded-[6px]', compact ? 'h-5 w-5' : 'h-6 w-6', currentSpace.kind === 'main' ? 'bg-sunken text-fg-muted' : 'bg-action-soft text-action')}>
            <Kind size={compact ? 12 : 14} strokeWidth={2.25} aria-hidden />
          </span>
          {!compact && currentSpace.kind !== 'main' && <span className="text-caption font-semibold text-action">{spaceKinds[currentSpace.kind].label}</span>}
          <ChevronsUpDownIcon size={13} aria-hidden />
        </button>
      } />);


}