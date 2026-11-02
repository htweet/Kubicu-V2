import { useEffect } from 'react';
import { useOptionalOps } from '../../contexts/OpsContext';
import { autoDeclineDue } from '../../utils/ops/ops';

/**
 * Declines booking requests nobody answered in time (D514), checking every minute while KUBICU is open.
 * In production this runs on the server. Renders nothing.
 */
export function BookingAutoDecliner() {
  const ops = useOptionalOps();
  const data = ops?.data;
  const apply = ops?.applySystem;
  const waiting = data?.bookings.filter((b) => b.status === 'requested').length ?? 0;
  useEffect(() => {
    if (!data || !apply || waiting === 0) return;
    const run = () => apply((d) => autoDeclineDue(d));
    if (autoDeclineDue(data) !== data) run();
    const t = window.setInterval(run, 60_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, data?.services]);
  return null;
}