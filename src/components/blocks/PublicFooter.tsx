import React, { useState } from 'react';
import { FlagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { MadeWithKubicu } from './MadeWithKubicu';
import { ReportPageDialog } from './ReportPageDialog';

/** Bottom of every live page: the KUBICU badge (plan permitting) and “Report this page” (D75b). */
export function PublicFooter({ theme, badge, handle, workspaceId }: {theme: PageTheme;badge: boolean;handle: string;workspaceId: string | null;}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3 pb-10">
      {badge &&
      <div className="-mb-10">
          <MadeWithKubicu theme={theme} mode="live" />
        </div>
      }
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px]" style={{ color: theme.mutedText }}>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          <FlagIcon size={12} aria-hidden />
          Report this page
        </button>
        <span aria-hidden>·</span>
        <a href="/about/safety" className="rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          Buyer safety
        </a>
        <span aria-hidden>·</span>
        <a href="/about/privacy" className="rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          Privacy
        </a>
      </div>
      <ReportPageDialog open={open} onClose={() => setOpen(false)} handle={handle} workspaceId={workspaceId} />
    </div>);

}