import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LockIcon } from 'lucide-react';
import type { DealRoomSettings, DealRoomType } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Segmented } from '../../ui/Segmented';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Dialog } from '../../ui/Dialog';
import { fieldControlClass } from '../../ui/Field';
import { missedGoalFeeImpact, roomOrders, roomProgress, roomReferrers, roomStateLabel, roomTypeLabel } from '../../../utils/dealRoom';
import { IllustrativeTag } from '../../ui/IllustrativeTag';
import { orderMoney } from '../../../utils/commerce/money';
import { formatSchedule, timeZoneLabel } from '../../../utils/schedule';
import { formatNgn } from '../../../utils/format';
import { uid } from '../../../utils/id';
import { cn } from '../../../utils/cn';

/** Seller controls for a DealRoom (D54). Terms lock once anyone has joined; only extending stays open. */
export function DealRoomSettingsPanel() {
  // Shared inputs translate their own labels; headings, notes, buttons and built lines are translated here (D309).
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const { data } = useCommerce();
  const room = state.site.dealRoom;
  const [update, setUpdate] = useState('');
  const [dialog, setDialog] = useState<'extend' | 'end' | null>(null);
  const [newDeadline, setNewDeadline] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  if (!room) return null;

  const handle = state.published?.handle ?? state.site.handle;
  const p = roomProgress(room, handle, data);
  const orders = roomOrders(data, handle);
  const locked = orders.length > 0;
  const products = data.products.filter((x) => x.status === 'active' && x.kind === 'physical');
  const revenue = orders.reduce((t, o) => t + orderMoney(o).gross, 0);
  const held = data.orders.filter((o) => o.sourceHandle === handle && o.held).length;
  const ended = p.state === 'ended_missed' || p.state === 'ended_success';
  const settled = data.settledRooms?.[handle];
  const impact = missedGoalFeeImpact(data.orders.filter((o) => o.sourceHandle === handle && o.held));
  const referrers = roomReferrers(data, handle);

  const patch = (patchRoom: Partial<DealRoomSettings>) => actions.transformDocument((doc) => doc.dealRoom ? { ...doc, dealRoom: { ...doc.dealRoom, ...patchRoom } } : doc);

  const postUpdate = () => {
    if (!update.trim()) return;
    patch({ updates: [{ id: uid('upd'), at: new Date().toISOString(), text: update.trim() }, ...room.updates] });
    setUpdate('');
    toast(tr('Update added to the room'), { description: `${tr('Buyers who would get it on WhatsApp (preview only): {n}.', { n: orders.length })} ${tr('Publish to show it on the page.')}` });
  };

  const extend = () => {
    if (!newDeadline || !room.deadline || Date.parse(newDeadline) <= Date.parse(room.deadline) || !reason.trim()) return;
    patch({ deadline: newDeadline, extensions: [...room.extensions, { at: new Date().toISOString(), from: room.deadline, to: newDeadline, reason: reason.trim() }] });
    setDialog(null);
    toast(tr('Deadline extended'), { description: tr('Buyers would be told the new deadline (preview only). Publish to apply it.') });
  };

  const endNow = () => {
    if (!reason.trim()) return;
    patch({ endedAt: new Date().toISOString(), updates: [{ id: uid('upd'), at: new Date().toISOString(), text: `Room closed early: ${reason.trim()}` }, ...room.updates] });
    setDialog(null);
    toast(tr('Room will end when you publish'), { description: tr(room.type === 'goal' && p.count < p.target ? 'The goal isn’t met, so everyone will be refunded in full automatically.' : 'No new orders after that.') });
  };

  const lockNote = locked ?
  <p className="flex items-start gap-1.5 text-caption text-fg-subtle">
      <LockIcon size={12} className="mt-0.5 shrink-0" aria-hidden /> {tr('Terms are locked because people have joined. You can still extend the deadline.')}
    </p> :
  null;

  return (
    <section aria-labelledby="room-heading-settings" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="room-heading-settings" className="text-label font-semibold text-fg">
            DealRoom
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">
            {tr(roomTypeLabel[room.type])}
            {room.deadline ? ` · ${tr('ends {when}', { when: formatSchedule(room.deadline) })}` : ''}
          </p>
        </div>
        <Badge tone={p.state === 'ended_missed' ? 'danger' : p.state === 'live' ? 'success' : p.state === 'goal_reached' ? 'success' : 'neutral'} dot>
          {tr(roomStateLabel[p.state])}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-md bg-sunken p-3">
        <div>
          <dt className="text-caption text-fg-subtle">{tr(room.type === 'goal' ? 'Joined' : 'Sold')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">
            {p.count}
            <span className="font-normal text-fg-subtle"> / {p.target}</span>
          </dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Revenue')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{formatNgn(revenue)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Held')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{held}</dd>
        </div>
      </dl>
      {settled?.outcome === 'missed' &&
      <p className="rounded-md bg-danger-soft px-3 py-2.5 text-caption text-danger">
          {tr('Goal missed on {when}. Buyers refunded in full: {n}. Stock was returned.', { when: formatSchedule(settled.at), n: settled.refunded })}
        </p>
      }
      {held > 0 && !ended && <p className="text-caption text-fg-muted">{tr('Orders paid and waiting for the goal: {n}. Don’t pack them yet — they’re released automatically when the goal is reached.', { n: held })}</p>}
      {room.type === 'goal' && !ended &&
      <div className="rounded-md border border-line px-3 py-2.5 text-caption text-fg-muted">
          <p className="flex items-center gap-1.5 font-medium text-fg">
            {tr('If the goal is missed')} <IllustrativeTag note={tr('Illustrative provider rate. Many providers keep their processing fee when a payment is refunded — confirm with yours before going live.')} />
          </p>
          <p className="mt-1">
            {held > 0 ? tr('{amount} goes back in full to buyers: {n}.', { amount: formatNgn(impact.refundNgn), n: held }) : tr('Every buyer gets 100% back.')}{' '}
            {tr('KUBICU waives its fee on those orders.')}{' '}
            {held > 0 ?
          tr('The payment provider usually keeps its processing fee — about {amount} here, a cost to you.', { amount: formatNgn(impact.providerFeesNgn) }) :
          tr('The payment provider usually keeps its processing fee, so each refund costs you that fee.')}
          </p>
        </div>
      }

      <fieldset disabled={locked} className="flex flex-col gap-3">
        <Segmented<DealRoomType>
          ariaLabel={tr('Room type')}
          fullWidth
          value={room.type}
          onChange={(type) => patch({ type, goal: type === 'goal' ? room.goal ?? 10 : room.goal, seats: type === 'drop' ? room.seats ?? 20 : room.seats })}
          options={[
          { value: 'drop', label: 'Limited drop' },
          { value: 'goal', label: 'Group goal' }]
          } />
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-product" className="text-label font-medium text-fg">
            {tr('Product')}
          </label>
          <select id="room-product" value={room.productId} disabled={locked} onChange={(e) => patch({ productId: e.target.value })} className={cn(fieldControlClass, 'h-10')}>
            <option value="">{tr('Choose a product')}</option>
            {products.map((x) =>
            <option key={x.id} value={x.id}>
                {x.name}
              </option>
            )}
          </select>
          {products.length === 0 &&
          <p className="text-caption text-fg-subtle">
              {tr('No active physical products.')}{' '}
              <Link to="/app/commerce/products" className="font-medium text-fg underline underline-offset-2">
                {tr('Add one')}
              </Link>
            </p>
          }
        </div>
        <CurrencyInput
          id="room-price"
          label={tr('Room price')}
          optional
          value={room.priceNgn}
          disabled={locked}
          onChange={(priceNgn) => patch({ priceNgn })}
          hint={p.normalPriceNgn !== null ? tr('Usually {amount}. Empty uses the normal price.', { amount: formatNgn(p.normalPriceNgn) }) : tr('Empty uses the product’s price.')} />
        
        <div className="grid grid-cols-2 gap-3">
          {room.type === 'goal' ?
          <TextInput id="room-goal" label="Buyers needed" type="number" min={2} value={room.goal ?? ''} disabled={locked} onChange={(e) => patch({ goal: e.target.value ? Math.max(0, Math.floor(Number(e.target.value))) : null })} /> :

          <TextInput id="room-seats" label="Units in the drop" type="number" min={1} value={room.seats ?? ''} disabled={locked} onChange={(e) => patch({ seats: e.target.value ? Math.max(0, Math.floor(Number(e.target.value))) : null })} />
          }
          <TextInput id="room-limit" label="Per person" type="number" min={1} value={room.perPersonLimit} disabled={locked} onChange={(e) => patch({ perPersonLimit: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
        </div>
        <DateTimeInput id="room-open" label={tr('Opens')} optional clearable value={room.opensAt} disabled={locked} onChange={(opensAt) => patch({ opensAt })} hint={tr('Empty = when published')} />
      </fieldset>
      {!locked && <DateTimeInput id="room-deadline" label={tr('Deadline')} value={room.deadline} clearable onChange={(deadline) => patch({ deadline })} hint={tr('In {zone}', { zone: timeZoneLabel() })} />}
      {lockNote}

      {!ended &&
      <div className="flex flex-wrap gap-2">
          {locked && room.deadline &&
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setNewDeadline(new Date(Date.parse(room.deadline as string) + 2 * 86400000).toISOString());
            setReason('');
            setDialog('extend');
          }}>
          
              {tr('Extend deadline')}
            </Button>
        }
          <Button
          size="sm"
          variant="tertiary"
          onClick={() => {
            setReason('');
            setDialog('end');
          }}>
          
            {tr('End early')}
          </Button>
        </div>
      }
      {room.extensions.length > 0 &&
      <ul className="flex flex-col gap-1 text-caption text-fg-muted">
          {room.extensions.map((x) =>
        <li key={x.at}>
              {tr('Extended to {when}', { when: formatSchedule(x.to) })} — {x.reason}
            </li>
        )}
        </ul>
      }

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <TextInput
          id="room-reward"
          label="Reward for sharing"
          optional
          value={room.referralReward ?? ''}
          placeholder={tr('e.g. Bring 3 friends and get free delivery')}
          hint="Every buyer gets their own link. You honour the reward — nothing is paid automatically."
          onChange={(e) => patch({ referralReward: e.target.value || undefined })} />
        
        {referrers.length > 0 &&
        <ol className="flex flex-col divide-y divide-line text-caption">
            {referrers.slice(0, 5).map((r) =>
          <li key={r.code} className="flex justify-between gap-2 py-1.5">
                <span className="truncate text-fg">
                  {r.name} <span className="font-mono text-fg-subtle">{r.code}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-fg">{tr('Joined: {n}', { n: r.joined })}</span>
              </li>
          )}
          </ol>
        }
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <TextArea id="room-update" label={tr('Post an update')} rows={2} value={update} placeholder={tr('e.g. 4 more to go — tell a friend!')} onChange={(e) => setUpdate(e.target.value)} hint={tr('Shows on the room and goes to everyone who joined (preview only).')} />
        <Button size="sm" variant="secondary" className="self-start" disabled={!update.trim()} onClick={postUpdate}>
          {tr('Add update')}
        </Button>
      </div>

      {orders.length > 0 &&
      <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          <p className="text-label font-medium text-fg">{tr('Who joined')}</p>
          <ul className="flex flex-col divide-y divide-line text-caption">
            {orders.slice(0, 6).map((o) =>
          <li key={o.id} className="flex justify-between gap-2 py-1.5">
                <span className="truncate text-fg">
                  {o.customer.name} <span className="text-fg-subtle">#{o.number}</span>
                </span>
                <span className="shrink-0 text-fg-muted">
                  {o.referredBy ? `${tr('via {name}', { name: o.referredBy })} · ` : ''}
                  {tr(o.held ? 'Held' : 'Ready')}
                </span>
              </li>
          )}
          </ul>
          <Link to="/app/commerce/orders" className="text-caption font-medium text-fg underline underline-offset-2">
            {tr('All orders')}
          </Link>
        </div>
      }

      <Dialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        size="sm"
        title={tr(dialog === 'extend' ? 'Extend the deadline' : 'End the room early?')}
        description={
        dialog === 'extend' ?
        tr('Buyers are told the new deadline. Other terms stay as they are.') :
        room.type === 'goal' && p.count < p.target ?
        tr('The goal isn’t met, so every buyer is refunded in full. Buyers: {n}.', { n: p.count }) :
        tr('No new orders after it ends. Existing orders are kept.')
        }
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              {tr('Cancel')}
            </Button>
            {dialog === 'extend' ?
          <Button onClick={extend} disabled={!reason.trim() || !newDeadline || !room.deadline || Date.parse(newDeadline) <= Date.parse(room.deadline)}>
                {tr('Extend')}
              </Button> :

          <Button variant="destructive" onClick={endNow} disabled={!reason.trim()}>
                {tr('End room')}
              </Button>
          }
          </>
        }>
        
        <div className="flex flex-col gap-3">
          {dialog === 'extend' && <DateTimeInput id="room-new-deadline" label={tr('New deadline')} value={newDeadline} onChange={setNewDeadline} />}
          <TextInput id="room-reason" label={tr('Reason (recorded and shown to buyers)')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={tr(dialog === 'extend' ? 'e.g. Supplier delay, more time to fill' : 'e.g. Stock problem')} />
        </div>
      </Dialog>
    </section>);

}