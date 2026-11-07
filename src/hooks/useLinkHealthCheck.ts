import { useCallback, useEffect, useRef } from 'react';
import { useDomains } from '../contexts/DomainsContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { healthDue, runHealthChecks } from '../utils/domains/linkRules';

const HOUR = 3_600_000;

/**
 * Scheduled link checks (D271): every short link is checked once a day while the app is open, and on demand.
 * Newly broken links show in Notifications from their stored result. Returns a manual “Check now”.
 */
export function useLinkHealthCheck(options: { schedule?: boolean } = {}) {
  const { data, apply } = useDomains();
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const latest = useRef({ data, current, commerce });
  latest.current = { data, current, commerce };

  const run = useCallback(() => {
    let broken = 0;
    apply((d) => {
      const r = runHealthChecks(d, latest.current.current, latest.current.commerce);
      broken = r.data.links.filter((l) => !l.archivedAt && l.health?.ok === false).length;
      return r.data;
    });
    return broken;
  }, [apply]);

  useEffect(() => {
    if (!options.schedule) return;
    const tick = () => {
      if (latest.current.data.links.length > 0 && healthDue(latest.current.data)) run();
    };
    tick();
    const t = window.setInterval(tick, HOUR);
    return () => window.clearInterval(t);
  }, [options.schedule, run, current.id]);

  return { run, checkedAt: data.linkHealthCheckedAt ?? null };
}
