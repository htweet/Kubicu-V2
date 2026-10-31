import React, { useEffect, useMemo, useState } from 'react';
import { HandshakeIcon, LockIcon, SettingsIcon, StoreIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useEditor } from '../contexts/EditorContext';
import { useCan } from '../contexts/TeamContext';
import { usePlan } from '../contexts/PlanContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { planAtLeast } from '../data/plans';
import { useLocalStore } from '../hooks/useLocalStore';
import { useMoney } from '../hooks/useMoney';
import { seedsSample } from '../utils/workspaceStorage';
import { balances, isVerified } from '../utils/money/store';
import { COLLAB_PLAN, collabKey, collabSettingsOf, commissionLines, emptyCollabs, partnerStatusLabels, partnerStatusTones, partnerTotals, seedCollabs, type Partner } from '../utils/collabs';
import { CollabSettingsSheet } from '../components/collabs/CollabSettingsSheet';
import { formatNgn, publicUrl } from '../utils/format';
import { uid } from '../utils/id';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Section } from '../components/ui/layout/Section';
import { Card } from '../components/ui/layout/Card';
import { List } from '../components/ui/layout/ListRow';
import { InlineAlert } from '../components/ui/InlineAlert';
import { SampleTag } from '../components/commerce/StatusBadges';
import { PartnerEditor } from '../components/collabs/PartnerEditor';
import { PartnerDetail } from '../components/collabs/PartnerDetail';
import { Tabs } from '../components/ui/Tabs';
import { useTeam } from '../contexts/TeamContext';
import { useT } from '../contexts/LocaleContext';
import { emptyPartnerships, PARTNERSHIP_PLAN, partnershipKey, seedPartnerships, syncPartnerships } from '../utils/partnerships';
import { WorkTogetherSheet } from '../components/partners/WorkTogetherSheet';
import { PartnershipDetail } from '../components/partners/PartnershipDetail';
import { BusinessPartners } from '../components/partners/BusinessPartners';
import { SharedShops } from '../components/partners/SharedShops';
import { SharedShopDialog } from '../components/partners/SharedShopDialog';
import { SHARED_SHOP_PLAN } from '../utils/sharedShops';

type CollabTab = 'business' | 'shops' | 'referral';

