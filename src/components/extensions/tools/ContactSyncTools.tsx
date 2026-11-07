import React, { useMemo } from 'react';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { InstalledExtension } from '../../../types/marketplace';
import { useOps } from '../../../contexts/OpsContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useFormsStore } from '../../../hooks/useFormsStore';
import { isValidEmail } from '../../../utils/validation';
import { downloadCsv, toCsv } from '../../../utils/csv';
import { formatTimestamp } from '../../../utils/format';
import { orderRef } from '../../../utils/commerce/shopSettings';
import { preflight, readSyncLog, withSyncEntry, type SyncEntry } from '../../../utils/extensions/syncLog';
import { uid } from '../../../utils/id';
import { Button } from '../../ui/Button';
import { ToolSection, ToolStat } from './ToolSection';
import { SyncHistory } from './SyncHistory';

const today = () => new Date().toISOString().slice(0, 10);
const API_KEY = /^([0-9a-f]{32}-us\d{1,2}|xkeysib-[0-9a-f]{64}-[A-Za-z0-9]{16})$/;
const SHEET_URL = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{20,}/;

/** Email marketing sync (D232, D272): only subscribed contacts with an email, never buyers-only or unsubscribed. */
export function EmailSyncTool({ rec }: { rec: InstalledExtension }) {
  const { data } = useOps();
  const market = useMarketplace();
  const provider = rec.settings.apiKey?.startsWith('xkeysib-') ? 'Brevo' : 'Mailchimp';
  const log = readSyncLog(rec.settings);
  const { send, noEmail, notSubscribed, fromForms } = useMemo(() => {
    const subscribed = data.contacts.filter((c) => c.consent === 'subscribed');
    const ok = subscribed.filter((c) => isValidEmail(c.email));
    return { send: ok, noEmail: subscribed.length - ok.length, notSubscribed: data.contacts.length - subscribed.length, fromForms: ok.filter((c) => c.sources.includes('form')).length };
  }, [data.contacts]);

  const sync = (retryOf?: SyncEntry) => {
    const error = preflight(rec.settings.apiKey, API_KEY, `${provider} API key`);
    const entry: SyncEntry = error
      ? { id: uid('sync'), at: new Date().toISOString(), status: 'failed', sent: 0, skipped: 0, detail: '', error, retryOf: retryOf?.id }
      : {
          id: uid('sync'),
          at: new Date().toISOString(),
          status: noEmail > 0 ? 'partial' : 'ok',
          sent: send.length,
          skipped: noEmail,
          detail: noEmail > 0 ? `${noEmail} subscribed without a valid email` : `to ${provider}, with tags`,
          retryOf: retryOf?.id,
        };
    market.updateSettings(rec.id, withSyncEntry(rec.settings, entry));
    if (error) toast.error('Sync failed', { description: error });
    else toast(`${send.length} contacts ready for ${provider}`, { description: 'Preview — nothing was sent. The live connection needs the KUBICU backend.' });
  };

  return (
    <ToolSection title={`Sync to ${provider}`} simulated="Preview: shows exactly who would be sent. Nothing leaves this device until the backend is connected.">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ToolStat label="Would be sent" value={send.length} hint={fromForms ? `${fromForms} from forms` : undefined} />
        <ToolStat label="Subscribed, no email" value={noEmail} />
        <ToolStat label="Never sent" value={notSubscribed} hint="Buyers-only or unsubscribed" />
      </dl>
      <p className="text-caption text-fg-muted">{rec.settings.lastSyncAt ? `Last synced ${formatTimestamp(rec.settings.lastSyncAt)} · ${rec.settings.lastSyncCount} contacts` : 'Not synced yet.'} Tags go across as {provider} tags.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" leadingIcon={RefreshCwIcon} onClick={() => sync()} disabled={send.length === 0}>
          Sync now
        </Button>
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={DownloadIcon}
          disabled={send.length === 0}
          onClick={() => downloadCsv(`kubicu-subscribers-${today()}.csv`, toCsv(['email', 'name', 'phone', 'tags'], send.map((c) => [c.email, c.name, c.phone, c.tags.join(';')])))}
        >
          Download list
        </Button>
      </div>
      <div className="border-t border-line pt-4">
        <SyncHistory entries={log} unit="contacts" onRetry={sync} />
      </div>
    </ToolSection>
  );
}

