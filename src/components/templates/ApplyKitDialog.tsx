import React, { useEffect, useState } from 'react';
import type { BusinessKit, KitPart } from '../../types/kit';
import { kitPartLabels, kitParts } from '../../data/businessKits';
import { extensionById } from '../../data/extensions';
import { recipes } from '../../data/automationRecipes';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';

interface Props {
  kit: BusinessKit | null;
  /** A kit was applied before — warn that this one adds on top. */
  replacing: boolean;
  onClose: () => void;
  onApply: (kit: BusinessKit, parts: KitPart[]) => void;
}

/** Choose which parts of a kit to add; each part says exactly what it changes (D90). */
export function ApplyKitDialog({ kit, replacing, onClose, onApply }: Props) {
  const market = useMarketplace();
  const [parts, setParts] = useState<KitPart[]>([]);

  useEffect(() => {
    if (kit) setParts(kitParts(kit));
  }, [kit]);

  if (!kit) return <Dialog open={false} onClose={onClose} title="" />;

  const toggle = (p: KitPart, on: boolean) => setParts((cur) => (on ? [...cur, p] : cur.filter((x) => x !== p)));
  const newApps = kit.apps.filter((id) => !market.data.installed[id]);

  const detail = (p: KitPart): string => {
    switch (p) {
      case 'products':
        return kit.products.map((x) => x.name.replace(' (rename me)', '')).join(', ');
      case 'services':
        return kit.services.map((x) => x.name.replace(' (rename me)', '')).join(', ');
      case 'automations':
        return kit.recipes.map((r) => recipes.find((x) => x.id === r)?.name ?? r).join(', ');
      case 'apps':
        return newApps.length ? newApps.map((id) => extensionById[id]?.name ?? id).join(', ') : 'Already installed';
      case 'policies':
        return `Refunds, delivery, cancellation, instructions, guides and disclaimer.${kit.services.length ? ' Fills your Bookings policy only if it’s empty.' : ''}`;
      default:
        return '';
    }
  };

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      title={`Set up as a ${kit.name}`}
      description="Turn off anything you don’t want. Nothing goes live until you publish, and untouched items can be removed again later."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={parts.length === 0} onClick={() => onApply(kit, parts)}>
            Apply {parts.length} part{parts.length === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {replacing && <InlineAlert tone="info">You’ve applied a kit before. This one adds to what’s already there — it doesn’t remove the earlier kit’s items.</InlineAlert>}
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {kitParts(kit).map((p) => (
            <li key={p} className="px-4 py-3.5">
              <Switch id={`kit-part-${p}`} checked={parts.includes(p)} onChange={(on) => toggle(p, on)} label={kitPartLabels[p].label} description={kitPartLabels[p].description} />
              {detail(p) && <p className="mt-1.5 text-caption text-fg-muted">{detail(p)}</p>}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