/** Collaborations: business partners who sell with you (D120) and referral partners who earn commission (D103). */
export function Collaborations() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const { state: editor } = useEditor();
  const can = useCan('commerce.settings');
  const canPay = useCan('payouts.manage');
  const plan = usePlan();
  const { openUpgrade } = useUpgrade();
  const unlocked = planAtLeast(plan.id, COLLAB_PLAN);
  const money = useMoney(current.id);
  const { data, update } = useLocalStore(collabKey(current.id), emptyCollabs);
  const collabSettings = collabSettingsOf(data);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | 'new' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<CollabTab>('business');
  const [working, setWorking] = useState(false);
  const [openPns, setOpenPns] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const { workspaces } = useWorkspace();
  const startShop = () => planAtLeast(plan.id, SHARED_SHOP_PLAN) ? setShopOpen(true) : openUpgrade({ plan: SHARED_SHOP_PLAN, feature: 'Shared shops' });
  const team = useTeam();
  const partnerships = useLocalStore(partnershipKey(current.id), emptyPartnerships);

  const orders = commerce.data.orders;
  useEffect(() => {
    if (!data.sampleSeeded && seedsSample(current.id)) update((d) => seedCollabs(d, orders));
  }, [data.sampleSeeded, update, orders, current.id]);
  useEffect(() => {
    if (!partnerships.data.sampleSeeded) {
      if (seedsSample(current.id)) partnerships.update((d) => seedPartnerships(d));
    } else
    partnerships.update((d) => syncPartnerships(d));
    // Seed once, then let notice periods run out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerships.data.sampleSeeded]);

  const openPartnership = partnerships.data.partnerships.find((x) => x.id === openPns) ?? null;
  const invitesWaiting = partnerships.data.partnerships.filter((x) => x.status === 'invited' || !!x.pending).length;
  const startWorkTogether = () => unlocked ? setWorking(true) : openUpgrade({ plan: PARTNERSHIP_PLAN, feature: 'Working with another business' });

  const handle = editor.published?.handle ?? editor.site.handle;
  const linkFor = (p: Partner) => `https://${publicUrl(handle)}?partner=${p.code}`;

  const rows = useMemo(
    () =>
    data.partners.map((p) => {
      const lines = commissionLines(p, orders, data.payouts, Date.now(), collabSettings.holdDays);
      return { partner: p, lines, totals: partnerTotals(lines) };
    }),
    [data.partners, data.payouts, orders, collabSettings.holdDays]
  );
  const sum = (k: 'sales' | 'pending' | 'payable' | 'paid') => rows.reduce((s, r) => s + r.totals[k], 0);
  const open = rows.find((r) => r.partner.id === openId) ?? null;

  const verified = isVerified(money.data);
  const available = balances(money.data).available;
  const openPayable = open ? open.totals.payable : 0;
  const walletBlock = !canPay.allowed ? canPay.reason ?? tr('Only the Owner can pay from the wallet.') : !verified ? tr('Finish business verification to pay from your wallet.') : available < openPayable ? tr('Your wallet has {amount} available.', { amount: formatNgn(available) }) : null;

  const savePartner = (p: Partner) => {
    update((d) => ({ ...d, partners: d.partners.some((x) => x.id === p.id) ? d.partners.map((x) => x.id === p.id ? p : x) : [p, ...d.partners] }));
    toast.success(editing === 'new' ? tr('Partner invited') : tr('Partner updated'), { description: editing === 'new' ? tr('Send them the invite from their page.') : undefined });
    setEditing(null);
    if (editing === 'new') setOpenId(p.id);
  };

  const setStatus = (id: string, status: Partner['status']) => {
    const now = new Date().toISOString();
    update((d) => ({ ...d, partners: d.partners.map((x) => x.id === id ? { ...x, status, stoppedAt: status === 'active' ? undefined : x.stoppedAt ?? now } : x) }));
    toast(`${tr('Partner')}: ${tr(partnerStatusLabels[status])}`);
  };

  const pay = (method: 'wallet' | 'outside') => {
    if (!open) return;
    const due = open.lines.filter((l) => l.state === 'payable');
    const amount = due.reduce((s, l) => s + l.commissionNgn, 0);
    if (amount <= 0) return;
    if (method === 'wallet') {
      if (walletBlock) return toast.error(tr('Can’t pay from the wallet'), { description: walletBlock });
      money.update((m) => ({
        ...m,
        ledger: [{ id: uid('led'), at: new Date().toISOString(), kind: 'commission', amountNgn: -amount, state: 'available', label: `Commission · ${open.partner.name}` }, ...m.ledger]
      }));
    }
    update((d) => ({ ...d, payouts: [{ id: uid('cpo'), partnerId: open.partner.id, amountNgn: amount, orderIds: due.map((l) => l.order.id), method, at: new Date().toISOString(), note: '' }, ...d.payouts] }));
    toast.success(tr(method === 'wallet' ? '{amount} commission paid from your wallet' : '{amount} commission recorded as paid', { amount: formatNgn(amount) }), { description: method === 'wallet' ? tr('Test mode — sent by our licensed payment partner.') : undefined });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title={tr('Collaborations')}
        context={current.name}
        description={tr(tab === 'shops' ? 'One shop link for a group of sellers. Customers browse everyone’s products; each seller takes their own orders, money and delivery.' : tab === 'business' ? 'Run a page and sell bundles with another business. Each of you is paid your own part, the moment the customer pays.' : 'Creators and resellers share your link and earn a commission on what they sell. Every naira is worked out from real orders.')}
        actions={
        tab === 'shops' ?
        <Button leadingIcon={planAtLeast(plan.id, SHARED_SHOP_PLAN) ? StoreIcon : LockIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={startShop}>
              {tr('New shared shop')}
            </Button> :
        tab === 'business' ?
        <Button leadingIcon={unlocked ? HandshakeIcon : LockIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={startWorkTogether}>
              {tr('Work together')}
            </Button> :

        <>
              <Button variant="tertiary" leadingIcon={SettingsIcon} onClick={() => setSettingsOpen(true)}>
                {tr('Settings')}
              </Button>
              <Button leadingIcon={unlocked ? UserPlusIcon : LockIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => unlocked ? setEditing('new') : openUpgrade({ plan: COLLAB_PLAN, feature: 'Creator Collaboration' })}>
                {tr('Invite referral partner')}
              </Button>
            </>

        } />
      

      {!unlocked &&
      <InlineAlert
        tone="info"
        title={tr('Creator Collaboration is on Pro and above')}
        className="mt-6"
        action={
        <Button size="sm" onClick={() => openUpgrade({ plan: COLLAB_PLAN, feature: 'Creator Collaboration' })}>
              {tr('Upgrade')}
            </Button>
        }>
        
          {tr('The sample partners below show how it works. Working with another business, inviting partners and paying commission need Pro.')}
        </InlineAlert>
      }

      <Tabs<CollabTab>
        ariaLabel={tr('Collaborations')}
        idPrefix="collab-tab"
        className="mt-6"
        value={tab}
        onChange={setTab}
        items={[
        { id: 'business', label: tr('Business partners'), badge: invitesWaiting || undefined },
        { id: 'shops', label: tr('Shared shops') },
        { id: 'referral', label: tr('Referral partners') }]
        } />
      

      <SharedShopDialog open={shopOpen} onClose={() => setShopOpen(false)} host={current} hostHandle={handle} partners={partnerships.data.partnerships} workspaces={workspaces} />

      {tab === 'shops' ?
      <SharedShops workspaceId={current.id} canEdit={can.allowed} onCreate={startShop} /> :
      tab === 'business' ?
      <BusinessPartners
        rows={partnerships.data.partnerships}
        leadName={current.name}
        onOpen={setOpenPns}
        onStart={startWorkTogether}
        canStart={can.allowed} /> :


      <>
      <section aria-label={tr('Summary')} className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">{tr('Commission ready to pay')}</p>
          <p className="mt-1 font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{formatNgn(sum('payable'))}</p>
          <p className="mt-1 text-caption text-fg-subtle">{tr('{amount} pending until orders are delivered', { amount: formatNgn(sum('pending')) })}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">{tr('Sales from partners')}</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{formatNgn(sum('sales'))}</p>
          <p className="mt-1 text-caption text-fg-subtle">{tr('Active partners: {n}', { n: rows.filter((r) => r.partner.status === 'active').length })}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">{tr('Paid to partners')}</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{formatNgn(sum('paid'))}</p>
          <p className="mt-1 text-caption text-fg-subtle">{tr('All time')}</p>
        </div>
      </section>

      <Section id="partners" title={tr('Partners')} className="mt-8">
        {rows.length === 0 ?
          <EmptyState framed icon={HandshakeIcon} title={tr('No partners yet')} description={tr('Invite someone who already talks to your customers — a stylist, a creator or a reseller.')} /> :

          <Card as="div" body="flush">
          <List label={tr('Partners')}>
            {rows.map(({ partner: p, totals }) =>
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-sunken md:px-6 focus-visible:bg-sunken focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_7rem_7rem_6rem]">
                  
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-label font-semibold text-fg">{p.name}</span>
                      {p.sample && <SampleTag />}
                    </span>
                    <span className="block truncate text-caption text-fg-muted">
                      {p.handle || p.code} · {p.ratePct}% · {tr('Orders: {n}', { n: totals.orders })}
                    </span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className="block text-caption text-fg-subtle">{tr('Sales')}</span>
                    <span className="text-label tabular-nums text-fg">{formatNgn(totals.sales)}</span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className="block text-caption text-fg-subtle">{tr('To pay')}</span>
                    <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(totals.payable)}</span>
                  </span>
                  <span className="justify-self-end">
                    <Badge tone={partnerStatusTones[p.status]} dot>
                      {tr(partnerStatusLabels[p.status])}
                    </Badge>
                  </span>
                </button>
              </li>
              )}
          </List>
          </Card>
          }
        <p className="text-caption text-fg-subtle">{tr('Commission becomes payable once an order is delivered, or 7 days after payment with no refund or dispute. Rates and the 7-day hold are example figures.')}</p>
      </Section>
      </>
      }

      <WorkTogetherSheet
        open={working}
        onClose={() => setWorking(false)}
        leadName={current.name}
        takenHandles={partnerships.data.partnerships.filter((x) => x.status !== 'ended' && x.status !== 'declined' && x.partner.handle).map((x) => x.partner.handle as string)}
        referralPartners={data.partners}
        onCreate={(pn) => {
          partnerships.update((d) => ({ ...d, partnerships: [pn, ...d.partnerships] }));
          team.log('commerce', `invited ${pn.partner.name} to work together`, '/app/collaborations');
        }} />
      

      <PartnershipDetail
        partnership={openPartnership}
        leadName={current.name}
        canEdit={can.allowed && unlocked}
        onClose={() => setOpenPns(null)}
        onChange={(pn) => partnerships.update((d) => ({ ...d, partnerships: d.partnerships.map((x) => x.id === pn.id ? pn : x) }))} />
      

      <PartnerEditor
        open={!!editing}
        partner={editing && editing !== 'new' ? editing : null}
        partners={data.partners}
        products={commerce.data.products}
        onClose={() => setEditing(null)}
        onSave={savePartner}
        defaults={collabSettings} />
      

      <CollabSettingsSheet
        open={settingsOpen}
        settings={collabSettings}
        canEdit={can.allowed}
        onClose={() => setSettingsOpen(false)}
        onSave={(s) => {
          update((d) => ({ ...d, settings: s }));
          toast.success(tr('Referral partner settings saved'));
          setSettingsOpen(false);
        }} />
      

      <PartnerDetail
        partner={open?.partner ?? null}
        lines={open?.lines ?? []}
        payouts={open ? data.payouts.filter((x) => x.partnerId === open.partner.id) : []}
        link={open ? linkFor(open.partner) : ''}
        canEdit={can.allowed && unlocked}
        walletBlock={walletBlock}
        onClose={() => setOpenId(null)}
        onEdit={() => {
          if (open) setEditing(open.partner);
          setOpenId(null);
        }}
        onStatus={(s) => open && setStatus(open.partner.id, s)}
        onAccept={() => {
          if (!open) return;
          update((d) => ({ ...d, partners: d.partners.map((x) => x.id === open.partner.id ? { ...x, status: 'active', acceptedAt: new Date().toISOString() } : x) }));
          toast.success(tr('{name} accepted', { name: open.partner.name }), { description: tr('Orders through their link now earn commission.') });
        }}
        onPay={pay} />
      
    </div>);

}