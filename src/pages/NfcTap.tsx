import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '../contexts/LocaleContext';
import { readDomains } from '../utils/domains/storage';
import { recordTap } from '../utils/nfc';

/** Where an NFC tag sends people (D442): counts the tap, then forwards to the tag's current destination. */
export function NfcTap() {
  const { handle = '', code = '' } = useParams();
  const { t: tr } = useT();
  const [state, setState] = useState<'going' | 'off' | 'missing'>('going');

  useEffect(() => {
    const tag = recordTap(handle, code);
    if (!tag) return setState('missing');
    if (tag.status === 'off') return setState('off');
    const d = tag.destination;
    if (d.type === 'url') return window.location.replace(d.url);
    if (d.type === 'link') {
      const link = readDomains(tag.workspaceId)?.links.find((l) => l.id === d.linkId && !l.archivedAt);
      if (link) return window.location.replace(`/p/${handle}/s/${link.slug}`);
    }
    // ?src=nfc so the visit shows in Analytics as an NFC tap, separate from QR scans (D443).
    window.location.replace(`/p/${handle}?src=nfc`);
  }, [handle, code]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-6">
      <div className="max-w-sm text-center">
        {state === 'going' ?
        <p className="text-label text-fg-muted" role="status">
            {tr('Opening…')}
          </p> :

        <>
            <h1 className="text-heading font-semibold text-fg">{state === 'off' ? tr('This tag has been turned off') : tr('This tag isn’t linked to anything')}</h1>
            <p className="mt-2 text-label text-fg-muted">{state === 'off' ? tr('The business switched it off — it may have been lost. You can still visit their page.') : tr('It may be an old or test tag.')}</p>
            <Link to={`/p/${handle}`} className="mt-5 inline-flex h-11 items-center rounded-md bg-action px-5 text-label font-semibold text-action-fg">
              {tr('Go to their page')}
            </Link>
          </>
        }
      </div>
    </main>);

}