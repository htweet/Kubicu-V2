import React, { useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTeam } from '../../contexts/TeamContext';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { Card } from '../ui/layout/Card';
import { Section } from '../ui/layout/Section';

/** Settings → Privacy: what's recorded about visitors, and the switches (D61). */
export function PrivacyTab() {
  const { data, updateSettings, clearAll, clearSample, loadSample } = useAnalytics();
  const team = useTeam();
  const manage = team.can('team.manage');
  const [confirm, setConfirm] = useState(false);
  const s = data.settings;
  const sampleCount = data.events.filter((e) => e.sample).length;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-6">
        <Card
          id="priv-tracking"
          title="Visitor analytics"
          description="What your pages record, and how long it’s kept."
          footer={
          <div className="flex flex-wrap gap-2">
              {sampleCount > 0 ?
            <Button size="sm" variant="secondary" disabled={!manage.allowed} onClick={clearSample}>
                  Clear {sampleCount.toLocaleString()} sample events
                </Button> :

            <Button size="sm" variant="secondary" disabled={!manage.allowed} onClick={loadSample}>
                  Add sample visits
                </Button>
            }
              <Button size="sm" variant="destructive" disabled={!manage.allowed || data.events.length === 0} onClick={() => setConfirm(true)}>
                Delete all visit data
              </Button>
            </div>
          }>
          
          <div className="flex flex-col gap-5">
          <Switch id="priv-enabled" label="Record visits to my pages" description={manage.allowed ? 'Views, taps, where visitors came from, and steps towards an order, booking or form.' : manage.reason} checked={s.enabled} disabled={!manage.allowed} onChange={(enabled) => updateSettings({ enabled })} />
          <Switch
              id="priv-own"
              label="Don’t count my own visits"
              description="In this prototype you’re both the owner and the visitor on this device, so it’s off — turn it on to stop your own testing showing up."
              checked={s.excludeOwn}
              disabled={!manage.allowed || !s.enabled}
              onChange={(excludeOwn) => updateSettings({ excludeOwn })} />
            
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="text-label font-medium text-fg">Kept for {s.retentionDays} days</p>
              <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
                Set by KUBICU for every workspace — older visits are deleted automatically. <IllustrativeTag note="Example retention period — confirm with legal before launch." />
              </p>
            </div>
          </div>
          </div>
        </Card>
      </div>

      <Section id="priv-notice" title={<span className="flex items-center gap-2"><ShieldCheckIcon size={16} className="text-success" aria-hidden /> What visitors are told</span>}>
        <blockquote className="rounded-md border border-line bg-sunken p-4 text-label text-fg-muted">
          This page counts visits to help the owner improve it: which links are tapped, and whether you came from WhatsApp, Instagram, a QR code and so on. No name, email or phone number is recorded, and nothing follows you to other sites. A visit is forgotten after 30 minutes.
        </blockquote>
        <ul className="flex flex-col gap-1.5 text-caption text-fg-muted">
          <li>No cookies across sites, no fingerprinting, no personal data.</li>
          <li>Owners see totals and patterns, never a person.</li>
          <li>Orders, bookings and forms are kept in their own screens — that’s what customers chose to share.</li>
        </ul>
        <p className="text-caption text-fg-subtle">This notice is written by KUBICU and is the same on every workspace’s pages. Wording is a draft pending legal review.</p>
      </Section>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title="Delete all visit data?"
        description="Every recorded visit, tap and step is removed for this workspace. Orders, bookings and contacts aren’t affected."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              clearAll();
              team.log('settings', 'deleted all visit data');
              setConfirm(false);
            }}>
            
              Delete
            </Button>
          </>
        } />
      
    </div>);

}