import { useCallback, useEffect, useState } from 'react';
import type { AgreementSide } from '../types/partnership';

const key = (docId: string) => `kubicu.cobrand.actor.${docId}`;
const event = 'kubicu:cobrand-actor';

function read(docId: string): AgreementSide {
  try {
    return window.localStorage.getItem(key(docId)) === 'partner' ? 'partner' : 'lead';
  } catch {
    return 'lead';
  }
}

/**
 * Prototype only (D121): which business you're acting as in a co-branded space's canvas.
 * In the real product the partner edits from their own KUBICU; here one switch stands in for that.
 */
export function useCoBrandActor(docId: string): [AgreementSide, (side: AgreementSide) => void] {
  const [side, setSide] = useState<AgreementSide>(() => read(docId));
  useEffect(() => {
    const sync = () => setSide(read(docId));
    sync();
    window.addEventListener(event, sync);
    return () => window.removeEventListener(event, sync);
  }, [docId]);
  const set = useCallback(
    (next: AgreementSide) => {
      try {
        window.localStorage.setItem(key(docId), next);
      } catch {
        /* storage unavailable */
      }
      setSide(next);
      window.dispatchEvent(new Event(event));
    },
    [docId],
  );
  return [side, set];
}
