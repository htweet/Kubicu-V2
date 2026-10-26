import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircleIcon, MessageSquarePlusIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { WaChat } from '../types/whatsapp';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan } from '../contexts/TeamContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useEditor } from '../contexts/EditorContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { WA_AUTOMATION_PLAN, chatLabels, chatTones, inServiceWindow, productCard, receive, seedSample, sendReply, simulatedCustomer, sortChats, syncRows, updateChat } from '../utils/whatsapp';
import { usePlan } from '../contexts/PlanContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { planAtLeast } from '../data/plans';
import { WhatsAppAutoMessages } from '../components/whatsapp/WhatsAppAutoMessages';
import { upsertContact } from '../utils/ops/ops';
import { formatNgn, formatRelative, formatTimestamp } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { InlineAlert } from '../components/ui/InlineAlert';
import { SampleTag } from '../components/commerce/StatusBadges';
import { ChatThread } from '../components/whatsapp/ChatThread';
import { WhatsAppSetup } from '../components/whatsapp/WhatsAppSetup';
import { cn } from '../utils/cn';
import { seedsSample } from '../utils/workspaceStorage';

type Tab = 'chats' | 'catalogue' | 'auto' | 'setup';

const rowCls = 'flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none';

/** WhatsApp Commerce Bridge (D97): chats, catalogue sync and automatic replies. WhatsApp itself is simulated. */
export function WhatsApp() {
  const { current } = useWorkspace();
  const can = useCan('orders.manage');
  const commerce = useCommerce();
  const ops = useOps();
  const { state: editor } = useEditor();
  const handle = editor.published?.handle ?? editor.site.handle;
  const { data, update } = useWhatsApp(current.id);
  const [tab, setTab] = useState<Tab>('chats');
  const [openId, setOpenId] = useState<string | null>(null);
  const plan = usePlan();
  const { openUpgrade } = useUpgrade();
  const autoUnlocked = planAtLeast(plan.id, WA_AUTOMATION_PLAN);

  useEffect(() => {
    if (!data.sampleSeeded && seedsSample(current.id)) update(seedSample);
  }, [data.sampleSeeded, update, current.id]);

  const connected = data.connection.status === 'connected';
  const chats = useMemo(() => sortChats(data.chats), [data.chats]);
  const unread = chats.reduce((s, c) => s + c.unread, 0);
  const waiting = chats.filter((c) => c.messages[c.messages.length - 1]?.from === 'customer').length;
  const rows = useMemo(() => syncRows(commerce.data.products), [commerce.data.products]);
  const syncable = rows.filter((r) => !r.reason);
  const outOfDate = data.lastSyncAt ? syncable.filter((r) => !data.syncedIds.includes(r.product.id) || new Date(r.product.updatedAt).getTime() > new Date(data.lastSyncAt as string).getTime()).length : syncable.length;
  const sendable = commerce.data.products.filter((p) => p.status === 'active' && p.kind !== 'ticket' && p.priceNgn);
  const open = chats.find((c) => c.id === openId) ?? null;

  const openChat = (c: WaChat) => {
    setOpenId(c.id);
    if (c.unread) update((d) => updateChat(d, c.id, (x) => ({ ...x, unread: 0 })));
  };

  const simulate = () => {
    const sim = simulatedCustomer(data);
    update((d) => receive(d, sim, { automations: autoUnlocked }).data);
    toast(`New message from ${sim.name}`, { description: 'Simulated incoming WhatsApp message.' });
  };

  const sync = () => {
    update((d) => ({ ...d, lastSyncAt: new Date().toISOString(), syncedIds: syncable.map((r) => r.product.id) }));
    toast.success('Catalogue synced', { description: `${syncable.length} product${syncable.length === 1 ? '' : 's'} on WhatsApp (simulated).` });
  };

  const saveContact = (c: WaChat) => {
    if (ops.apply((d) => upsertContact(d, { name: c.name, email: '', phone: c.phone }, 'manual', 'Messaged on WhatsApp', { consent: 'transactional' }))) {
      update((d) => updateChat(d, c.id, (x) => ({ ...x, contactSaved: true })));
      toast.success('Saved to Audience', { description: 'Messaging you isn’t agreement to marketing.' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="WhatsApp"
        context={current.name}
        description="Answer customers, send products with a link to buy, and keep your WhatsApp catalogue in step with your shop. WhatsApp itself is simulated until a partner is chosen." />
      

      {!connected &&
      <InlineAlert
        tone="info"
        title="Connect your business number"
        className="mt-6"
        action={
        <Button size="sm" variant="secondary" onClick={() => setTab('setup')}>
              Go to Setup
            </Button>
        }>
        
          The chats below are samples. Once connected, new messages arrive here.
        </InlineAlert>
      }

      <section aria-label="Summary" className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">Waiting for your reply</p>
          <p className="mt-1 font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{waiting}</p>
          <p className="mt-1 text-caption text-fg-subtle">{unread ? `${unread} unread message${unread === 1 ? '' : 's'}` : 'All caught up'}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Chats</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{chats.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{chats.filter((c) => c.label === 'ordered').length} ordered</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">On WhatsApp catalogue</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{data.lastSyncAt ? data.syncedIds.length : 0}</p>
          <p className="mt-1 text-caption text-fg-subtle">{outOfDate ? `${outOfDate} need syncing` : 'Up to date'}</p>
        </div>
      </section>

      <Tabs<Tab>
        idPrefix="wa"
        ariaLabel="WhatsApp"
        value={tab}
        onChange={setTab}
        className="mt-6"
        items={[
        { id: 'chats', label: 'Chats', badge: unread || undefined },
        { id: 'catalogue', label: 'Catalogue', badge: outOfDate || undefined },
        { id: 'auto', label: 'Automatic messages' },
        { id: 'setup', label: 'Setup' }]
        } />
      

      <div role="tabpanel" id={`wa-panel-${tab}`} aria-labelledby={`wa-tab-${tab}`} className="mt-4">
        {tab === 'chats' &&
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-caption text-fg-subtle">Newest first. Replies are free for 24 hours after the customer writes.</p>
              <Button size="sm" variant="secondary" leadingIcon={MessageSquarePlusIcon} onClick={simulate}>
                Prototype: receive a message
              </Button>
            </div>
            {chats.length === 0 ?
          <EmptyState icon={MessageCircleIcon} title="No chats yet" description="When customers message your WhatsApp Business number, their chats show here." /> :

          <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
                {chats.map((c) => {
              const last = c.messages[c.messages.length - 1];
              return (
                <li key={c.id}>
                      <button type="button" onClick={() => openChat(c)} className={rowCls}>
                        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-label font-semibold text-fg-muted">
                          {c.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className={cn('text-label text-fg', c.unread ? 'font-semibold' : 'font-medium')}>{c.name}</span>
                            {c.sample && <SampleTag />}
                            {!inServiceWindow(c) && <span className="text-caption text-fg-subtle">· Template only</span>}
                          </span>
                          <span className={cn('mt-0.5 block truncate text-caption', c.unread ? 'text-fg' : 'text-fg-muted')}>
                            {last?.from === 'customer' ? '' : 'You: '}
                            {last?.product ? `${last.product.name} · ${last.product.priceNgn ? formatNgn(last.product.priceNgn) : ''}` : last?.text}
                          </span>
                        </span>
                        <span className="hidden shrink-0 text-caption text-fg-subtle sm:block">{last ? formatRelative(last.at) : ''}</span>
                        {c.unread > 0 &&
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-action px-1.5 text-caption font-semibold tabular-nums text-action-fg">
                            <span className="sr-only">Unread: </span>
                            {c.unread}
                          </span>
                    }
                        <Badge tone={chatTones[c.label]}>{chatLabels[c.label]}</Badge>
                      </button>
                    </li>);

            })}
              </ul>
          }
          </div>
        }

        {tab === 'catalogue' &&
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-label font-medium text-fg">
                  {syncable.length} of {rows.length} products can appear on WhatsApp
                </p>
                <p className="text-caption text-fg-subtle">{data.lastSyncAt ? `Last synced ${formatTimestamp(data.lastSyncAt)}` : 'Never synced'}. Each product links back to your shop to pay.</p>
              </div>
              <Button size="sm" leadingIcon={RefreshCwIcon} disabled={!connected || !can.allowed || syncable.length === 0} title={!connected ? 'Connect your number first' : can.allowed ? undefined : can.reason} onClick={sync}>
                Sync now
              </Button>
            </div>
            {rows.length === 0 ?
          <EmptyState icon={MessageCircleIcon} title="No products yet" description="Add products in Commerce to put them on your WhatsApp catalogue." /> :

          <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
                {rows.map(({ product: p, reason }) => {
              const synced = data.lastSyncAt && data.syncedIds.includes(p.id) && new Date(p.updatedAt).getTime() <= new Date(data.lastSyncAt).getTime();
              return (
                <li key={p.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-label font-medium text-fg">{p.name}</span>
                        <span className="block text-caption tabular-nums text-fg-muted">{p.priceNgn ? formatNgn(p.priceNgn) : 'No price'}</span>
                      </span>
                      {reason ? <Badge tone="neutral">{reason}</Badge> : synced ? <Badge tone="success" dot>On WhatsApp</Badge> : <Badge tone="warning" dot>Needs sync</Badge>}
                    </li>);

            })}
              </ul>
          }
          </div>
        }

        {tab === 'auto' &&
        <WhatsAppAutoMessages data={data} canEdit={can.allowed} unlocked={autoUnlocked} onUpgrade={() => openUpgrade({ plan: WA_AUTOMATION_PLAN, feature: 'WhatsApp keyword replies and order updates' })} update={update} />
        }
        {tab === 'setup' && <WhatsAppSetup data={data} canEdit={can.allowed} defaultName={current.name} defaultPhone="" update={update} />}
      </div>

      <ChatThread
        chat={open}
        canEdit={can.allowed}
        quickReplies={data.quickReplies}
        products={sendable}
        toCard={(p) => productCard(p, commerce.data.products, handle)}
        onClose={() => setOpenId(null)}
        onSend={(c, text, product) => update((d) => sendReply(d, c.id, text, product))}
        onLabel={(c, label) => update((d) => updateChat(d, c.id, (x) => ({ ...x, label })))}
        onSaveContact={saveContact} />
      
    </div>);

}