import React, { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { siteKits, type SiteKit } from '../../data/siteKits';
import { useEditor } from '../../contexts/EditorContext';
import { sitePages } from '../../utils/sitePages';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { UpgradeButton } from '../ui/UpgradeButton';
import type { WorkspacePlan } from '../../types/plan';
import { cn } from '../../utils/cn';

interface SiteKitDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pages the plan still allows. */
  room: number;
  nextPlan?: {id: WorkspacePlan;name: string;};
}

/** Pages → "Add a ready-made site" (D127): pick a kit, untick pages you don't want, add them in one step. */
export function SiteKitDialog({ open, onClose, room, nextPlan }: SiteKitDialogProps) {
  const { state, actions } = useEditor();
  const [kit, setKit] = useState<SiteKit>(siteKits[0]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const taken = new Set(sitePages(state.site).map((p) => p.title.trim().toLowerCase()));

  // Preselect only what fits the plan, so "Add" works straight away instead of sitting disabled.
  useEffect(() => {
    if (open) setPicked(new Set(kit.pages.filter((p) => !taken.has(p.title.toLowerCase())).slice(0, Math.max(0, room)).map((p) => p.title)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kit, room]);

  const noRoom = room <= 0;
  const over = picked.size > room;
  const add = () => {
    if (picked.size === 0 || over) return;
    let n = 0;
    try {
      n = actions.addPages(kit.pages.filter((p) => picked.has(p.title)).map((p) => ({ title: p.title, blocks: p.build() })));
    } catch {
      toast.error('Couldn’t add those pages', { description: 'Nothing was changed. Try again.' });
      return;
    }
    onClose();
    if (n === 0) {
      toast('Nothing new to add', { description: 'You already have pages with those names.' });
      return;
    }
    toast.success(`Added ${n} page${n === 1 ? '' : 's'}`, {
      description: 'Replace anything in [brackets], set up each block, then publish. They join your menu automatically.',
      action: { label: 'Undo', onClick: () => actions.undo() }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a ready-made site"
      description="Extra pages laid out for your kind of business. Your home page isn’t changed."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {noRoom && nextPlan ?
        <UpgradeButton plan={nextPlan.id} feature="More pages on your site" /> :

        <Button onClick={add} disabled={picked.size === 0 || over}>
              {picked.size ? `Add ${picked.size} page${picked.size === 1 ? '' : 's'}` : 'Add pages'}
            </Button>
        }
        </>
      }>
      
      {noRoom &&
      <div className="mb-5 rounded-md border border-warning/40 bg-warning-soft px-3 py-2.5" role="status">
          <p className="text-label font-semibold text-fg">Your plan has no room for more pages</p>
          <p className="mt-0.5 text-caption text-fg-muted">
            Your current plan includes your home page only.{nextPlan ? ` Upgrade to ${nextPlan.name} to add a ready-made site.` : ''} You can still look through the kits below.
          </p>
        </div>
      }
      <fieldset>
        <legend className="text-label font-semibold text-fg">Kind of site</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {siteKits.map((k) => {
            const Icon = k.icon;
            const on = k.id === kit.id;
            return (
              <label key={k.id} className={cn('flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-focus', on ? 'border-action bg-action-soft' : 'border-line hover:border-line-strong')}>
                <input type="radio" name="site-kit" className="sr-only" checked={on} onChange={() => setKit(k)} />
                <Icon size={18} className={cn('mt-0.5 shrink-0', on ? 'text-action' : 'text-fg-subtle')} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-label font-semibold text-fg">{k.name}</span>
                  <span className="block text-caption text-fg-muted">{k.forWho}</span>
                </span>
              </label>);

          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="flex w-full items-baseline justify-between gap-3 text-label font-semibold text-fg">
          <span>Pages to add</span>
          {!noRoom &&
          <span className={cn('text-caption font-medium tabular-nums', over ? 'text-danger' : 'text-fg-subtle')}>
              {picked.size} of {room} that fit your plan
            </span>
          }
        </legend>
        <ul className="mt-2 divide-y divide-line rounded-md border border-line">
          {kit.pages.map((p) => {
            const exists = taken.has(p.title.toLowerCase());
            const on = picked.has(p.title);
            return (
              <li key={p.title}>
                <label className={cn('flex items-start gap-3 px-3 py-2.5', exists ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-[rgb(var(--action))]"
                    checked={on}
                    disabled={exists || noRoom}
                    onChange={() =>
                    setPicked((s) => {
                      const n = new Set(s);
                      if (n.has(p.title)) n.delete(p.title);else
                      n.add(p.title);
                      return n;
                    })
                    } />
                  
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-fg">{p.title}</span>
                    <span className="block text-caption text-fg-muted">{exists ? 'You already have a page with this name' : p.purpose}</span>
                  </span>
                  {on && <CheckIcon size={14} className="ml-auto mt-1 shrink-0 text-action" aria-hidden />}
                </label>
              </li>);

          })}
        </ul>
      </fieldset>

      {noRoom ? null : over ?
      <div className="mt-4 flex flex-col gap-2" role="status">
          <p className="text-caption text-danger">
            Your plan has room for {room} more page{room === 1 ? '' : 's'}. Untick {picked.size - room} or upgrade.
          </p>
          {nextPlan && <UpgradeButton plan={nextPlan.id} feature="More pages on your site" className="self-start" />}
        </div> :

      <p className="mt-4 text-caption text-fg-subtle">Prices, policies and your story are left as [Add …] gaps — publishing waits until you’ve filled them.</p>
      }
    </Dialog>);

}