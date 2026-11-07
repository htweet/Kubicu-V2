import React, { useState } from 'react';
import { CopyIcon, PlusIcon, RotateCwIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTeam } from '../../../contexts/TeamContext';
import { useDevelopers } from '../../../hooks/useDevelopers';
import { webhookEvents, AUTO_DISABLE_AFTER, RETRY_MINUTES } from '../../../data/developerApi';
import type { WebhookDelivery, WebhookEndpoint, WebhookEvent } from '../../../types/developers';
import { deliver, deliveryState, fakeSignature, isValidEndpoint, randomToken, retryDelivery, uid } from '../../../utils/developers';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';

const stateBadge = { delivered: { tone: 'success', label: 'Delivered' }, retrying: { tone: 'warning', label: 'Retrying' }, failed: { tone: 'danger', label: 'Failed' } } as const;

/** Webhook endpoints with signed test events, a delivery log and retries (D131). */
export function WebhooksSection({ canManage }: { canManage: boolean }) {
  const team = useTeam();
  const { data, update, workspaceId } = useDevelopers();
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [events, setEvents] = useState<Set<WebhookEvent>>(new Set(['order.paid']));
  const [tried, setTried] = useState(false);
  const [testFor, setTestFor] = useState<WebhookEndpoint | null>(null);
  const [testEvent, setTestEvent] = useState<WebhookEvent>('order.paid');
  const [viewing, setViewing] = useState<WebhookDelivery | null>(null);
  const urlError = isValidEndpoint(url);

  const add = () => {
    setTried(true);
    if (urlError || events.size === 0) return;
    const ep: WebhookEndpoint = { id: uid('we'), url: url.trim(), description: desc.trim(), events: [...events], secret: `whsec_${randomToken(28)}`, active: true, createdAt: new Date().toISOString() };
    update((d) => ({ ...d, endpoints: [ep, ...d.endpoints] }));
    team.log('settings', `added the webhook ${ep.url}`, '/app/settings/developers');
    toast.success('Endpoint added', { description: 'Send a test event to check it answers.' });
    setAdding(false);
    setUrl('');
    setDesc('');
    setEvents(new Set(['order.paid']));
    setTried(false);
  };

  const sendTest = () => {
    if (!testFor) return;
    let ok = false;
    update((d) => {
      const next = deliver(d, testFor, testEvent, workspaceId, true);
      ok = next.deliveries[0]?.ok ?? false;
      return next;
    });
    if (ok) toast.success('Test event delivered', { description: `${testFor.url} answered 200.` });
    else toast.error('Your endpoint didn’t accept it', { description: `We’ll retry in ${RETRY_MINUTES[0]} minute. Open the delivery to see the response.` });
    setTestFor(null);
  };

  const toggleEvent = (e: WebhookEvent) =>
    setEvents((cur) => {
      const n = new Set(cur);
      if (n.has(e)) n.delete(e);
      else n.add(e);
      return n;
    });

  const viewingEp = viewing && data.endpoints.find((e) => e.id === viewing.endpointId);
  const t = viewing ? Math.floor(new Date(viewing.at).getTime() / 1000) : 0;

  return (
    <Card
      id="webhooks"
      title="Webhooks"
      description={`We send a signed message to your address the moment something happens. Failed deliveries are retried ${RETRY_MINUTES.length} times over about 14 hours; an endpoint is turned off after ${AUTO_DISABLE_AFTER} failures in a row.`}
      body="flush"
      actions={canManage ? <Button size="sm" leadingIcon={PlusIcon} onClick={() => setAdding(true)}>Add endpoint</Button> : undefined}
    >
      {data.endpoints.length === 0 ? (
        <div className="px-5 py-6 md:px-6">
          <p className="text-label font-medium text-fg">No endpoints yet</p>
          <p className="text-caption text-fg-muted">Add one to send paid orders to your accounting tool, or new bookings to your calendar.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {data.endpoints.map((ep) => (
            <li key={ep.id} className="flex flex-col gap-3 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-label text-fg">{ep.url}</span>
                    {ep.active ? <Badge tone="success" dot>On</Badge> : <Badge tone={ep.autoDisabledAt ? 'danger' : 'neutral'}>{ep.autoDisabledAt ? 'Turned off after failures' : 'Paused'}</Badge>}
                  </span>
                  <span className="block text-caption text-fg-subtle">
                    {ep.description ? `${ep.description} · ` : ''}
                    {ep.events.length} event{ep.events.length === 1 ? '' : 's'}: {ep.events.join(', ')}
                  </span>
                </span>
                {canManage && (
                  <span className="flex shrink-0 items-center gap-2">
                    <Button size="sm" variant="secondary" leadingIcon={SendIcon} disabled={!ep.active} onClick={() => { setTestEvent(ep.events[0]); setTestFor(ep); }}>
                      Send test
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() => {
                        update((d) => ({ ...d, endpoints: d.endpoints.filter((e) => e.id !== ep.id), deliveries: d.deliveries.filter((x) => x.endpointId !== ep.id) }));
                        team.log('settings', `removed the webhook ${ep.url}`, '/app/settings/developers');
                        toast(`Removed ${ep.url}`);
                      }}
                    >
                      Remove
                    </Button>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Switch
                  id={`we-${ep.id}`}
                  checked={ep.active}
                  disabled={!canManage}
                  label="Send events"
                  onChange={(v) => update((d) => ({ ...d, endpoints: d.endpoints.map((e) => (e.id === ep.id ? { ...e, active: v, autoDisabledAt: v ? undefined : e.autoDisabledAt } : e)) }))}
                />
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-caption text-fg-subtle">Signing secret</span>
                  <code className="truncate font-mono text-caption text-fg-muted">{ep.secret.slice(0, 10)}••••</code>
                  <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => { void navigator.clipboard?.writeText(ep.secret); toast.success('Signing secret copied'); }}>
                    Copy
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.deliveries.length > 0 && (
        <div className="border-t border-line">
          <h3 className="px-5 pb-1 pt-4 text-label font-semibold text-fg md:px-6">Recent deliveries</h3>
          <ul className="divide-y divide-line">
            {data.deliveries.slice(0, 12).map((x) => {
              const s = deliveryState(x);
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => setViewing(x)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus md:px-6">
                    <Badge tone={stateBadge[s].tone}>{stateBadge[s].label}</Badge>
                    <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg">{x.event}</span>
                    <span className="hidden shrink-0 text-caption tabular-nums text-fg-subtle sm:inline">
                      {x.status} · {x.attempts} attempt{x.attempts === 1 ? '' : 's'}
                      {x.test ? ' · test' : ''}
                    </span>
                    <span className="shrink-0 text-caption text-fg-subtle">{formatRelative(x.at)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a webhook endpoint"
        description="Your server must answer with a 2xx status within 10 seconds."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add endpoint</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <TextInput id="we-url" label="Endpoint address" placeholder="https://example.com/kubicu/webhooks" value={url} onChange={(e) => setUrl(e.target.value)} error={tried ? urlError ?? undefined : undefined} hint="Prototype: an address containing “fail” answers 500, and “slow” times out." autoFocus />
          <TextInput id="we-desc" label="Description" optional placeholder="e.g. Accounting sync" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <fieldset>
            <legend className="text-label font-medium text-fg">Events to send</legend>
            <ul className="mt-2 grid gap-x-4 sm:grid-cols-2">
              {webhookEvents.map((e) => (
                <li key={e.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
                    <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={events.has(e.id)} onChange={() => toggleEvent(e.id)} />
                    <span className="min-w-0">
                      <span className="block text-label text-fg">{e.label}</span>
                      <span className="block font-mono text-caption text-fg-subtle">{e.id}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {tried && events.size === 0 && <p className="mt-1.5 text-caption text-danger">Pick at least one event.</p>}
          </fieldset>
        </div>
      </Dialog>

      <Dialog
        open={!!testFor}
        onClose={() => setTestFor(null)}
        size="sm"
        title="Send a test event"
        description={`Sample data, marked "livemode": false. Sent to ${testFor?.url ?? ''}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTestFor(null)}>
              Cancel
            </Button>
            <Button leadingIcon={SendIcon} onClick={sendTest}>
              Send
            </Button>
          </>
        }
      >
        <SelectInput id="we-test" label="Event" value={testEvent} onChange={setTestEvent} options={(testFor?.events ?? []).map((e) => ({ value: e, label: e }))} />
      </Dialog>

      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        size="lg"
        title={viewing ? `${viewing.event} · ${stateBadge[deliveryState(viewing)].label}` : ''}
        description={viewing ? `${viewingEp?.url ?? 'Removed endpoint'} · answered ${viewing.status} in ${viewing.durationMs} ms · ${viewing.attempts} attempt${viewing.attempts === 1 ? '' : 's'}${viewing.nextRetryAt ? ` · next retry ${formatRelative(viewing.nextRetryAt)}` : ''}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && !viewing.ok && canManage && viewingEp && (
              <Button
                leadingIcon={RotateCwIcon}
                onClick={() => {
                  let after: WebhookDelivery | undefined;
                  update((d) => {
                    const next = retryDelivery(d, viewing.id);
                    after = next.deliveries.find((x) => x.id === viewing.id);
                    return next;
                  });
                  if (after?.ok) toast.success('Delivered on retry');
                  else toast.error(`Still failing (${after?.status ?? 500})`);
                  setViewing(after ?? null);
                }}
              >
                Retry now
              </Button>
            )}
          </>
        }
      >
        {viewing && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-caption font-semibold text-fg-subtle">Headers</p>
              <pre className="mt-1 overflow-x-auto rounded-md border border-line bg-sunken p-3 font-mono text-caption text-fg">{`Content-Type: application/json\nKubicu-Event: ${viewing.event}\nKubicu-Delivery: ${viewing.id}\nKubicu-Signature: ${fakeSignature(viewingEp?.secret ?? '', viewing.payload, t)}`}</pre>
            </div>
            <div>
              <p className="text-caption font-semibold text-fg-subtle">Body</p>
              <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-line bg-sunken p-3 font-mono text-caption text-fg">{viewing.payload}</pre>
            </div>
            <p className="text-caption text-fg-subtle">Check the signature with your signing secret before trusting a message, and ignore any older than 5 minutes. The same delivery id may arrive twice — handle it once.</p>
          </div>
        )}
      </Dialog>
    </Card>
  );
}
