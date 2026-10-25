import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarCheckIcon, CalendarIcon, PlugZapIcon, RefreshCwIcon, ShieldCheckIcon } from 'lucide-react';
import type { CalendarConnection } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { useTeam } from '../../contexts/TeamContext';
import { newConnection, providerName, syncConnection } from '../../utils/ops/calendarSync';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { TextInput } from '../ui/TextInput';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { useT } from '../../contexts/LocaleContext';

type Provider = CalendarConnection['provider'];

/** Bookings → Availability: two-way Google / Outlook sync, simulated (D137). */
export function CalendarSyncCard() {
  const { data, apply } = useOps();
  const { t: tr } = useT();
  const me = useTeam().me;
  const conns = data.availability.calendars ?? [];
  const [open, setOpen] = useState<Provider | null>(null);
  const [step, setStep] = useState<'account' | 'consent' | 'connecting'>('account');
  const [account, setAccount] = useState('');
  const [error, setError] = useState<string | undefined>();

  const setConns = (fn: (c: CalendarConnection[]) => CalendarConnection[]) => apply((d) => ({ ...d, availability: { ...d.availability, calendars: fn(d.availability.calendars ?? []) } }));
  const update = (id: string, fn: (c: CalendarConnection) => CalendarConnection) => setConns((cs) => cs.map((c) => c.id === id ? fn(c) : c));

  // Bookings made, moved or cancelled in KUBICU flow into connected calendars.
  useEffect(() => {
    if (!conns.some((c) => c.status === 'ok')) return;
    const next = conns.map((c) => syncConnection(c, data.bookings));
    if (next.some((c, i) => c.events.length !== conns[i].events.length || c.log[0] !== conns[i].log[0])) apply((d) => ({ ...d, availability: { ...d.availability, calendars: next } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.bookings]);

  const start = (p: Provider) => {
    setOpen(p);
    setStep('account');
    setAccount(me.contact.includes('@') ? me.contact : '');
    setError(undefined);
  };

  const connect = () => {
    if (!open) return;
    setStep('connecting');
    window.setTimeout(() => {
      const c = syncConnection(newConnection(open, account.trim(), me.name, data.availability.timeZone), data.bookings);
      if (setConns((cs) => [...cs, c])) toast.success(tr('{provider} connected', { provider: providerName[open] }), { description: tr('Your busy times now block bookings, and KUBICU bookings appear in your calendar.') });
      setOpen(null);
    }, 1200);
  };

  const next = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.trim())) return setError(tr('Enter the email address you use for this calendar.'));
    if (conns.some((c) => c.account.toLowerCase() === account.trim().toLowerCase() && c.provider === open)) return setError(tr('This calendar is already connected.'));
    setStep('consent');
  };

  return (
    <>
      <Card id="calendar-sync" title="Calendar sync" icon={CalendarCheckIcon} description="Busy times in your own calendar block bookings, and every KUBICU booking appears there — new, moved and cancelled." actions={<IllustrativeTag note="Preview: no Google or Microsoft connection is made in the prototype. Busy times are sample events." />}>
        <div className="flex flex-col gap-5">
          {conns.length === 0 && <p className="text-label text-fg-muted">{tr('Not connected. Bookings only live in KUBICU, so you could be double-booked if you also use another calendar.')}</p>}

          {conns.map((c) =>
          <section key={c.id} aria-label={`${providerName[c.provider]} — ${c.account}`} className="flex flex-col gap-4 rounded-md border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                    {providerName[c.provider]}
                    <Badge tone={c.status === 'ok' ? 'success' : 'danger'} dot>
                      {tr(c.status === 'ok' ? 'Connected' : 'Access removed')}
                    </Badge>
                  </p>
                  <p className="truncate text-caption text-fg-subtle">
                    {c.account} · {c.memberName} · {tr('synced {when}', { when: formatRelative(c.lastSyncedAt) })}
                  </p>
                </div>
                {c.status === 'ok' &&
              <Button size="sm" variant="secondary" leadingIcon={RefreshCwIcon} onClick={() => update(c.id, (x) => ({ ...syncConnection(x, data.bookings), lastSyncedAt: new Date().toISOString() })) && toast(tr('Synced'), { description: tr('Busy times and bookings are up to date.') })}>
                    Sync now
                  </Button>
              }
              </div>

              {c.status === 'revoked' ?
            <InlineAlert
              tone="danger"
              title="KUBICU can’t read this calendar any more"
              action={
              <Button size="sm" onClick={() => update(c.id, (x) => syncConnection({ ...x, status: 'ok', log: [{ at: new Date().toISOString(), text: 'Reconnected' }, ...x.log] }, data.bookings))}>
                      Reconnect
                    </Button>
              }>
              
                  {tr('Access was withdrawn from your {provider} account. Its busy times no longer block bookings, so check your schedule for clashes.', { provider: providerName[c.provider] })}
                </InlineAlert> :

            <>
                  <fieldset>
                    <legend className="text-caption font-semibold text-fg-subtle">{tr('Which calendars block bookings')}</legend>
                    <ul className="mt-2 flex flex-col gap-3">
                      {c.calendars.map((cal) =>
                  <li key={cal.id}>
                          <Switch id={`cal-${cal.id}`} label={cal.name} description={tr('{n} busy times coming up', { n: c.events.filter((e) => e.calendarId === cal.id && !e.bookingId && Date.parse(e.end) > Date.now()).length })} checked={cal.blocks} onChange={(blocks) => update(c.id, (x) => ({ ...x, calendars: x.calendars.map((y) => y.id === cal.id ? { ...y, blocks } : y) }))} />
                        </li>
                  )}
                    </ul>
                  </fieldset>
                  <div className="max-w-xs">
                    <SelectInput id={`add-${c.id}`} label="Add KUBICU bookings to" value={c.addTo} options={c.calendars.map((cal) => ({ value: cal.id, label: cal.name }))} onChange={(addTo) => update(c.id, (x) => syncConnection({ ...x, addTo, events: x.events.filter((e) => !e.bookingId) }, data.bookings))} />
                  </div>
                </>
            }

              {c.log.length > 0 &&
            <details className="text-caption text-fg-muted">
                  <summary className="cursor-pointer font-medium text-fg">{tr('Sync history')}</summary>
                  <ul className="mt-2 flex flex-col gap-1">
                    {c.log.slice(0, 6).map((l, i) =>
                <li key={i}>
                        {formatTimestamp(l.at)} — {tr(l.text)}
                      </li>
                )}
                  </ul>
                </details>
            }

              <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                {c.status === 'ok' &&
              <Button size="sm" variant="tertiary" onClick={() => update(c.id, (x) => ({ ...x, status: 'revoked', log: [{ at: new Date().toISOString(), text: 'Access withdrawn in the provider’s settings' }, ...x.log] }))}>
                    Prototype: simulate access withdrawn
                  </Button>
              }
                <Button size="sm" variant="tertiary" className="sm:ml-auto" onClick={() => setConns((cs) => cs.filter((x) => x.id !== c.id)) && toast(tr('Disconnected'), { description: tr('KUBICU bookings were removed from that calendar. Bookings in KUBICU are unchanged.') })}>
                  Disconnect
                </Button>
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" leadingIcon={CalendarIcon} onClick={() => start('google')}>
              Connect Google Calendar
            </Button>
            <Button variant="secondary" leadingIcon={CalendarIcon} onClick={() => start('outlook')}>
              Connect Outlook
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={!!open}
        onClose={() => step !== 'connecting' && setOpen(null)}
        size="sm"
        title={open ? tr('Connect {provider}', { provider: providerName[open] }) : ''}
        description={step === 'consent' ? tr('{provider} is asking you to allow KUBICU to:', { provider: providerName[open ?? 'google'] }) : step === 'account' ? tr('Sign in with the account your calendar is on.') : undefined}
        footer={
        step === 'connecting' ? undefined :
        <>
              <Button variant="secondary" onClick={() => step === 'consent' ? setStep('account') : setOpen(null)}>
                {step === 'consent' ? 'Back' : 'Cancel'}
              </Button>
              <Button leadingIcon={step === 'consent' ? PlugZapIcon : undefined} onClick={step === 'account' ? next : connect}>
                {step === 'account' ? 'Continue' : 'Allow'}
              </Button>
            </>

        }>
        
        {step === 'account' && <TextInput id="cal-account" label="Email" type="email" autoComplete="email" value={account} error={error} onChange={(e) => (setAccount(e.target.value), setError(undefined))} />}
        {step === 'consent' &&
        <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2.5 text-label text-fg">
              <li className="flex gap-2">
                <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden /> {tr('See when you’re busy on your calendars')}
              </li>
              <li className="flex gap-2">
                <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden /> {tr('Add, change and remove the events KUBICU creates for bookings')}
              </li>
            </ul>
            <p className="text-caption text-fg-subtle">{tr('KUBICU never shows your event titles to customers — they only see a time as unavailable. You can remove access any time from your {provider} settings.', { provider: providerName[open ?? 'google'] })}</p>
          </div>
        }
        {step === 'connecting' && <p className="py-4 text-center text-label text-fg-muted" role="status">{tr('Connecting and reading your busy times…')}</p>}
      </Dialog>
    </>);

}