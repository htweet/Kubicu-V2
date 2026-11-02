import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeftRightIcon, MapPinIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, PowerIcon, StoreIcon, Trash2Icon } from 'lucide-react';
import type { Branch, Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useT } from '../../contexts/LocaleContext';
import { useTeam } from '../../contexts/TeamContext';
import { plans, planAtLeast } from '../../data/plans';
import { BRANCH_PLAN, MAIN_BRANCH, MAX_BRANCHES, branchesOf, removeBranch, royaltyFor, salesByLocation, stockAt, upsertBranch } from '../../utils/commerce/branches';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { Dialog } from '../../components/ui/Dialog';
import { BranchSheet } from '../../components/commerce/BranchSheet';
import { TransferStockDialog } from '../../components/commerce/TransferStockDialog';

const DAYS = 30;

/** Commerce → Branches: other shop locations, their stock and franchise royalties (D437). */
export function Branches() {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, BRANCH_PLAN);
  const branches = branchesOf(data);
  const { myBranchId } = useTeam();
  const [editing, setEditing] = useState<Branch | 'new' | null>(null);
  const [moving, setMoving] = useState<Product | null>(null);
  const [removing, setRemoving] = useState<Branch | null>(null);

  const since = useMemo(() => new Date(Date.now() - DAYS * 86_400_000).toISOString(), []);
  const sales = useMemo(() => salesByLocation(data, since), [data, since]);
  const stocked = data.products.filter((p) => p.kind === 'physical' && p.trackStock && p.status !== 'archived');
  const royaltiesDue = branches.reduce((s, b) => s + royaltyFor(b, sales[b.id]?.salesNgn ?? 0), 0);
  const full = branches.length >= MAX_BRANCHES;

  const addButton =
  <Button leadingIcon={PlusIcon} disabled={!allowed || full} onClick={() => setEditing('new')}>
      {tr('Add a branch')}
    </Button>;


  const setStatus = (b: Branch, status: Branch['status']) => {
    if (apply((d) => upsertBranch(d, { ...b, status }))) toast(status === 'open' ? tr('{name} is open', { name: b.name }) : tr('{name} closed', { name: b.name }), { description: status === 'closed' ? tr('It keeps its stock but won’t show at checkout.') : undefined });
  };

  const confirmRemove = () => {
    if (!removing) return;
    if (apply((d) => removeBranch(d, removing.id))) toast(tr('{name} removed', { name: removing.name }), { description: tr('Its stock went back to the main shop. Past orders keep their pickup details.') });
    setRemoving(null);
  };

  const allLocations: {id: string;name: string;address: string;branch?: Branch;}[] = [
  { id: MAIN_BRANCH, name: tr('Main shop'), address: data.fulfilment.pickupAddress || tr('Set the address in Commerce settings → Delivery & pickup') },
  ...branches.map((b) => ({ id: b.id, name: b.name, address: b.address, branch: b }))];

  // A teammate limited to one location (e.g. a franchise partner) sees only that one and can't add, edit or move stock (D474).
  const limited = !!myBranchId;
  const locations = limited ? allLocations.filter((l) => l.id === myBranchId) : allLocations;

  return (
    <>
      <PageHeader title={tr('Branches')} description={tr('Sell from more than one place. Each branch has its own stock count and can be a pickup point; franchised branches pay you a royalty on their sales.')} actions={limited ? undefined : addButton} />
      {limited && <p className="mt-4 text-label text-fg-muted">{tr('Showing {location} only — the location you work at.', { location: locations[0]?.name ?? tr('Main shop') })}</p>}

      {!allowed &&
      <InlineAlert tone="info" title={tr('Branches are on {plan}', { plan: plans[BRANCH_PLAN].name })} className="mt-6" action={<UpgradeButton plan={BRANCH_PLAN} feature="Branches" />}>
          {tr('Branches you already added keep their stock and orders.')}
        </InlineAlert>
      }

      {branches.length === 0 ?
      <EmptyState
        framed
        className="mt-8"
        icon={StoreIcon}
        title={tr('Just your main shop for now')}
        description={tr('Add a branch when you open a second location or sign a franchise partner. Your current stock stays at the main shop until you move some.')}
        action={allowed ? addButton : undefined} /> :


      <>
          <section aria-labelledby="br-locations" className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="br-locations" className="text-heading font-semibold text-fg">
                {tr('Locations')}
              </h2>
              <p className="text-caption text-fg-muted">
                {tr('Sales in the last {n} days', { n: DAYS })}
                {royaltiesDue > 0 && !limited ?
              <>
                    {' · '}
                    {tr('royalties due')} <strong className="tabular-nums text-fg">{formatNgn(royaltiesDue)}</strong>
                  </> :
              null}
              </p>
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {locations.map((l) => {
              const s = sales[l.id] ?? { orders: 0, salesNgn: 0 };
              const b = l.branch;
              const royalty = b ? royaltyFor(b, s.salesNgn) : 0;
              return (
                <li key={l.id} className="flex items-start gap-4 py-4">
                    <MapPinIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-label font-semibold text-fg">{l.name}</span>
                        {b?.kind === 'franchise' && <Badge tone="info">{`${tr('Franchise')} · ${b.franchise?.operator ?? ''}`}</Badge>}
                        {b?.status === 'closed' && <Badge tone="neutral">Closed</Badge>}
                        {b && b.status === 'open' && !b.pickup && <Badge tone="neutral">No pickup</Badge>}
                      </p>
                      <p className="mt-0.5 truncate text-caption text-fg-muted">{[l.address, b?.hours].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-label font-semibold tabular-nums text-fg">{formatNgn(s.salesNgn)}</p>
                      <p className="text-caption text-fg-subtle">
                        {tr('Orders: {n}', { n: s.orders })}
                        {royalty > 0 ? ` · ${tr('royalty {amount} ({pct}%)', { amount: formatNgn(royalty), pct: b?.franchise?.royaltyPct ?? 0 })}` : ''}
                      </p>
                    </div>
                    {b && !limited ?
                  <Menu
                    align="end"
                    trigger={(p) => <IconButton {...p} icon={MoreHorizontalIcon} label={tr('Actions for {name}', { name: b.name })} variant="ghost" />}
                    items={[
                    { id: 'edit', label: tr('Edit'), icon: PencilIcon, onSelect: () => setEditing(b) },
                    b.status === 'open' ? { id: 'close', label: tr('Close branch'), icon: PowerIcon, onSelect: () => setStatus(b, 'closed') } : { id: 'open', label: tr('Reopen'), icon: PowerIcon, onSelect: () => setStatus(b, 'open') },
                    { id: 'remove', label: tr('Remove'), icon: Trash2Icon, destructive: true, onSelect: () => setRemoving(b) }]
                    } /> :


                  <span className="w-10 shrink-0" aria-hidden />
                  }
                  </li>);

            })}
            </ul>
            <p className="mt-2 text-caption text-fg-subtle">{tr('Sales count orders collected at each location. Delivered orders count toward the main shop. Royalties are worked out here for your records — settle them with each partner directly.')}</p>
          </section>

          <section aria-labelledby="br-stock" className="mt-10">
            <h2 id="br-stock" className="text-heading font-semibold text-fg">
              {tr('Stock by location')}
            </h2>
            {stocked.length === 0 ?
          <p className="mt-3 text-label text-fg-muted">{tr('No products with tracked stock yet.')}</p> :

          <div className="mt-3 overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[560px] text-left text-label">
                  <thead className="bg-sunken text-caption text-fg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        {tr('Product')}
                      </th>
                      {locations.map((l) =>
                  <th key={l.id} scope="col" className="px-4 py-2.5 text-right font-medium">
                          {l.name}
                        </th>
                  )}
                      <th scope="col" className="px-4 py-2.5">
                        <span className="sr-only">{tr('Move stock')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {stocked.map((p) =>
                <tr key={p.id}>
                        <th scope="row" className="max-w-[16rem] truncate px-4 py-3 font-medium text-fg">
                          {p.name}
                        </th>
                        {locations.map((l) => {
                    const n = p.variants.reduce((s, v) => s + stockAt(v, l.id), 0);
                    return (
                      <td key={l.id} className={`px-4 py-3 text-right tabular-nums ${n === 0 ? 'text-fg-subtle' : n <= p.lowStockAt ? 'text-warning' : 'text-fg'}`}>
                              {n}
                            </td>);

                  })}
                        <td className="px-2 py-1.5 text-right">
                          <Button size="sm" variant="tertiary" leadingIcon={ArrowLeftRightIcon} disabled={!allowed || limited} onClick={() => setMoving(p)}>
                            {tr('Move')}
                          </Button>
                        </td>
                      </tr>
                )}
                  </tbody>
                </table>
              </div>
          }
          </section>
        </>
      }

      <BranchSheet branch={editing} onClose={() => setEditing(null)} />
      <TransferStockDialog product={moving} onClose={() => setMoving(null)} />
      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing ? tr('Remove {name}?', { name: removing.name }) : tr('Remove branch?')}
        description={tr('Its stock goes back to the main shop and buyers can no longer collect there. Past orders keep their pickup details.')}
        footer={
        <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              {tr('Keep it')}
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              {tr('Remove')}
            </Button>
          </>
        } />
      
    </>);

}