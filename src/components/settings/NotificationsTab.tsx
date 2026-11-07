import React from 'react';
import { Link } from 'react-router-dom';
import { useProviders } from '../../hooks/useProviders';
import type { NotifArea, NotifChannel } from '../../types/notifications';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTeam } from '../../contexts/TeamContext';
import { channelLabels, notifAreas, notifEvents } from '../../data/notificationEvents';
import { channelOn } from '../../utils/notifications';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { Card } from '../ui/layout/Card';
import { Section } from '../ui/layout/Section';
import { useT } from '../../contexts/LocaleContext';

const channels: NotifChannel[] = ['app', 'email', 'whatsapp'];

/** Settings → Notifications: event × channel, digest and quiet hours, per person (D66). */
export function NotificationsTab() {
  const { t: tr } = useT();
  const n = useNotifications();
  const team = useTeam();
  const providers = useProviders();
  const emailProvider = providers.active('email');
  const waProvider = providers.active('whatsapp');
  const mine = notifEvents.filter((e) => !e.permission || team.can(e.permission).allowed);
  const hidden = notifEvents.length - mine.length;
  const grouped = mine.reduce<Partial<Record<NotifArea, typeof mine>>>((acc, e) => ({ ...acc, [e.area]: [...(acc[e.area] ?? []), e] }), {});

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Section
        id="notif-table"
        title="What reaches you, and where"
        description={`${tr('Your own settings, {name}.', { name: team.me.name.split(' ')[0] })}${hidden > 0 ? ` ${tr('Events your role can’t act on are hidden ({n}).', { n: hidden })}` : ''}`}
      >
        <Card as="div" body="flush" className="overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1fr)_repeat(3,84px)] gap-2 border-b border-line bg-sunken px-5 py-2 text-caption font-semibold text-fg-subtle md:grid md:px-6">
            <span>{tr('Event')}</span>
            {channels.map((c) => (
              <span key={c} className="text-center">
                {tr(channelLabels[c])}
              </span>
            ))}
          </div>
          {(Object.keys(grouped) as NotifArea[]).map((area) => (
            <div key={area} className="border-b border-line last:border-0">
              <p className="px-5 pb-1 pt-3 text-caption font-semibold text-fg-subtle md:px-6">{tr(notifAreas[area].label)}</p>
              <ul aria-label={tr(notifAreas[area].label)}>
                {grouped[area]!.map((e) => (
                  <li key={e.id} className="flex min-h-[44px] flex-col gap-2 px-5 py-2.5 md:grid md:px-6 md:grid-cols-[minmax(0,1fr)_repeat(3,84px)] md:items-center md:gap-2">
                    <span className="text-label text-fg">{tr(e.label)}</span>
                    <div className="flex flex-wrap gap-4 md:contents">
                      {channels.map((c) => {
                        const id = `nt-${e.id}-${c}`;
                        return (
                          <label key={c} htmlFor={id} className="flex items-center gap-2 md:justify-center">
                            <input id={id} type="checkbox" className="h-4 w-4 cursor-pointer" checked={channelOn(n.prefs, e.id, c)} onChange={(ev) => n.setChannel(e.id, c, ev.target.checked)} />
                            <span className="text-caption text-fg-muted md:sr-only">
                              {tr('{channel} for {event}', { channel: tr(channelLabels[c]), event: tr(e.label) })}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      </Section>

      <aside className="flex flex-col gap-6">
        <Card id="nt-channels" title="Email and WhatsApp" actions={<Badge tone="warning">Preview — not sent yet</Badge>}>
          <p className="text-caption text-fg-muted">{tr('Only in-app notifications are delivered in this prototype. Email and WhatsApp choices are saved so they work as soon as a messaging provider is connected.')}</p>
          <p className="mt-3 text-caption text-fg-muted">
            {emailProvider || waProvider ? `${tr('Connected: {names} (test, sends simulated).', { names: [emailProvider?.name, waProvider?.name].filter(Boolean).join(' · ') })} ` : `${tr('No messaging provider connected.')} `}
            <Link to="/app/settings/integrations" className="font-medium text-action hover:underline">
              {tr('Integrations')}
            </Link>
          </p>
        </Card>
        <Card id="nt-timing" title="When messages arrive">
          <div className="flex flex-col gap-5">
          <Switch id="nt-digest" label="Daily digest" description="One email at 8:00 with everything from the day before, instead of one per event. Urgent items (payments, disputes) still come straight away." checked={n.prefs.digest} onChange={(digest) => n.updatePrefs({ digest })} />
          <Switch
            id="nt-quiet"
            label="Quiet hours"
            description="No email or WhatsApp in this window. The in-app inbox still collects everything."
            checked={n.prefs.quietHours.on}
            onChange={(on) => n.updatePrefs({ quietHours: { ...n.prefs.quietHours, on } })}
          />
          {n.prefs.quietHours.on && (
            <div className="grid grid-cols-2 gap-3">
              <TextInput id="nt-from" label="From" type="time" value={n.prefs.quietHours.from} onChange={(e) => n.updatePrefs({ quietHours: { ...n.prefs.quietHours, from: e.target.value } })} />
              <TextInput id="nt-to" label="Until" type="time" value={n.prefs.quietHours.to} onChange={(e) => n.updatePrefs({ quietHours: { ...n.prefs.quietHours, to: e.target.value } })} />
            </div>
          )}
          </div>
        </Card>
      </aside>
    </div>
  );
}
