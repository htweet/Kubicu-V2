import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Menu } from '../ui/Menu';
import { cn } from '../../utils/cn';
import { usePlan } from '../../contexts/PlanContext';
import { useWorkspace, workspaceInitials } from '../../contexts/WorkspaceContext';
import { plans } from '../../data/plans';
import type { SideTip } from '../../hooks/useSideTip';

interface WorkspaceSwitcherProps {
  compact?: boolean;
  onNavigate?: () => void;
  side?: 'top' | 'bottom';
  tip?: SideTip;
}

function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-action font-bold text-action-fg',
        size === 'md' ? 'h-9 w-9 text-label' : 'h-5 w-5 rounded-[5px] text-[10px]',
      )}
    >
      {workspaceInitials(name)}
    </span>
  );
}

export function WorkspaceSwitcher({ compact, onNavigate, side = 'bottom', tip }: WorkspaceSwitcherProps) {
  const plan = usePlan();
  const navigate = useNavigate();
  const { workspaces, current, switchTo } = useWorkspace();

  return (
    <Menu
      side={side}
      align="start"
      className={compact ? 'mx-auto' : 'w-full'}
      header={
        <div>
          <p className="text-caption font-semibold text-fg">Workspaces</p>
          <p className="text-caption text-fg-subtle">Each has its own page, look and plan</p>
        </div>
      }
      items={[
        ...workspaces.map((w) => ({
          id: w.id,
          label: w.name,
          reason: `${plans[w.plan].name} plan`,
          leading: <Initials name={w.name} size="sm" />,
          selected: w.id === current.id,
          onSelect: () => {
            if (w.id === current.id) return;
            switchTo(w.id);
            onNavigate?.();
            navigate('/app');
            toast(`Switched to ${w.name}`);
          },
        })),
        {
          id: 'new',
          label: 'New workspace',
          reason: 'Starts on Free, with its own plan, team and data',
          icon: PlusIcon,
          onSelect: () => {
            onNavigate?.();
            navigate('/start');
          },
        },
      ]}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Switch workspace (current: ${current.name})`}
          onMouseEnter={compact ? tip?.show(current.name) : undefined}
          onMouseLeave={tip?.hide}
          className={cn(
            'flex items-center gap-3 rounded-md text-left transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            compact ? 'h-11 w-11 justify-center hover:bg-sunken' : 'w-full border border-line bg-canvas p-2 hover:border-line-strong',
          )}
        >
          <Initials name={current.name} />
          {!compact && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-semibold text-fg">{current.name}</span>
                <span className="block truncate text-caption text-fg-subtle">{plan.name} plan</span>
              </span>
              <ChevronsUpDownIcon size={15} className="shrink-0 text-fg-subtle" aria-hidden />
            </>
          )}
        </button>
      )}
    />
  );
}
