import React from 'react';
import { ChevronsUpDownIcon } from 'lucide-react';
import { Menu } from '../ui/Menu';
import { DirectionDot, SystemDot } from './DirectionSwitcher';
import { visualDirections } from '../../data/visualDirections';
import { useDirectionControl } from '../../contexts/DirectionContext';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { SideTip } from '../../hooks/useSideTip';
import { cn } from '../../utils/cn';

/** Compact appearance control for the sidebar: one row that opens the list of allowed looks. */
export function AppearancePicker({ collapsed, tip }: {collapsed?: boolean;tip?: SideTip;}) {
  const { direction, preference, systemAvailable, setDirection } = useDirectionControl();
  const { enabled, defaultDirection } = useAppearancePolicy();
  const workspace = useWorkspace().current;
  const options = visualDirections.filter((d) => enabled.includes(d.id));
  const active = visualDirections.find((d) => d.id === direction) ?? visualDirections[0];
  const isSystem = preference === 'system' && systemAvailable;
  const activeName = isSystem ? `System · ${active.name}` : active.name;
  if (options.length < 2) return null;

  return (
    <Menu
      side="top"
      align="start"
      className={collapsed ? 'mx-auto' : 'w-full'}
      header={
      <div>
          <p className="text-caption font-semibold text-fg">Workspace appearance</p>
          <p className="text-caption text-fg-subtle">Everyone in {workspace.name} sees this. Public pages keep their own theme.</p>
        </div>
      }
      items={[
      ...(systemAvailable ?
      [
      {
        id: 'system',
        label: 'System — match device',
        leading: <SystemDot size="md" />,
        selected: isSystem,
        onSelect: () => setDirection('system')
      }] :

      []),
      ...options.map((d) => ({
        id: d.id,
        label: d.id === defaultDirection ? `${d.name} (default)` : d.name,
        leading: <DirectionDot info={d} size="md" />,
        selected: !isSystem && d.id === direction,
        onSelect: () => setDirection(d.id)
      }))]
      }
      trigger={(props) =>
      <button
        type="button"
        {...props}
        aria-label={`Appearance: ${activeName}`}
        onMouseEnter={collapsed ? tip?.show(`Appearance · ${activeName}`) : undefined}
        onMouseLeave={tip?.hide}
        className={cn(
          'flex h-10 items-center gap-3 rounded-md text-label transition-colors duration-150 hover:bg-sunken',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          collapsed ? 'w-10 justify-center' : 'w-full px-2'
        )}>
        
          {isSystem ? <SystemDot size="md" /> : <DirectionDot info={active} size="md" />}
          {!collapsed &&
        <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-fg">{isSystem ? 'System' : active.name}</span>
                {isSystem && <span className="block truncate text-caption text-fg-subtle">Now {active.name}</span>}
              </span>
              <ChevronsUpDownIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
            </>
        }
        </button>
      } />);


}