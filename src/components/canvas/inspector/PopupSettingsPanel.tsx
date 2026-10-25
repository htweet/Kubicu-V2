import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, DownloadIcon, PrinterIcon, StoreIcon } from 'lucide-react';
import type { PopupSettings } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useNow } from '../../../hooks/useNow';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { PopupSessionsEditor } from '../../popup/PopupSessionsEditor';
import { markCollected, popupOrders, popupOrdersCsv, popupStatus, popupStateLabels, popupSummary, sessionWhen, sortedSessions, stallLeft, stallSold, syncStallHolds, undoCollected } from '../../../utils/popup';
import { printPickupSlips } from '../../../utils/popupSlips';
import { Switch } from '../../ui/Switch';
import { downloadCsv } from '../../../utils/csv';
import { qrHref } from '../../../utils/domains/links';
import { formatNgn } from '../../../utils/format';
import { cn } from '../../../utils/cn';

const linkClass = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/** Pop-up shop settings (D183): place, sessions, products, payment, and orders to collect per session. */
export function PopupSettingsPanel() {
  const { state, actions } = useEditor();
  const { data, apply } = useCommerce();
  const { currentSpace } = useWorkspace();
  const now = useNow(30_000);
  const p = state.site.popup;
  const handle = state.published?.handle ?? state.site.handle;
  // Keep the stock set aside for this pop-up in step with its settings (D191). Released when it
  // closes or its last session ends; the next time any pop-up panel opens, expired holds are pruned.
  const holdKey = p ? JSON.stringify([p.holdStock, p.closedAt, p.productIds, p.stallLimits, p.sessions, Math.floor(now / 60_000)]) : '';
  React.useEffect(() => {
    if (!p) return;
    apply((d) => syncStallHolds(d, handle, state.site.title || 'a pop-up', p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdKey, handle]);
  if (!p) return null;

  const st = popupStatus(p, now);
  const orders = popupOrders(data, handle).filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');
  const usedSessions = new Set(orders.map((o) => o.popup!.sessionId));
  const patch = (next: Partial<PopupSettings>) => actions.transformDocument((doc) => doc.popup ? { ...doc, popup: { ...doc.popup, ...next } } : doc);
  const products = data.products.filter((x) => x.kind === 'physical' && (x.status === 'active' || p.productIds.includes(x.id)));
  const toCollect = orders.filter((o) => !o.popup?.collectedAt).length;

  const setCollected = (orderId: string, on: boolean) => {
    apply((d) => on ? markCollected(d, orderId) : undoCollected(d, orderId));
  };

  return (
    <section aria-labelledby="popup-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="popup-heading" className="text-label font-semibold text-fg">
            Pop-up shop
          </h3>
          <p className="mt-0.5 truncate text-caption text-fg-subtle">{popupSummary(p, now)}</p>
        </div>
        <Badge tone={st.state === 'open' ? 'success' : st.state === 'closed' ? 'neutral' : 'info'} dot>
          {popupStateLabels[st.state]}
        </Badge>
      </div>

      <div className="grid gap-3">
        <TextInput id="popup-venue" label="Venue" value={p.venue} onChange={(e) => patch({ venue: e.target.value })} />
        <TextInput id="popup-address" label="Address" optional value={p.address} onChange={(e) => patch({ address: e.target.value })} />
      </div>

      <PopupSessionsEditor sessions={p.sessions} onChange={(sessions) => patch({ sessions })} idPrefix="popup" locked={usedSessions} />

      <Field id="popup-pay" label="How buyers pay">
        <Segmented<PopupSettings['payment']>
          ariaLabel="How buyers pay"
          fullWidth
          size="sm"
          value={p.payment}
          onChange={(payment) => patch({ payment })}
          options={[
          { value: 'both', label: 'Their choice' },
          { value: 'online', label: 'Online' },
          { value: 'stall', label: 'At stall' }]
          } />
        
      </Field>

      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-label font-medium text-fg">Products at the stall</legend>
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {products.map((x) => {
            const on = p.productIds.includes(x.id);
            const left = stallLeft(p, data, handle, x.id);
            const sold = stallSold(data, handle, x.id);
            return (
              <li key={x.id} className="flex min-h-[44px] flex-wrap items-center gap-2 px-3 py-1.5">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-label text-fg">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={on}
                    onChange={() => patch({ productIds: on ? p.productIds.filter((id) => id !== x.id) : [...p.productIds, x.id] })} />
                  
                  <span className="min-w-0">
                    <span className="block truncate">{x.name}</span>
                    {on &&
                    <span className="block text-caption text-fg-subtle">
                        {sold} sold here{left !== null ? ` · ${left} left at the stall${p.holdStock && st.state !== 'closed' && left > 0 ? ' (set aside)' : ''}` : ''}
                      </span>
                    }
                  </span>
                </label>
                {on &&
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  aria-label={`Most to sell at the stall: ${x.name}`}
                  placeholder="No limit"
                  value={p.stallLimits[x.id] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const next = { ...p.stallLimits };
                    if (v === '' || !(Number(v) >= 0)) delete next[x.id];else
                    next[x.id] = Math.floor(Number(v));
                    patch({ stallLimits: next });
                  }}
                  className="h-9 w-24 rounded-sm border border-line-strong bg-raised px-2 text-caption text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />

                }
              </li>);

          })}
        </ul>
        <div className="mt-3">
          <Switch
            id="popup-hold"
            label="Set stall units aside"
            description={
            p.holdStock ?
            'Your main shop and other spaces can’t sell the units still left at the stall. They’re released when the pop-up closes or its last session ends.' :
            'Off: a stall limit only caps what this pop-up sells, and units come out of your normal stock as orders arrive.'
            }
            checked={!!p.holdStock}
            onChange={(holdStock) => patch({ holdStock })} />
          
          {p.holdStock && Object.keys(p.stallLimits).filter((id) => p.productIds.includes(id)).length === 0 &&
          <p className="mt-1.5 text-caption text-warning">Add a stall limit to a product to set units aside.</p>
          }
          {p.holdStock && st.state === 'closed' && <p className="mt-1.5 text-caption text-fg-subtle">Closed — everything set aside has gone back to your main stock.</p>}
        </div>
      </fieldset>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-label font-medium text-fg">
            To collect <span className="font-normal tabular-nums text-fg-subtle">· {toCollect} of {orders.length}</span>
          </h4>
          <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} disabled={!orders.length} onClick={() => downloadCsv(`${handle}-pickups.csv`, popupOrdersCsv(orders))}>
            CSV
          </Button>
        </div>
        {orders.length === 0 ?
        <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">No pickup orders yet. They appear here, grouped by session.</p> :

        <div className="flex flex-col gap-3">
            {sortedSessions(p).
          filter((s) => usedSessions.has(s.id)).
          map((s) => {
            const list = orders.filter((o) => o.popup?.sessionId === s.id);
            return (
              <div key={s.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-caption font-semibold text-fg-muted">{sessionWhen(s)}</p>
                      <Button
                    size="sm"
                    variant="tertiary"
                    leadingIcon={PrinterIcon}
                    aria-label={`Print packing slips for ${sessionWhen(s)}`}
                    onClick={() => {
                      const ok = printPickupSlips({ shop: state.site.title || 'Pop-up shop', venue: p.venue, sessionWhen: sessionWhen(s), orders: list });
                      if (!ok) toast.error('Your browser blocked the print tab', { description: 'Allow pop-ups for this site, then try again.' });
                    }}>
                    
                        Slips
                      </Button>
                    </div>
                    <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
                      {list.map((o) => {
                    const done = !!o.popup?.collectedAt;
                    const owe = o.popup?.payAtStall && o.paymentStatus === 'pending';
                    return (
                      <li key={o.id} className="flex items-center gap-2 px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className={cn('truncate text-label text-fg', done && 'text-fg-subtle line-through')}>
                                #{o.number} · {o.customer.name}
                              </p>
                              <p className="truncate text-caption text-fg-subtle">
                                {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                                {owe ? ` · collect ${formatNgn(o.subtotalNgn - o.discountNgn)}` : ''}
                              </p>
                            </div>
                            <Button
                          size="sm"
                          variant={done ? 'tertiary' : 'secondary'}
                          leadingIcon={done ? CheckIcon : undefined}
                          aria-label={done ? `Undo collected for order ${o.number}` : `Mark order ${o.number} collected${owe ? ' and paid' : ''}`}
                          onClick={() => {
                            setCollected(o.id, !done);
                            if (!done) toast(`Order #${o.number} collected`, { description: owe ? 'Marked as paid at the stall.' : undefined, action: { label: 'Undo', onClick: () => setCollected(o.id, false) } });
                          }}>
                          
                              {done ? 'Collected' : owe ? 'Paid & collected' : 'Collected?'}
                            </Button>
                          </li>);

                  })}
                    </ul>
                  </div>);

          })}
          </div>
        }
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link to={qrHref({ spaceId: currentSpace.id, path: '' }, `${state.site.title} stall sign`)} className={linkClass}>
          <PrinterIcon size={13} aria-hidden /> Stall sign with QR code
        </Link>
        <Link to="/app/commerce/orders" className={linkClass}>
          <StoreIcon size={13} aria-hidden /> All orders
        </Link>
      </div>
      <p className="-mt-2 text-caption text-fg-subtle">Opens the QR code for this page — download it, or print the A4/A5 sign from the Print sheet. Scans count in Analytics as this space.</p>

      {p.closedAt ?
      <Button size="sm" variant="secondary" className="self-start" onClick={() => patch({ closedAt: null })}>
          Reopen the pop-up
        </Button> :

      st.state !== 'closed' &&
      <Button
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => {
          patch({ closedAt: new Date().toISOString() });
          toast('Pop-up closed early', { description: 'Visitors see “Closed” once you publish. Orders already placed stay in your list.', action: { label: 'Undo', onClick: () => actions.undo() } });
        }}>
        
            Close early
          </Button>

      }
    </section>);

}