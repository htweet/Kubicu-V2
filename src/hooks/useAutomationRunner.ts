import { useEffect } from 'react';
import type { Automation, OpsData } from '../types/ops';
import { useOps } from '../contexts/OpsContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTeam } from '../contexts/TeamContext';
import { readSpacePage } from '../utils/spaces';
import { campaignPhase } from '../utils/campaign';
import { lastActivity, runLive, type LiveEvent } from '../utils/ops/liveRuns';
import { publicUrl } from '../utils/format';

const DAY = 86400000;
/** Never more than this many live runs in one pass, so switching on an automation can't flood anyone. */
const PER_PASS = 5;
const CHECK_MS = 60000;

/**
 * Fires active automations on real changes while KUBICU is open (D137): campaigns going live or ending,
 * and contacts going quiet. In production this runs on the server; the prototype checks every minute.
 */
export function useAutomationRunner() {
  const { data, applySystem } = useOps();
  const commerce = useCommerce().data;
  const { current } = useWorkspace();
  const team = useTeam();

  useEffect(() => {
    const pass = () => {
      if (data.automationsPaused) return;
      const active = data.automations.filter((a) => a.status === 'active' && (a.trigger === 'campaign_started' || a.trigger === 'campaign_ended' || a.trigger === 'contact_quiet'));
      if (active.length === 0) return;
      const fired = new Set(data.firedKeys ?? []);
      const due: {a: Automation;ev: LiveEvent;}[] = [];

      for (const a of active) {
        if (a.trigger === 'contact_quiet') {
          const days = Math.max(7, a.triggerDays ?? 30);
          for (const c of data.contacts) {
            const last = lastActivity(c);
            const quiet = Math.floor((Date.now() - last) / DAY);
            const key = `${a.id}:quiet:${c.id}:${last}`;
            if (quiet < days || fired.has(key)) continue;
            const lastItem = c.activity.find((x) => x.kind === 'order')?.label.replace(/^.*?:\s*/, '') ?? '';
            due.push({ a, ev: { key, subject: `${c.name} has been quiet for ${quiet} days`, vars: { first_name: c.name.split(' ')[0], days: String(quiet), last_item: lastItem }, total: 0, source: c.sources[0] ?? 'manual', subscribed: c.consent === 'subscribed', contactId: c.id } });
          }
        } else {
          for (const s of current.spaces ?? []) {
            if (s.archivedAt) continue;
            const page = readSpacePage(current.id, s.id);
            const pub = page?.published;
            if (!pub?.campaign) continue;
            const phase = campaignPhase(pub.campaign);
            const wanted = a.trigger === 'campaign_started' ? 'live' : 'ended';
            const key = `${a.id}:${wanted}:${s.id}:${pub.campaign.startsAt ?? ''}:${pub.campaign.endsAt ?? ''}`;
            if (phase !== wanted || fired.has(key)) continue;
            const orders = commerce.orders.filter((o) => o.sourceHandle === pub.handle && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
            due.push({ a, ev: { key, subject: wanted === 'live' ? `“${s.name}” went live` : `“${s.name}” ended — ${orders.length} order${orders.length === 1 ? '' : 's'}`, vars: { campaign: s.name, link: publicUrl(pub.handle), orders: String(orders.length) }, total: 0, source: 'order', subscribed: true } });
          }
        }
      }
      if (due.length === 0) return;
      const memberName = (id: string | null | undefined) => team.data.members.find((m) => m.id === id)?.name ?? 'a team member';
      applySystem((d) => due.slice(0, PER_PASS).reduce<OpsData>((acc, { a, ev }) => (acc.firedKeys ?? []).includes(ev.key) ? acc : runLive(acc, a, ev, { commerce, memberName }), d));
    };
    pass();
    const id = window.setInterval(pass, CHECK_MS);
    return () => window.clearInterval(id);
  }, [data, commerce, current, applySystem, team.data.members]);
}