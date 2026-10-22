import React from 'react';
import { CheckIcon } from 'lucide-react';
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
  const { direction, setDirection } = useDirectionControl();
  const { enabled, defaultDirection } = useAppearancePolicy();
  const options = visualDirections.filter((d) => enabled.includes(d.id));
  if (options.length < 2) return null;

  return (
    <div role="radiogroup" aria-label="Appearance" className={cn(variant === 'list' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-1.5', className)}>
      {options.map((d) => {
        const active = d.id === direction;
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
                active ? 'bg-action-soft' : 'hover:bg-sunken'
              )}>
              
              <DirectionDot info={d} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-fg">{d.name}</span>
                {d.id === defaultDirection && <span className="block text-caption text-fg-subtle">Default</span>}
              </span>
              {active && <CheckIcon size={17} className="shrink-0 text-action" aria-hidden />}
            </button>);

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
              active ? 'ring-2 ring-select' : 'ring-1 ring-transparent hover:ring-line-strong'
            )}>
            
            <DirectionDot info={d} size="md" />
          </button>);

      })}
    </div>);

}

export function DirectionDot({ info, size }: {info: VisualDirectionInfo;size: 'md' | 'lg';}) {
  const [canvas,,, accent] = info.swatches;
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 overflow-hidden rounded-full border border-line-strong', size === 'lg' ? 'h-8 w-8' : 'h-6 w-6')}>
      
      <span className="h-full w-1/2" style={{ background: canvas }} />
      <span className="h-full w-1/2" style={{ background: accent }} />
    </span>);

}