import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLinkIcon, MegaphoneIcon } from 'lucide-react';
import type { Incident, IncidentImpact, IncidentStatus } from '../../types/admin';
import { audit, staffActor, staffReplyName, useAdminStore } from '../../utils/admin/store';
import { activeIncidents, impactLabels, incidentStatusLabels } from '../../utils/admin/incidents';
import { platformServiceNames } from '../../data/platformServices';
import { formatRelative } from '../../utils/format';
import { uid } from '../../utils/id';
import { Card } from '../ui/layout/Card';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';

const impactTone: Record<IncidentImpact, BadgeTone> = { minor: 'warning', major: 'danger', outage: 'danger' };
const impactOptions = (Object.keys(impactLabels) as IncidentImpact[]).map((v) => ({ value: v, label: impactLabels[v] }));
const statusOptions = (Object.keys(incidentStatusLabels) as IncidentStatus[]).map((v) => ({ value: v, label: incidentStatusLabels[v] }));

type Mode = { kind: 'declare' } | { kind: 'update'; incident: Incident } | null;

/** Security & health → Incidents: declare, update and resolve. Every update is public on /status (D129). */
export function IncidentsCard() {
  const [store, setStore] = useAdminStore();
  const [mode, setMode] = useState<Mode>(null);
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState<IncidentImpact>('minor');
  const [services, setServices] = useState<string[]>([]);
  const [status, setStatus] = useState<IncidentStatus>('investigating');
  const [message, setMessage] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!mode) return;
    setTried(false);
    setMessage('');
    if (mode.kind === 'declare') {
      setTitle('');
      setImpact('minor');
      setServices([]);
      setStatus('investigating');
    } else {
      setStatus(mode.incident.status === 'investigating' ? 'identified' : mode.incident.status === 'identified' ? 'monitoring' : 'resolved');
      setImpact(mode.incident.impact);
    }
  }, [mode]);

  const active = activeIncidents(store.incidents);
  const past = store.incidents.filter((i) => i.status === 'resolved').slice(0, 5);

  const errors = {
    title: mode?.kind === 'declare' && title.trim().length < 5 ? 'Give it a short, plain title customers will understand.' : '',
    services: mode?.kind === 'declare' && services.length === 0 ? 'Pick at least one affected service.' : '',
    message: message.trim().length < 20 ? 'Write a sentence or two — this is shown publicly.' : '',
  };

  const save = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    const now = new Date().toISOString();
    const by = staffReplyName(store);
    if (mode?.kind === 'declare') {
      const inc: Incident = { id: uid('inc'), title: title.trim(), impact, services, status, startedAt: now, resolvedAt: status === 'resolved' ? now : null, updates: [{ id: uid('incu'), at: now, status, message: message.trim(), by }] };
      setStore((s) => audit({ ...s, incidents: [inc, ...s.incidents] }, { area: 'incidents', action: `Declared incident (${impactLabels[impact]})`, target: inc.title, reason: message.trim() }));
      toast.success('Incident declared', { description: 'It’s on the public status page now.' });
    } else if (mode?.kind === 'update') {
      const id = mode.incident.id;
      setStore((s) =>
        audit(
          { ...s, incidents: s.incidents.map((i) => (i.id === id ? { ...i, status, impact, resolvedAt: status === 'resolved' ? now : null, updates: [...i.updates, { id: uid('incu'), at: now, status, message: message.trim(), by }] } : i)) },
          { area: 'incidents', action: `Incident update: ${incidentStatusLabels[status]}`, target: mode.incident.title, reason: message.trim() },
        ),
      );
      toast.success(status === 'resolved' ? 'Incident resolved' : 'Update posted');
    }
    setMode(null);
  };

  return (
    <Card
      id="incidents"
      title="Incidents"
      description="What customers see on the public status page. Every update is shown word for word."
      body="flush"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/status" target="_blank" className="inline-flex items-center gap-1 text-label font-medium text-action hover:underline">
            Status page <ExternalLinkIcon size={13} aria-hidden />
          </Link>
          <Button size="sm" leadingIcon={MegaphoneIcon} onClick={() => setMode({ kind: 'declare' })}>
            Declare incident
          </Button>
        </div>
      }
    >
      {active.length === 0 ? (
        <p className="px-5 py-5 text-label text-fg-muted md:px-6">No open incidents. The status page says everything is working normally.</p>
      ) : (
        <ul className="divide-y divide-line">
          {active.map((i) => {
            const lastUpdate = i.updates[i.updates.length - 1];
            return (
              <li key={i.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:gap-6 md:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-label font-semibold text-fg">{i.title}</p>
                    <Badge tone={impactTone[i.impact]} dot>
                      {impactLabels[i.impact]}
                    </Badge>
                    <Badge tone="info">{incidentStatusLabels[i.status]}</Badge>
                  </div>
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {i.services.join(', ')} · started {formatRelative(i.startedAt)} · last update {formatRelative(lastUpdate.at)}
                  </p>
                  <p className="mt-2 text-label text-fg-muted">{lastUpdate.message}</p>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setMode({ kind: 'update', incident: i })}>
                  Post update
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {past.length > 0 && (
        <div className="border-t border-line px-5 py-4 md:px-6">
          <p className="text-caption font-semibold text-fg-subtle">Recently resolved</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {past.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-x-4 text-label">
                <span className="text-fg">
                  {i.title}
                  {i.sample && <span className="text-fg-subtle"> · sample</span>}
                </span>
                <span className="text-caption text-fg-subtle">{i.resolvedAt ? `Resolved ${formatRelative(i.resolvedAt)}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog
        open={!!mode}
        onClose={() => setMode(null)}
        title={mode?.kind === 'update' ? `Update: ${mode.incident.title}` : 'Declare an incident'}
        description="Customers read this on the status page. Say what’s affected and what they should do — no internal detail, no blame."
        footer={
          <>
            <Button variant="secondary" onClick={() => setMode(null)}>
              Cancel
            </Button>
            <Button onClick={save}>{mode?.kind === 'declare' ? 'Declare and publish' : status === 'resolved' ? 'Resolve and publish' : 'Post update'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {mode?.kind === 'declare' && (
            <>
              <TextInput id="inc-title" label="Title" placeholder="e.g. Some payouts are delayed" value={title} error={tried ? errors.title || undefined : undefined} onChange={(e) => setTitle(e.target.value)} />
              <fieldset>
                <legend className="text-label font-medium text-fg">Affected services</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {platformServiceNames.map((n) => (
                    <label key={n} className="flex cursor-pointer items-center gap-2.5 text-label text-fg">
                      <input type="checkbox" className="size-4 accent-[rgb(var(--action))]" checked={services.includes(n)} onChange={() => setServices((l) => (l.includes(n) ? l.filter((x) => x !== n) : [...l, n]))} />
                      {n}
                    </label>
                  ))}
                </div>
                {tried && errors.services && <p className="mt-2 text-caption font-medium text-danger">{errors.services}</p>}
              </fieldset>
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput<IncidentImpact> id="inc-impact" label="Impact" value={impact} options={impactOptions} onChange={setImpact} />
            <SelectInput<IncidentStatus> id="inc-status" label="Status" value={status} options={statusOptions} onChange={setStatus} />
          </div>
          <TextArea
            id="inc-message"
            label="Public message"
            rows={4}
            value={message}
            error={tried ? errors.message || undefined : undefined}
            placeholder="e.g. Payouts started after 2pm are taking longer than usual. Your money is safe and will arrive today. We’ll update by 5pm."
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-caption text-fg-subtle">Posted as {staffActor(store).split(' ·')[0]}. Logged in the audit log.</p>
        </div>
      </Dialog>
    </Card>
  );
}
