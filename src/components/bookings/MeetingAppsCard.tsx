import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2Icon, ShieldCheckIcon, VideoIcon } from 'lucide-react';
import type { MeetingApp } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { useTeam } from '../../contexts/TeamContext';
import { connectMeetingApp, connectionFor, disconnectMeetingApp, meetingAppIds, meetingApps } from '../../utils/ops/meetings';
import { formatRelative } from '../../utils/format';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { IllustrativeTag } from '../ui/IllustrativeTag';

/**
 * Bookings → Availability: connect Google Meet, Zoom or Microsoft Teams so every online booking
 * gets its own meeting link automatically (D225). Sign-in and links are simulated in the prototype.
 */
export function MeetingAppsCard() {
  const { data, apply } = useOps();
  const me = useTeam().me;
  const av = data.availability;
  const [open, setOpen] = useState<MeetingApp | null>(null);
  const [account, setAccount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<MeetingApp | null>(null);
  const usedBy = (app: MeetingApp) => data.services.filter((s) => s.location === 'online' && s.meetingApp === app).length;

  const start = (app: MeetingApp) => {
    setOpen(app);
    setAccount(me.contact.includes('@') ? me.contact : '');
    setError(undefined);
    setBusy(false);
  };

  const connect = () => {
    if (!open) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.trim())) return setError('Enter the email address you sign in with.');
    setBusy(true);
    window.setTimeout(() => {
      const app = open;
      if (apply((d) => ({ ...d, availability: connectMeetingApp(d.availability, app, account) }))) toast.success(`${meetingApps[app].name} connected`, { description: 'Choose it on your online services so each booking gets a link.' });
      setOpen(null);
      setBusy(false);
    }, 1100);
  };

  return (
    <>
      <Card
        id="meeting-apps"
        title="Video calls"
        icon={VideoIcon}
        description="Connect the app you already use. Each online booking then gets its own meeting link, sent with the confirmation and the reminder."
        actions={<IllustrativeTag note="Preview: no Google, Zoom or Microsoft connection is made in the prototype. Links look real but don’t open a meeting." />}>
        
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {meetingAppIds.map((app) => {
            const c = connectionFor(av, app);
            const n = usedBy(app);
            return (
              <li key={app} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                    {meetingApps[app].name}
                    {c &&
                    <Badge tone="success" dot>
                        Connected
                      </Badge>
                    }
                  </p>
                  <p className="text-caption text-fg-subtle">
                    {c ? `${c.account} · connected ${formatRelative(c.connectedAt)}${n ? ` · used by ${n} service${n === 1 ? '' : 's'}` : ' · not used by a service yet'}` : `Not connected`}
                  </p>
                </div>
                {c ?
                <Button size="sm" variant="tertiary" onClick={() => setRemoving(app)}>
                    Disconnect
                  </Button> :

                <Button size="sm" variant="secondary" onClick={() => start(app)}>
                    Connect
                  </Button>
                }
              </li>);

          })}
        </ul>
        <p className="mt-3 text-caption text-fg-subtle">Then open Services, pick an online service and choose which app makes its links. Services without one keep the note you wrote.</p>
      </Card>

      <Dialog
        open={!!open}
        onClose={() => !busy && setOpen(null)}
        size="sm"
        title={open ? `Connect ${meetingApps[open].name}` : ''}
        description="You’ll sign in with that app and allow KUBICU to create meetings for your bookings."
        footer={
        <>
            <Button variant="secondary" onClick={() => setOpen(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={connect} disabled={busy} leadingIcon={busy ? Loader2Icon : undefined}>
              {busy ? 'Connecting…' : 'Sign in and allow'}
            </Button>
          </>
        }>
        
        {open &&
        <div className="flex flex-col gap-4">
            <TextInput id="mtg-account" label="Account email" type="email" inputMode="email" value={account} hint={meetingApps[open].accountHint} error={error} onChange={(e) => (setAccount(e.target.value), setError(undefined))} />
            <ul className="flex flex-col gap-2 text-label text-fg">
              {['Create a meeting when someone books an online service', 'Change or cancel that meeting when the booking moves or is cancelled'].map((p) =>
            <li key={p} className="flex items-start gap-2">
                  <ShieldCheckIcon size={15} className="mt-0.5 shrink-0 text-action" aria-hidden /> {p}
                </li>
            )}
            </ul>
            <p className="text-caption text-fg-muted">KUBICU can’t read your other meetings, chats or recordings.</p>
          </div>
        }
      </Dialog>

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing ? `Disconnect ${meetingApps[removing].name}?` : ''}
        description="New online bookings won’t get links from it. Bookings that already have a link keep it."
        footer={
        <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (!removing) return;
              const app = removing;
              apply((d) => ({ ...d, availability: disconnectMeetingApp(d.availability, app) }));
              setRemoving(null);
              toast(`${meetingApps[app].name} disconnected`);
            }}>
            
              Disconnect
            </Button>
          </>
        } />
      
    </>);

}