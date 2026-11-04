import { useEffect, useState } from 'react';
import { announce } from '../../utils/announce';

export const RESEND_COOLDOWN = 30;

/**
 * The resend timer used by VerifyEmail (30 s). Screen readers hear it once when it starts and once when
 * the code can be resent, not every second (aria-live polite through announce()).
 */
export function useResendCooldown(t: (s: string, v?: Record<string, string | number>) => string): { wait: number; restart: () => void } {
  const [wait, setWait] = useState(RESEND_COOLDOWN);
  const [started, setStarted] = useState(0);

  useEffect(() => {
    announce(t('You can ask for a new code in {n} seconds.', { n: RESEND_COOLDOWN }));
  }, [started, t]);

  useEffect(() => {
    if (wait <= 0) {
      announce(t('You can ask for a new code now.'));
      return;
    }
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait, t]);

  return {
    wait,
    restart: () => {
      setWait(RESEND_COOLDOWN);
      setStarted((n) => n + 1);
    }
  };
}
