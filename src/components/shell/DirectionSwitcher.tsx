import React from 'react';
import { CheckIcon, MonitorIcon } from 'lucide-react';
import { visualDirections, type VisualDirectionInfo } from '../../data/visualDirections';
import { useDirectionControl } from '../../contexts/DirectionContext';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';
import { cn } from '../../utils/cn';

interface DirectionSwitcherProps {
  /** `swatches`: compact row of dots. `list`: full-width rows with names (mobile sheet). */
  variant?: 'swatches' | 'list';
  className?: string;
}

/** Lets a workspace user choose how KUBICU looks for them, from the appearances super admin allows. */
export function DirectionSwitcher({ variant = 'swatches', className }: DirectionSwitcherProps) {
  const { direction, preference, systemAvailable, setDirection } = useDirectionControl();
  const { enabled, defaultDirection } = useAppearancePolicy();
  const options = visualDirections.filter((d) => enabled.includes(d.id));
  const isSystem = preference === 'system' && systemAvailable;
  const current = visualDirections.find((d) => d.id === direction);
  if (options.length < 2) return null;

  return (
    <div role="radiogroup" aria-label="Appearance" className={cn(variant === 'list' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-1.5', className)}>
      {systemAvailable &&
        (variant === 'list' ? (
          <button
            type="button"
            role="radio"
            aria-checked={isSystem}
            onClick={() => setDirection('system')}
            className={cn(
              'flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 text-left transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isSystem ? 'bg-action-soft' : 'hover:bg-sunken',
            )}
          >
            <SystemDot size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-fg">System</span>
              <span className="block text-caption text-fg-subtle">{isSystem && current ? `Matches your device · now ${current.name}` : 'Matches your device’s light or dark setting'}</span>
            </span>
            {isSystem && <CheckIcon size={17} className="shrink-0 text-action" aria-hidden />}
          </button>
        ) : (
          <button
            type="button"
            role="radio"
            aria-checked={isSystem}
            aria-label="System — match device"
            title="System — match device"
            onClick={() => setDirection('system')}
            className={cn(
              'rounded-full p-0.5 transition-[box-shadow] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isSystem ? 'ring-2 ring-select' : 'ring-1 ring-transparent hover:ring-line-strong',
            )}
          >
            <SystemDot size="md" />
          </button>
        ))}
      {options.map((d) => {
        const active = !isSystem && d.id === direction;
        if (variant === 'list') {
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setDirection(d.id)}
              className={cn(
                'flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                active ? 'bg-action-soft' : 'hover:bg-sunken',
              )}
            >
              <DirectionDot info={d} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-fg">{d.name}</span>
                {d.id === defaultDirection && <span className="block text-caption text-fg-subtle">Default</span>}
              </span>
              {active && <CheckIcon size={17} className="shrink-0 text-action" aria-hidden />}
            </button>
          );
        }
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={d.name}
            title={d.name}
            onClick={() => setDirection(d.id)}
            className={cn(
              'rounded-full p-0.5 transition-[box-shadow] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              active ? 'ring-2 ring-select' : 'ring-1 ring-transparent hover:ring-line-strong',
            )}
          >
            <DirectionDot info={d} size="md" />
          </button>
        );
      })}
    </div>
  );
}

export function DirectionDot({ info, size }: { info: VisualDirectionInfo; size: 'md' | 'lg' }) {
  const [canvas, , , accent] = info.swatches;
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 overflow-hidden rounded-full border border-line-strong', size === 'lg' ? 'h-8 w-8' : 'h-6 w-6')}
    >
      <span className="h-full w-1/2" style={{ background: canvas }} />
      <span className="h-full w-1/2" style={{ background: accent }} />
    </span>
  );
}

/** System mode marker: half dark, half light, with a small screen icon. */
export function SystemDot({ size }: { size: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong', size === 'lg' ? 'h-8 w-8' : 'h-6 w-6')}
    >
      <span className="absolute inset-y-0 left-0 w-1/2" style={{ background: '#0F1014' }} />
      <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: '#F7F5F0' }} />
      <span className="relative flex items-center justify-center rounded-full p-[3px]" style={{ background: '#6B8CFF' }}>
        <MonitorIcon size={size === 'lg' ? 11 : 9} strokeWidth={2.5} color="#FFFFFF" />
      </span>
    </span>
  );
}
