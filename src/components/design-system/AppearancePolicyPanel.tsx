import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, EyeIcon, HistoryIcon, StarIcon } from 'lucide-react';
import type { VisualDirection } from '../../types/direction';
import { visualDirections, type VisualDirectionInfo } from '../../data/visualDirections';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';
import { useDirectionControl } from '../../contexts/DirectionContext';
import { formatRelative } from '../../utils/format';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { cn } from '../../utils/cn';

/** Super-admin control over which appearances workspaces may choose, and the platform default. */
export function AppearancePolicyPanel() {
  const policy = useAppearancePolicy();
  const { direction, setDirection } = useDirectionControl();
  const [confirmWithdraw, setConfirmWithdraw] = useState<VisualDirectionInfo | null>(null);
  const defaultInfo = visualDirections.find((d) => d.id === policy.defaultDirection);

  const toggle = (d: VisualDirectionInfo, on: boolean) => {
    if (on) {
      policy.setEnabled(d.id, true);
      toast(`“${d.name}” is available to workspaces`);
    } else {
      setConfirmWithdraw(d);
    }
  };

  const makeDefault = (id: VisualDirection, name: string) => {
    policy.setDefault(id);
    toast(`“${name}” is now the default`, { description: 'New workspaces start with it. Existing choices are kept.' });
  };

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-3 sm:grid-cols-2">
        {visualDirections.map((d) => {
          const available = policy.enabled.includes(d.id);
          const isDefault = d.id === policy.defaultDirection;
          const previewing = d.id === direction;
          const lockedOn = isDefault || available && policy.enabled.length <= 1;
          return (
            <li key={d.id} className={cn('flex flex-col rounded-md border bg-raised', available ? 'border-line' : 'border-dashed border-line')}>
              <div className={cn('flex h-16 overflow-hidden rounded-t-md', !available && 'opacity-50')} aria-hidden>
                {d.swatches.map((c, i) =>
                <span key={c + i} className={i === 0 ? 'flex-[2]' : 'flex-1'} style={{ background: c }} />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-label font-semibold text-fg">{d.name}</h3>
                    {isDefault &&
                    <Badge tone="action" icon={StarIcon}>
                        Default
                      </Badge>
                    }
                    {!available && <Badge tone="neutral">Withdrawn</Badge>}
                  </div>
                  <p className="mt-1 text-caption text-fg-muted">{d.description}</p>
                  <p className="mt-1 text-caption text-fg-subtle">Inter throughout</p>
                </div>
                <div className="mt-auto flex flex-col gap-3 border-t border-line pt-3">
                  <Switch
                    id={`avail-${d.id}`}
                    label="Available to workspaces"
                    description={lockedOn ? isDefault ? 'The default is always available.' : 'At least one appearance must stay available.' : undefined}
                    checked={available}
                    disabled={lockedOn}
                    onChange={(on) => toggle(d, on)} />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={previewing ? CheckIcon : EyeIcon}
                      disabled={previewing}
                      onClick={() => setDirection(d.id)}>
                      
                      {previewing ? 'Previewing' : 'Preview'}
                    </Button>
                    {!isDefault &&
                    <Button size="sm" variant="tertiary" leadingIcon={StarIcon} onClick={() => makeDefault(d.id, d.name)}>
                        Make default
                      </Button>
                    }
                  </div>
                </div>
              </div>
            </li>);

        })}
      </ul>

      <p className="-mt-4 text-caption text-fg-subtle">
        Preview changes only your own console. Each workspace picks its own look from the available appearances (sidebar → <span className="font-medium text-fg-muted">Appearance</span>), and it applies to everyone in that workspace — so an agency’s client workspaces can each look different. Public pages always use their own page theme.
      </p>

      <section aria-labelledby="appearance-history">
        <div className="mb-2 flex items-center gap-2">
          <HistoryIcon size={15} className="text-fg-subtle" aria-hidden />
          <h3 id="appearance-history" className="text-label font-semibold text-fg">
            Change history
          </h3>
          <IllustrativeTag />
        </div>
        {policy.changes.length === 0 ?
        <p className="rounded-md border border-line px-4 py-3 text-caption text-fg-subtle">
            No changes yet. Both appearances are available; the default is {defaultInfo?.name}.
          </p> :

        <ol className="divide-y divide-line overflow-hidden rounded-md border border-line">
            {policy.changes.map((c) =>
          <li key={c.id} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-label text-fg">{c.summary}</span>
                <span className="shrink-0 text-caption text-fg-subtle">
                  {c.actor.split(' · ')[0]} · {formatRelative(c.at)}
                </span>
              </li>
          )}
          </ol>
        }
      </section>

      <Dialog
        open={!!confirmWithdraw}
        onClose={() => setConfirmWithdraw(null)}
        title={`Withdraw “${confirmWithdraw?.name}”?`}
        description="Workspace users won’t be able to pick it any more."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmWithdraw(null)}>
              Cancel
            </Button>
            <Button
            data-autofocus
            onClick={() => {
              if (confirmWithdraw) {
                policy.setEnabled(confirmWithdraw.id, false);
                toast(`“${confirmWithdraw.name}” withdrawn`, { description: `Affected users now see ${defaultInfo?.name}.` });
              }
              setConfirmWithdraw(null);
            }}>
            
              Withdraw
            </Button>
          </>
        }>
        
        <p className="pb-2 text-label text-fg-muted">
          Workspaces currently using it will switch to the default, <span className="font-medium text-fg">{defaultInfo?.name}</span>. Their choice is remembered and comes back if you make it available again. Public pages aren’t affected.
        </p>
      </Dialog>
    </div>);

}