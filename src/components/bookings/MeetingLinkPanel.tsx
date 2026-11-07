import React from 'react';
import { toast } from 'sonner';
import { CopyIcon, ExternalLinkIcon, RefreshCwIcon, VideoIcon } from 'lucide-react';
import type { BookingMeeting, MeetingApp } from '../../types/ops';
import { meetingApps } from '../../utils/ops/meetings';
import { Button } from '../ui/Button';

/** Seller view of a booking's meeting link (D225): copy, open, or make a new one. */
export function MeetingLinkPanel({ meeting, canRenew, onRenew }: { meeting: BookingMeeting; canRenew: boolean; onRenew: (app: MeetingApp) => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meeting.url);
      toast('Meeting link copied');
    } catch {
      toast('Couldn’t copy — select the link and copy it manually.');
    }
  };
  return (
    <section aria-label="Meeting link" className="flex flex-col gap-2.5 rounded-md border border-line p-3.5">
      <p className="flex items-center gap-2 text-label font-semibold text-fg">
        <VideoIcon size={15} aria-hidden className="text-fg-subtle" /> {meetingApps[meeting.app].name}
      </p>
      <p className="break-all font-mono text-caption text-fg-muted">{meeting.url}</p>
      {meeting.code && <p className="text-caption text-fg-muted">{meeting.app === 'zoom' ? 'Passcode' : 'Meeting ID'}: {meeting.code}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={copy}>
          Copy
        </Button>
        <a href={meeting.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-label font-medium text-fg-muted transition-colors duration-150 ease-out hover:bg-sunken hover:text-fg">
          <ExternalLinkIcon size={14} aria-hidden /> Open
        </a>
        {canRenew && (
          <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} onClick={() => onRenew(meeting.app)}>
            New link
          </Button>
        )}
      </div>
      <p className="text-caption text-fg-subtle">Preview link — it won’t open a real meeting in this prototype.</p>
    </section>
  );
}
