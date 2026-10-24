import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcwIcon, Undo2Icon } from 'lucide-react';
import type { ExtensionInfo } from '../../types/marketplace';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { readMarketplace } from '../../utils/marketplace';
import { extensions } from '../../data/extensions';
import { notifEvents } from '../../data/notificationEvents';
import { formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

const channels = [
{ name: 'In-app notifications', state: 'Live', tone: 'success' as const, note: 'Delivered to the bell and inbox' },
{ name: 'Email', state: 'Preview', tone: 'info' as const, note: 'Written and shown, not sent — no email provider yet' },
{ name: 'WhatsApp', state: 'Preview', tone: 'info' as const, note: 'Needs a WhatsApp Business partner' },
{ name: 'SMS (two-step codes)', state: 'Preview', tone: 'info' as const, note: 'Codes are simulated' }];


const areaLabel = (p: string | null) => p ? p.split('.')[0].replace(/^\w/, (c) => c.toUpperCase()) : 'Everyone it’s for';
const on = (v: boolean) => v ? <span className="text-success">On</span> : <span className="text-fg-subtle">Off</span>;

type Pending = {kind: 'pull' | 'restore';ext: ExtensionInfo;} | null;

/** Super admin → Integrations & notifications (D130): channels, the event catalogue, and extension versions in use. */
export function AdminIntegrations() {
  const { workspaces } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const [pending, setPending] = useState<Pending>(null);

  const usage = useMemo(() => {
    const out: Record<string, {installs: number;versions: Record<string, number>;}> = {};
    for (const w of workspaces) {
      for (const rec of Object.values(readMarketplace(w.id).installed)) {
        const u = out[rec.id] ??= { installs: 0, versions: {} };
        u.installs += 1;
        u.versions[rec.version] = (u.versions[rec.version] ?? 0) + 1;
      }
    }
    return out;
  }, [workspaces, store.extensionPulls]);

  const confirm = (reason: string) => {
    if (!pending) return;
    const { ext } = pending;
    if (pending.kind === 'pull') {
      const to = ext.versions[1]?.version;
      if (!to) return setPending(null);
      setStore((s) => audit({ ...s, extensionPulls: { ...s.extensionPulls, [ext.id]: { pulledVersion: ext.version, to, reason, at: new Date().toISOString(), by: staffActor(s) } } }, { area: 'extensions', action: `Withdrew ${ext.name} ${ext.version} → everyone moves to ${to}`, target: ext.name, reason }));
      toast.success(`${ext.name} ${ext.version} withdrawn`, { description: `Workspaces move to ${to} the next time they open the app, with a note explaining why.` });
    } else {
      setStore((s) => {
        const { [ext.id]: _gone, ...rest } = s.extensionPulls;
        return audit({ ...s, extensionPulls: rest }, { area: 'extensions', action: `Put ${ext.name} ${ext.version} back`, target: ext.name, reason });
      });
      toast.success(`${ext.name} ${ext.version} is available again`, { description: 'New installs get it. Workspaces already moved stay where they are until the owner updates.' });
    }
    setPending(null);
  };

  const th = 'px-3 py-2.5 text-center text-caption font-semibold text-fg-subtle';

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Integrations & notifications" description="Which message channels are live, every event that can notify a seller, and the extension versions running in workspaces — with a way to withdraw a bad release." />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card id="channels" title="Channels" body="flush">
          <ul className="divide-y divide-line">
            {channels.map((c) =>
            <li key={c.name} className="flex items-start justify-between gap-4 px-5 py-3 md:px-6">
                <span className="min-w-0">
                  <span className="block text-label font-semibold text-fg">{c.name}</span>
                  <span className="block text-caption text-fg-subtle">{c.note}</span>
                </span>
                <Badge tone={c.tone} dot>
                  {c.state}
                </Badge>
              </li>
            )}
          </ul>
        </Card>

        <Card id="extensions" title="Extensions in use" description="Installs on this device. Withdrawing moves every workspace on that version back one release." body="flush">
          <ul className="divide-y divide-line">
            {extensions.map((ext) => {
              const u = usage[ext.id];
              const pull = store.extensionPulls[ext.id];
              const canPull = ext.versions.length > 1;
              return (
                <li key={ext.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                      {ext.name}
                      <span className="font-normal text-fg-subtle">latest {ext.version}</span>
                      {pull && <Badge tone="warning">{pull.pulledVersion} withdrawn</Badge>}
                    </span>
                    <span className="block text-caption text-fg-subtle">
                      {u ? `${u.installs} install${u.installs === 1 ? '' : 's'} · ${Object.entries(u.versions).map(([v, n]) => `${v} × ${n}`).join(', ')}` : 'Not installed here'}
                      {pull && ` · by ${pull.by.split(' ·')[0]} ${formatRelative(pull.at)}`}
                    </span>
                  </span>
                  {pull ?
                  <Button size="sm" variant="tertiary" leadingIcon={Undo2Icon} onClick={() => setPending({ kind: 'restore', ext })}>
                      Put {pull.pulledVersion} back…
                    </Button> :
                  canPull ?
                  <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} onClick={() => setPending({ kind: 'pull', ext })}>
                      Withdraw {ext.version}…
                    </Button> :

                  <span className="text-caption text-fg-subtle">Only one version</span>
                  }
                </li>);

            })}
          </ul>
        </Card>
      </div>

      <Card id="events" title="Notification events" description="Default channels for each event. Sellers change their own in Settings → Notifications; each person only gets events their role can act on." body="flush" className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <caption className="sr-only">Notification events and default channels</caption>
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className={`${th} pl-5 text-left md:pl-6`}>Event</th>
                <th scope="col" className={`${th} text-left`}>Goes to</th>
                <th scope="col" className={th}>In app</th>
                <th scope="col" className={th}>Email</th>
                <th scope="col" className={`${th} pr-5 md:pr-6`}>WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {notifEvents.map((e) =>
              <tr key={e.id}>
                  <th scope="row" className="px-3 py-2.5 pl-5 text-left text-label font-normal text-fg md:pl-6">
                    {e.label}
                  </th>
                  <td className="px-3 py-2.5 text-caption text-fg-muted">{areaLabel(e.permission)}</td>
                  <td className="px-3 py-2.5 text-center text-caption">{on(e.defaults.app)}</td>
                  <td className="px-3 py-2.5 text-center text-caption">{on(e.defaults.email)}</td>
                  <td className="px-3 py-2.5 pr-5 text-center text-caption md:pr-6">{on(e.defaults.whatsapp)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ReasonDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        destructive={pending?.kind === 'pull'}
        title={pending?.kind === 'pull' ? `Withdraw ${pending.ext.name} ${pending.ext.version}?` : `Put ${pending?.ext.name} ${pending?.ext.version} back?`}
        description={
        pending?.kind === 'pull' ?
        `Every workspace running ${pending.ext.version} moves to ${pending.ext.versions[1]?.version}, and owners see your reason. New installs get ${pending.ext.versions[1]?.version}. Settings are kept.` :
        'New installs get this version again. Use this once the problem is fixed.'
        }
        confirmLabel={pending?.kind === 'pull' ? 'Withdraw version' : 'Put back'} />
      
    </div>);

}