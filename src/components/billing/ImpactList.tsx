import React from 'react';
import { CircleSlashIcon, GaugeIcon, ShieldCheckIcon } from 'lucide-react';
import type { WorkspacePlan } from '../../types/plan';
import type { ImpactItem } from '../../hooks/useDowngradeImpact';
import { plans } from '../../data/plans';

/** What changes on a lower plan. Always ends with the "nothing is deleted" promise. */
export function ImpactList({ items, target }: { items: ImpactItem[]; target: WorkspacePlan }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-label font-semibold text-fg">{items.length ? `What changes on ${plans[target].name}` : `Nothing you use goes over ${plans[target].name}’s limits`}</h3>
      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((i) => {
            const Icon = i.severity === 'stops' ? CircleSlashIcon : GaugeIcon;
            return (
              <li key={i.id} className="flex gap-3">
                <Icon size={16} className={i.severity === 'stops' ? 'mt-0.5 shrink-0 text-danger' : 'mt-0.5 shrink-0 text-warning'} aria-hidden />
                <div>
                  <p className="text-label font-medium text-fg">{i.label}</p>
                  <p className="text-caption text-fg-muted">{i.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="flex items-start gap-2 rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
        <ShieldCheckIcon size={14} className="mt-0.5 shrink-0 text-success" aria-hidden />
        Nothing is deleted — pages, products, orders, contacts and media all stay. Upgrade again and everything comes back as it was.
      </p>
    </div>
  );
}
