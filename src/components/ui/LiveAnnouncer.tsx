import React, { useEffect, useState } from 'react';
import { subscribeAnnouncer } from '../../utils/announce';

/** Renders the shared polite and assertive live regions used by `announce()` (D76). */
export function LiveAnnouncer() {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');

  useEffect(() => {
    let timer = 0;
    return subscribeAnnouncer((message, politeness) => {
      const set = politeness === 'assertive' ? setAssertive : setPolite;
      // Clear first so the same message twice in a row is still read out.
      set('');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => set(message), 60);
    });
  }, []);

  return (
    <div className="sr-only">
      <div role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </div>);

}