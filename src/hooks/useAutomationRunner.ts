import { useEffect } from 'react';
import type { Automation, OpsData } from '../types/ops';
import { useOps } from '../contexts/OpsContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTeam } from '../contexts/TeamContext';
import { runLive, type LiveEvent } from '../utils/ops/liveRuns';
import { eventsFor } from '../utils/ops/liveEvents';

/** Never more than this many live runs in one pass, so switching on an automation can't flood anyone. */
const PER_PASS = 5;
const CHECK_MS = 60000;

/**
 * Fires active automations on real changes while KUBICU is open (D137, D141): orders, bookings, forms,
 * stock, subscriptions, due dates, unfinished checkouts, campaigns and quiet contacts.
 * Each automation only reacts to things that happen after it was switched on.
 * In production this runs on the server; the prototype checks every minute and shortly after each change.
 */
export function useAutomationRunner() {
  const { data, applySystem } = useOps();
  const commerce = useCommerce().data;
  const { current } = useWorkspace();
  const team = useTeam();

  useEffect(() => {
    const pass = () => {
      if (data.automationsPaused) return;
      const active = data.automations.filter((a) => a.status === 'active');
      if (active.length === 0) return;
      const fired = new Set(data.firedKeys ?? []);
      const now = Date.now();
      const due: { a: Automation; ev: LiveEvent }[] = [];
      for (const a of active) for (const ev of eventsFor(a, fired, { ops: data, commerce, workspace: current, now })) due.push({ a, ev });
      if (due.length === 0) return;
      const memberName = (id: string | null | undefined) => team.data.members.find((m) => m.id === id)?.name ?? 'a team member';
      applySystem((d) => due.slice(0, PER_PASS).reduce<OpsData>((acc, { a, ev }) => ((acc.firedKeys ?? []).includes(ev.key) ? acc : runLive(acc, a, ev, { commerce, memberName })), d));
    };
    // A short delay lets the change that triggered this render settle first.
    const soon = window.setTimeout(pass, 1500);
    const id = window.setInterval(pass, CHECK_MS);
    return () => {
      window.clearTimeout(soon);
      window.clearInterval(id);
    };
  }, [data, commerce, current, applySystem, team.data.members]);
}
