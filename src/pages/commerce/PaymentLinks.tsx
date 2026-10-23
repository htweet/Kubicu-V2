import React, { useMemo, useState } from 'react';
import { Link2Icon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentLink } from '../../types/money';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan } from '../../contexts/TeamContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast } from '../../data/plans';
import { useMoney } from '../../hooks/useMoney';
import { useMainLink } from '../../hooks/useMainLink';
import { linkMethod, linkTotal, linkView, linkViewLabels, linkViewTones, methodLabels } from '../../utils/money/store';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Segmented } from '../../components/ui/Segmented';
import { Card } from '../../components/ui/layout/Card';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ListRow } from '../../components/ui/layout/ListRow';
import { PartnerNote } from '../../components/money/PartnerNote';
import { PaymentLinkEditor } from '../../components/money/PaymentLinkEditor';
import { PaymentLinkDetail } from '../../components/money/PaymentLinkDetail';
import { SampleTag } from '../../components/commerce/StatusBadges';

type Filter = 'live' | 'closed';

/** Commerce → Payment links (D92): get paid without a product or a page. */
export function PaymentLinks() {
  const { current } = useWorkspace();
  const { mainHandle } = useMainLink();
  const { data, update } = useMoney(current.id);
  const can = useCan('paylinks.manage');
  const { id: plan } = usePlan();
  const escrowAllowed = planAtLeast(plan, 'pro');
  const [filter, setFilter] = useState<Filter>('live');
  const [editing, setEditing] = useState<PaymentLink | 'new' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const live = data.links.filter((l) => linkView(l) === 'active' || linkView(l) === 'paused');
  const closed = data.links.filter((l) => !live.includes(l));
  const list = filter === 'live' ? live : closed;
  const open = data.links.find((l) => l.id === openId) ?? null;

  const last30 = useMemo(() => {
    const since = Date.now() - 30 * 86_400_000;
    const pays = data.links.flatMap((l) => l.payments).filter((p) => Date.parse(p.at) >= since);
    return { total: pays.reduce((s, p) => s + p.amountNgn, 0), count: pays.length };
  }, [data.links]);

  const save = (l: PaymentLink) => {
    const isNew = !data.links.some((x) => x.id === l.id);
    update((d) => ({ ...d, links: isNew ? [l, ...d.links] : d.links.map((x) => x.id === l.id ? l : x) }));
    setEditing(null);
    setOpenId(l.id);
    if (isNew) {
      void navigator.clipboard?.writeText(`https://kub.icu/pay/${l.slug}`);
      toast.success('Payment link created', { description: `kub.icu/pay/${l.slug} — copied, ready to share.` });
    } else toast.success('Link updated');
  };

  const setStatus = (l: PaymentLink, status: PaymentLink['status']) => {
    update((d) => ({ ...d, links: d.links.map((x) => x.id === l.id ? { ...x, status } : x) }));
    toast(status === 'paused' ? 'Link paused — payers see “not taking payments right now”' : status === 'archived' ? 'Link archived' : 'Link is taking payments again');
  };

  const newLink = () => can.allowed ? setEditing('new') : toast.error(can.reason);

  return (
    <>
      <PageHeader
        title="Payment links"
        description="A link anyone can pay — deposits, class seats, custom orders, donations. No product or page needed."
        actions={
        <Button leadingIcon={PlusIcon} onClick={newLink}>
            New link
          </Button>
        } />
      
      <PartnerNote className="mt-6">Payments follow each link’s method: straight to your bank, into your wallet, or through escrow.</PartnerNote>

      {data.links.length === 0 ?
      <EmptyState
        className="mt-8"
        icon={Link2Icon}
        title="No payment links yet"
        description="Make one for a deposit, a class seat or a custom order, and share it on WhatsApp."
        action={
        <Button leadingIcon={PlusIcon} onClick={newLink}>
              New link
            </Button>
        } /> :


      <>
          <section aria-label="Last 30 days" className="mt-6 rounded-lg border border-line bg-raised p-5 md:p-6">
            <StatGroup columns={3}>
              <Stat primary label="Collected in the last 30 days" value={formatNgn(last30.total)} hint="Before fees" />
              <Stat label="Payments" value={last30.count} />
              <Stat label="Links taking payments" value={data.links.filter((l) => linkView(l) === 'active').length} />
            </StatGroup>
          </section>

          <Card
          className="mt-8"
          title="Your links"
          body="flush"
          actions={<Segmented<Filter> size="sm" ariaLabel="Show links" value={filter} onChange={setFilter} options={[{ value: 'live', label: `Open (${live.length})` }, { value: 'closed', label: `Closed (${closed.length})` }]} />}>
          
            {list.length === 0 ?
          <p className="px-5 pb-5 text-label text-fg-muted md:px-6">{filter === 'live' ? 'No open links. Closed, expired and fully used links are in Closed.' : 'Nothing closed yet.'}</p> :

          <ul className="divide-y divide-line border-t border-line">
                {list.map((l) => {
              const v = linkView(l);
              return (
                <ListRow
                  key={l.id}
                  onClick={() => setOpenId(l.id)}
                  leading={
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sunken text-fg-muted">
                          <Link2Icon size={16} aria-hidden />
                        </span>
                  }
                  title={
                  <span className="flex items-center gap-2">
                          <span className="truncate">{l.title}</span>
                          {l.sample && <SampleTag />}
                        </span>
                  }
                  meta={`kub.icu/pay/${l.slug} · ${l.kind === 'fixed' ? formatNgn(l.amountNgn) : l.kind === 'open' ? `From ${formatNgn(l.minNgn)}` : `${l.items.length} items`} · ${methodLabels[linkMethod(data, l)]}`}
                  trailing={
                  <>
                          <span className="hidden flex-col items-end sm:flex">
                            <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(linkTotal(l))}</span>
                            <span className="text-caption text-fg-subtle">{l.payments.length} paid</span>
                          </span>
                          <Badge tone={linkViewTones[v]} dot>
                            {linkViewLabels[v]}
                          </Badge>
                        </>
                  } />);


            })}
              </ul>
          }
          </Card>
        </>
      }

      <PaymentLinkEditor open={editing !== null} link={editing === 'new' ? null : editing} data={data} escrowAllowed={escrowAllowed} onClose={() => setEditing(null)} onSave={save} />
      <PaymentLinkDetail
        link={editing ? null : open}
        data={data}
        handle={mainHandle}
        canEdit={can.allowed}
        onClose={() => setOpenId(null)}
        onEdit={(l) => setEditing(l)}
        onStatus={setStatus} />
      
    </>);

}