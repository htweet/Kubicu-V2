import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useBusinessKit } from '../../hooks/useBusinessKit';
import { useCan } from '../../contexts/TeamContext';
import { kitById, kitPartLabels, kitParts } from '../../data/businessKits';
import { KIT_EVENT, readPendingKit, writePendingKit } from '../../utils/kits';
import { Button } from '../ui/Button';

/**
 * Overview card for a Business kit picked during onboarding (D126). The page already came
 * from the kit; this adds the rest (products, services, policies, automations, apps) on request.
 */
export function PendingKitCard() {
  const { current } = useWorkspace();
  const { apply } = useBusinessKit();
  const navigate = useNavigate();
  const can = useCan('pages.edit');
  const [kitId, setKitId] = useState(() => readPendingKit(current.id));

  useEffect(() => {
    const load = () => setKitId(readPendingKit(current.id));
    load();
    window.addEventListener(KIT_EVENT, load);
    return () => window.removeEventListener(KIT_EVENT, load);
  }, [current.id]);

  const kit = kitId ? kitById(kitId) : undefined;
  if (!kit) return null;
  const parts = kitParts(kit).filter((p) => p !== 'page');
  const Icon = kit.icon;

  const add = () => {
    apply(kit, parts);
    writePendingKit(current.id, null);
    toast.success(`${kit.name} kit added`, { description: 'Everything went in as drafts with no prices.', action: { label: 'See checklist', onClick: () => navigate('/app/templates?tab=kits') } });
  };

  return (
    <section aria-labelledby="pending-kit-h" className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-raised p-5 shadow-1 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-action-soft text-action">
        <Icon size={20} strokeWidth={2.2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="pending-kit-h" className="text-label font-semibold text-fg">
          Finish your {kit.name} kit
        </h2>
        <p className="mt-0.5 text-caption text-fg-muted">
          Your page is set up. Add the rest: {parts.map((p) => kitPartLabels[p].label.toLowerCase()).join(', ')}. All drafts — nothing goes live or gets a price until you set it.
        </p>
        {!can.allowed && <p className="mt-1 text-caption text-fg-subtle">{can.reason}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" disabled={!can.allowed} onClick={add}>
          Add starter items
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => writePendingKit(current.id, null)}>
          Not now
        </Button>
        <Link to="/app/templates?tab=kits" className="sr-only focus:not-sr-only">
          See all kits
        </Link>
      </div>
    </section>);

}