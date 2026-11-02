import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '../contexts/LocaleContext';
import { spaceHandle } from '../utils/domains/links';
import { MAIN_SPACE_ID } from '../utils/spaces';
import { findTracked, sponsorCampaign } from '../utils/sponsorships';

/**
 * A creator's tracked sponsorship link (D457): forwards to the brand's main page with the deal's campaign attached,
 * so the visit, taps and orders show in the brand's Analytics and on the deal.
 */
export function SponsorLink() {
  const { code = '' } = useParams();
  const { t: tr } = useT();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const hit = findTracked(code);
    const handle = hit ? spaceHandle(hit.brief.brandWorkspaceId, MAIN_SPACE_ID) : null;
    if (!hit || !handle) return setMissing(true);
    window.location.replace(`/p/${handle}?src=campaign&c=${encodeURIComponent(sponsorCampaign(code))}`);
  }, [code]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-6">
      <div className="max-w-sm text-center">
        {missing ?
        <>
            <h1 className="text-heading font-semibold text-fg">{tr('This link isn’t active')}</h1>
            <p className="mt-2 text-label text-fg-muted">{tr('The sponsorship it belonged to may have ended.')}</p>
            <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-md bg-action px-5 text-label font-semibold text-action-fg">
              {tr('Go to KUBICU')}
            </Link>
          </> :

        <p className="text-label text-fg-muted" role="status">
            {tr('Opening…')}
          </p>
        }
      </div>
    </main>);

}