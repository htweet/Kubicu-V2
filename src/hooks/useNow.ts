import { useEffect, useState } from 'react';

/** Current time, refreshed on an interval. Pass null to stop ticking. */
export function useNow(intervalMs: number | null = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (intervalMs === null) return;
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
