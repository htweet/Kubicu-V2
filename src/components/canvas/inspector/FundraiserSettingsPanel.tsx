import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { DownloadIcon } from 'lucide-react';
import type { FundraiserSettings } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useT } from '../../../contexts/LocaleContext';
import { useMoney } from '../../../hooks/useMoney';
import { blankLink, isVerified, refundLinkPayment, uniqueSlug } from '../../../utils/money/store';
import { readAdminStore } from '../../../utils/admin/store';
import { fundraiserEnd, fundraiserProgress, fundraiserStateLabel, kept, syncFundraiserLink } from '../../../utils/fundraiser';
import { downloadCsv, toCsv } from '../../../utils/csv';
import { formatNgn } from '../../../utils/format';
import { formatSchedule } from '../../../utils/schedule';
import { uid } from '../../../utils/id';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { Dialog } from '../../ui/Dialog';
import { Switch } from '../../ui/Switch';
import { TextArea } from '../../ui/TextArea';
import { TextInput } from '../../ui/TextInput';

/**
 * Organiser controls for a Fundraiser (D179): details, progress, supporters, updates, extend or close.
 * Translated in D308. The CSV column headings stay English so exported files read the same for everyone.
 */
export function FundraiserSettingsPanel() {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const { current } = useWorkspace();
  const money = useMoney(current.id);
  const [update, setUpdate] = useState('');
  const [dialog, setDialog] = useState<'extend' | 'close' | null>(null);
  const [newEnd, setNewEnd] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [refunding, setRefunding] = useState<string | null>(null);
  const f = state.site.fundraiser;
  if (!f) return null;

  const handle = state.published?.handle ?? state.site.handle;
  const link = money.data.links.find((l) => l.id === f.linkId);
  const verified = isVerified(money.data);
  const paused = !!readAdminStore().pausedFundraisers?.[handle];
  const p = fundraiserProgress(f, link, { verified, pausedByStaff: paused });
  const end = fundraiserEnd(f);
  const ended = p.state === 'ended';
  const amountsText = f.amounts.join(', ');

  /** Saves the settings on the page and keeps the payment link in step, in one go. */
  const patch = (next: Partial<FundraiserSettings>) => {
    const merged = { ...f, ...next };
    actions.transformDocument((doc) => (doc.fundraiser ? { ...doc, fundraiser: { ...doc.fundraiser, ...next } } : doc));
    money.update((d) => ({ ...d, links: d.links.map((l) => (l.id === f.linkId ? syncFundraiserLink(l, merged, state.site.title, handle, true) : l)) }));
  };

  const recreateLink = () => {
    const id = uid('pl');
    money.update((d) => ({ ...d, links: [syncFundraiserLink({ ...blankLink(), id, slug: uniqueSlug(d, state.site.title || 'fundraiser') }, f, state.site.title, handle, true), ...d.links] }));
    actions.transformDocument((doc) => (doc.fundraiser ? { ...doc, fundraiser: { ...doc.fundraiser, linkId: id } } : doc));
    toast(tr('New payment link created'), { description: tr('The total starts again from real payments on the new link.') });
  };

  const postUpdate = () => {
    if (!update.trim()) return;
    patch({ updates: [{ id: uid('upd'), at: new Date().toISOString(), text: update.trim() }, ...f.updates] });
    setUpdate('');
    toast(tr('Update added'), { description: tr('Publish to show it on the page.') });
  };

  const extend = () => {
    if (!newEnd || Date.parse(newEnd) <= Date.now() || (f.endsAt && Date.parse(newEnd) <= Date.parse(f.endsAt)) || !reason.trim()) return;
    patch({ endsAt: newEnd, closedAt: null, extensions: [...f.extensions, { at: new Date().toISOString(), from: f.endsAt ?? '', to: newEnd, reason: reason.trim() }] });
    setDialog(null);
    toast(tr('End date extended'), { description: tr('The new date and your reason show on the page.') });
  };

  const close = () => {
    patch({ closedAt: new Date().toISOString() });
    setDialog(null);
    toast(tr('Fundraiser closed'), { description: tr('Payments have stopped. The final total stays on the page.') });
  };

  const exportCsv = () => {
    if (!link) return;
    const rows = link.payments.map((x) => [x.at, x.receipt, x.payerName, x.payerPhone, x.amountNgn, x.refundedNgn ?? 0, x.showName ? 'Yes' : 'No', x.note]);
    downloadCsv(`${handle}-supporters.csv`, toCsv(['Paid at', 'Receipt', 'Name', 'Phone', 'Amount', 'Refunded', 'Name shown', 'Message'], rows));
  };

  const doRefund = () => {
    if (!refunding) return;
    money.update((d) => refundLinkPayment(d, f.linkId, refunding));
    setRefunding(null);
    toast(tr('Refunded in full (test mode)'), { description: tr('It no longer counts towards the total.') });
  };

  const refundTarget = link?.payments.find((x) => x.id === refunding);
  const who = (name: string) => name || tr('this supporter');
  const hasEnd = !!(f.endsAt || f.closedAt);

  return (
    <section aria-labelledby="fund-settings-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="fund-settings-heading" className="text-label font-semibold text-fg">
            {tr('Fundraiser')}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">{end ? tr(ended ? 'Ended {when}' : 'Closes {when}', { when: formatSchedule(end) }) : tr('No end date')}</p>
        </div>
        <Badge tone={p.state === 'live' || p.state === 'goal_reached' ? 'success' : p.state === 'ended' ? 'neutral' : 'danger'} dot>
          {tr(fundraiserStateLabel[p.state])}
        </Badge>
      </div>

      {!verified && (
        <p className="rounded-md bg-warning-soft px-3 py-2.5 text-caption text-fg">
          {tr('Your workspace isn’t verified, so this fundraiser can’t publish or take payments.')}{' '}
          <Link to="/app/commerce/verification" className="font-semibold underline underline-offset-2">
            {tr('Finish verification')}
          </Link>
        </p>
      )}
      {paused && <p className="rounded-md bg-danger-soft px-3 py-2.5 text-caption text-fg">{tr('KUBICU paused this fundraiser while it reviews a report. Visitors can’t pay until staff resume it. You’ll get a message with the outcome.')}</p>}
      {!link && (
        <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
          <p className="text-caption text-fg">{tr('The payment link behind this fundraiser was deleted.')}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={recreateLink}>
            {tr('Create a new payment link')}
          </Button>
        </div>
      )}

      <dl className="grid grid-cols-3 gap-2 rounded-md bg-sunken p-3">
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Raised')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{formatNgn(p.raisedNgn)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Goal')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">
            {formatNgn(f.goalNgn)} <span className="font-normal text-fg-subtle">· {p.pct}%</span>
          </dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Supporters')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{p.supporters}</dd>
        </div>
      </dl>

      <TextArea id="fund-purpose" label={tr('What the money is for')} rows={2} value={f.purpose} error={!f.purpose.trim() ? tr('Needed to publish.') : undefined} onChange={(e) => patch({ purpose: e.target.value })} />
      <div className="grid gap-3">
        <TextInput id="fund-org" label={tr('Organiser')} value={f.organiser} onChange={(e) => patch({ organiser: e.target.value })} />
        <TextInput id="fund-ben" label={tr('Who benefits')} optional value={f.beneficiary} onChange={(e) => patch({ beneficiary: e.target.value })} />
        <CurrencyInput id="fund-goal" label={tr('Goal')} value={f.goalNgn} onChange={(v) => patch({ goalNgn: v ?? 0 })} hint={tr('A target, not a condition — you keep what’s raised.')} />
        <TextInput
          id="fund-amounts"
          label={tr('Suggested amounts (₦)')}
          defaultValue={amountsText}
          key={amountsText}
          hint={tr('Up to 4, separated by commas.')}
          onBlur={(e) =>
            patch({
              amounts: e.target.value
                .split(/[,\s]+/)
                .map((s) => Math.floor(Number(s.replace(/[^\d]/g, ''))))
                .filter((n) => n >= f.minNgn)
                .slice(0, 4),
            })
          }
        />
        <CurrencyInput id="fund-min" label={tr('Minimum')} value={f.minNgn} onChange={(v) => patch({ minNgn: Math.max(100, v ?? 100) })} />
        <Switch id="fund-msg" label={tr('Let supporters leave a message')} description={tr('Messages come to you only.')} checked={f.askMessage} onChange={(askMessage) => patch({ askMessage })} />
      </div>

      {link && link.payments.length > 0 && (
        <section aria-labelledby="fund-recent" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h4 id="fund-recent" className="text-label font-medium text-fg">
              {tr('Supporters')}
            </h4>
            <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} onClick={exportCsv}>
              {tr('Export CSV')}
            </Button>
          </div>
          <ul className="scroll-quiet flex max-h-56 flex-col divide-y divide-line overflow-y-auto rounded-md border border-line">
            {link.payments.slice(0, 30).map((x) => (
              <li key={x.id} className="flex items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label text-fg">
                    {x.payerName || tr('No name')}
                    {!x.showName && <span className="text-caption text-fg-subtle"> · {tr('shown as Anonymous')}</span>}
                  </span>
                  <span className="block truncate text-caption text-fg-subtle">
                    {formatSchedule(x.at)}
                    {x.note ? ` · “${x.note}”` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={x.refundedNgn ? 'block text-label tabular-nums text-fg-subtle line-through' : 'block text-label font-semibold tabular-nums text-fg'}>{formatNgn(x.amountNgn)}</span>
                  {x.refundedNgn ? (
                    <span className="block text-caption text-fg-subtle">{tr('Refunded')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRefunding(x.id)}
                      aria-label={tr('Refund {amount} from {name}', { amount: formatNgn(x.amountNgn), name: who(x.payerName) })}
                      className="-my-1 inline-flex min-h-[36px] items-center rounded-sm px-1 text-caption font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {tr('Refund')}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-caption text-fg-subtle">
            {tr('{amount} kept after refunds.', { amount: formatNgn(link.payments.reduce((s, x) => s + kept(x), 0)) })} {tr('Payments settle into your wallet like any payment link.')}
          </p>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <TextArea id="fund-update" label={tr('Post an update')} optional rows={2} value={update} placeholder={tr('e.g. We bought the first 10 sets of books today — thank you!')} onChange={(e) => setUpdate(e.target.value)} />
        <Button size="sm" variant="secondary" className="self-start" disabled={!update.trim()} onClick={postUpdate}>
          {tr('Add update')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setNewEnd(null);
            setReason('');
            setDialog('extend');
          }}
        >
          {tr(hasEnd ? 'Extend end date…' : 'Set an end date…')}
        </Button>
        {!ended && (
          <Button size="sm" variant="tertiary" onClick={() => setDialog('close')}>
            {tr('Close early…')}
          </Button>
        )}
      </div>

      <Dialog
        open={dialog === 'extend'}
        onClose={() => setDialog(null)}
        title={tr(hasEnd ? 'Extend the end date' : 'Set an end date')}
        description={tr('The new date and your reason show on the page, so supporters know why it changed.')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              {tr('Cancel')}
            </Button>
            <Button onClick={extend} disabled={!newEnd || !reason.trim()}>
              {tr('Save')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <DateTimeInput id="fund-new-end-date" label={tr('New end')} value={newEnd} onChange={setNewEnd} error={newEnd && Date.parse(newEnd) <= Date.now() ? tr('Pick a time in the future.') : undefined} />
          <TextInput id="fund-new-end-reason" label={tr('Reason')} value={reason} placeholder={tr('e.g. Books cost more than we expected')} onChange={(e) => setReason(e.target.value)} />
        </div>
      </Dialog>

      <Dialog
        open={dialog === 'close'}
        onClose={() => setDialog(null)}
        title={tr('Close this fundraiser now?')}
        description={tr('Payments stop straight away. {amount} raised stays yours and the final total stays on the page. You can reopen it by setting a new end date.', { amount: formatNgn(p.raisedNgn) })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              {tr('Keep it open')}
            </Button>
            <Button onClick={close}>{tr('Close fundraiser')}</Button>
          </>
        }
      />

      <Dialog
        open={!!refunding}
        onClose={() => setRefunding(null)}
        title={refundTarget ? tr('Refund {amount} to {name}?', { amount: formatNgn(refundTarget.amountNgn), name: who(refundTarget.payerName) }) : tr('Refund')}
        description={tr('They get back exactly what they paid, and it stops counting towards the total. Test mode — no real money moves.')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefunding(null)}>
              {tr('Cancel')}
            </Button>
            <Button variant="destructive" onClick={doRefund}>
              {tr('Refund in full')}
            </Button>
          </>
        }
      />
    </section>
  );
}