/** Google Sheets sync (D232, D272): the rows each tab would get, downloadable per tab, with a history of syncs. */
export function SheetsSyncTool({ rec }: { rec: InstalledExtension }) {
  const { data: commerce } = useCommerce();
  const { data: ops } = useOps();
  const { current } = useWorkspace();
  const forms = useFormsStore(current.id).data;
  const market = useMarketplace();
  const log = readSyncLog(rec.settings);

  const tabs = useMemo(() => {
    const formName = (id: string) => forms?.forms.find((f) => f.id === id)?.name ?? '';
    return [
      {
        id: 'orders',
        label: 'Orders',
        headers: ['date', 'order', 'customer', 'phone', 'items', 'total', 'payment', 'status'],
        rows: commerce.orders.map((o) => [o.createdAt, orderRef(o), o.customer.name, o.customer.phone, o.items.map((i) => `${i.qty}× ${i.name}`).join('; '), o.subtotalNgn - o.discountNgn + o.deliveryNgn, o.paymentStatus, o.status]),
      },
      {
        id: 'bookings',
        label: 'Bookings',
        headers: ['booked_for', 'ref', 'service', 'customer', 'phone', 'status', 'deposit_paid'],
        rows: ops.bookings.map((b) => [b.start, b.ref, b.serviceName, b.customer.name, b.customer.phone, b.status, b.depositPaidNgn]),
      },
      {
        id: 'responses',
        label: 'Form responses',
        headers: ['date', 'form', 'name', 'email', 'source', 'status'],
        rows: (forms?.submissions ?? []).map((s) => [s.createdAt, formName(s.formId), s.contactName, s.contactEmail, s.source, s.status]),
      },
    ];
  }, [commerce.orders, ops.bookings, forms]);

  const sync = (retryOf?: SyncEntry) => {
    const error = preflight(rec.settings.sheetUrl, SHEET_URL, 'Google Sheet address');
    // Only rows added since the last good sync would go across.
    const since = rec.settings.lastSyncAt ? Date.parse(rec.settings.lastSyncAt) : 0;
    const fresh = tabs.map((t) => ({ label: t.label, n: t.rows.filter((r) => Date.parse(String(r[0])) > since).length }));
    const sent = fresh.reduce((s, f) => s + f.n, 0);
    const entry: SyncEntry = error
      ? { id: uid('sync'), at: new Date().toISOString(), status: 'failed', sent: 0, skipped: 0, detail: '', error, retryOf: retryOf?.id }
      : {
          id: uid('sync'),
          at: new Date().toISOString(),
          status: 'ok',
          sent,
          skipped: 0,
          detail: sent ? fresh.filter((f) => f.n).map((f) => `${f.label} ${f.n}`).join(', ') : 'nothing new since the last sync',
          retryOf: retryOf?.id,
        };
    market.updateSettings(rec.id, withSyncEntry(rec.settings, entry));
    if (error) toast.error('Sync failed', { description: error });
    else toast(sent ? `${sent} new rows checked` : 'Nothing new to add', { description: 'Preview — nothing was added to your sheet. Adding rows needs the KUBICU backend.' });
  };

  return (
    <ToolSection title="Your sheet" simulated="Preview: each tab shows the rows your sheet would get. Download a tab to paste it in yourself.">
      <ul className="flex flex-col divide-y divide-line">
        {tabs.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-label font-medium text-fg">{t.label}</span>
              <span className="block text-caption text-fg-muted">{t.rows.length} rows</span>
            </span>
            <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} disabled={t.rows.length === 0} onClick={() => downloadCsv(`kubicu-${t.id}-${today()}.csv`, toCsv(t.headers, t.rows))}>
              Download
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-fg-muted">{rec.settings.lastSyncAt ? `Last synced ${formatTimestamp(rec.settings.lastSyncAt)}` : 'Not synced yet.'}</p>
        <Button size="sm" leadingIcon={RefreshCwIcon} onClick={() => sync()}>
          Sync now
        </Button>
      </div>
      <div className="border-t border-line pt-4">
        <SyncHistory entries={log} unit="rows" onRetry={sync} />
      </div>
    </ToolSection>
  );
}
