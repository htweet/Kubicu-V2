import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlagIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { ReportPageDialog } from '../../components/blocks/ReportPageDialog';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';

/** Website entry to the existing visitor report flow (D75b). */
export function ReportAPage() {
  const [address, setAddress] = useState('');
  const [tried, setTried] = useState(false);
  const [open, setOpen] = useState(false);
  const handle = address.trim().replace(/^https?:\/\//, '').replace(/^(www\.)?kub\.icu\//, '').replace(/^\/?p\//, '').split(/[/?#]/)[0];
  const error = handle && /^[a-z0-9-_.]{2,}$/i.test(handle) ? '' : 'Paste the page address, e.g. kub.icu/adaeze-atelier';

  return (
    <>
      <InfoHero crumb="Trust & safety" title="Report a page" intro="Tell us about scams, counterfeits, harmful content or anything that breaks our rules. A person reviews every report, and the seller is never told who reported it." />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!error) setOpen(true);
          }}
          className="nm-frame rounded-2xl">
          
          <div className="flex flex-col gap-5 rounded-[15px] bg-raised p-6 md:p-8">
            <h2 className="text-title font-semibold text-fg">Which page?</h2>
            <TextInput id="report-address" label="Page address" placeholder="kub.icu/…" value={address} error={tried ? error || undefined : undefined} hint="You’ll find it in your browser’s address bar." onChange={(e) => setAddress(e.target.value)} />
            <Button type="submit" variant="brand" size="lg" leadingIcon={FlagIcon} className="self-start">
              Continue
            </Button>
          </div>
        </form>
        <aside className="flex flex-col gap-4 text-label text-fg-muted">
          <h2 className="text-heading font-semibold text-fg">What happens next</h2>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            <li className="py-4">A moderator reviews the page, usually within 2 working days.</li>
            <li className="py-4">If it breaks our rules, the page is removed or the seller is paused.</li>
            <li className="py-4">The seller can appeal; a different staff member decides.</li>
          </ol>
          <p>
            Lost money? Contact your bank first. Read <Link to="/about/takedown" className="font-semibold text-fg underline">takedowns and appeals</Link>.
          </p>
        </aside>
      </div>
      <ReportPageDialog open={open} onClose={() => setOpen(false)} handle={handle} workspaceId={null} />
    </>);

}