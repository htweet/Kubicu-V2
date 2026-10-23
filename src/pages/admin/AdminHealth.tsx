import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAdminStore } from '../../utils/admin/store';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { Card } from '../../components/ui/layout/Card';
import { List, ListRow } from '../../components/ui/layout/ListRow';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';

/** Services the real platform depends on. The prototype has no servers, so these are illustrative. */
const services = [
{ name: 'Public pages', note: 'Serving kub.icu and custom domains' },
{ name: 'Checkout & payments', note: 'Test mode — no provider connected' },
{ name: 'Media storage', note: 'Images are kept in this browser' },
{ name: 'Email & WhatsApp', note: 'Not connected — messages are previews' },
{ name: 'AI page setup', note: 'Rule-based preview, no AI provider' }];


function storageUsedKb(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) ?? '';
      total += k.length + (localStorage.getItem(k)?.length ?? 0);
    }
    return Math.round(total * 2 / 1024);
  } catch {
    return 0;
  }
}

/** Super admin → Security & health: queues that need staff, and the platform’s status (D75b). */
export function AdminHealth() {
  const [store] = useAdminStore();
  const { workspaces } = useWorkspace();
  const kb = useMemo(storageUsedKb, [store]);
  const openReports = store.reports.filter((r) => r.status === 'open').length;
  const openTickets = store.tickets.filter((t) => t.status === 'open').length;
  const flagsOff = Object.values(store.flags).filter((f) => !f.on).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Security & health" description="What needs staff attention now, and how the platform is running." />

      <Card emphasis="primary" as="div" className="mt-8">
        <StatGroup columns={4}>
          <Stat primary label="Open reports" value={<span className={openReports ? 'text-danger' : undefined}>{openReports}</span>} hint={<Link to="/admin/moderation" className="font-medium text-action hover:underline">Review</Link>} />
          <Stat label="Requests needing a reply" value={openTickets} hint={<Link to="/admin/support" className="font-medium text-action hover:underline">Open support</Link>} />
          <Stat label="Flags switched off" value={flagsOff} hint={<Link to="/admin/flags" className="font-medium text-action hover:underline">Feature flags</Link>} />
          <Stat label="Suspended workspaces" value={Object.keys(store.suspended).length} hint={`of ${workspaces.length}`} />
        </StatGroup>
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card id="services" title="Services" description="Prototype: no servers run behind this app, so statuses describe how each part is simulated." actions={<IllustrativeTag note="Illustrative statuses — real monitoring comes with the engineering build." />} body="flush">
          <List>
            {services.map((s) =>
            <ListRow key={s.name} title={s.name} meta={s.note} trailing={<Badge tone="success" dot>Operational</Badge>} />
            )}
          </List>
        </Card>
        <Card id="device" title="This device" description="Everything in the prototype is saved in this browser.">
          <StatGroup columns={2}>
            <Stat label="Browser storage used" value={`${kb.toLocaleString()} KB`} hint="Most browsers allow about 5 MB" />
            <Stat label="Staff actions logged" value={store.audit.length} />
          </StatGroup>
        </Card>
      </div>
    </div>);

}