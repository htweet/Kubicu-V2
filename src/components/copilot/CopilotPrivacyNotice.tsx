import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from 'lucide-react';
import type { CopilotChannel } from '../../types/copilot';
import { DRAFT_DAYS } from '../../utils/copilot/store';

/** Shown before the first message (D262). Proportionate: what's used, for how long, and what's never asked. */
export function CopilotPrivacyNotice({ channel, compact }: {channel: CopilotChannel;compact?: boolean;}) {
  return (
    <aside aria-label="Privacy" className="flex w-full gap-3 rounded-2xl border border-line bg-sunken/70 px-4 py-3 text-left">
      <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
      <div className="text-caption text-fg-muted">
        <p className="font-semibold text-fg">Before we start</p>
        <p className="mt-1">
          I only use what you tell me and the photos you send to make your page. Unclaimed drafts are deleted after {DRAFT_DAYS} days. I never need passwords, card numbers, PINs, BVN or NIN.
        </p>
        {!compact && channel === 'whatsapp' &&
        <p className="mt-1">This chat is with KUBICU’s AI agent. Messages are processed by KUBICU to make your page and aren’t end-to-end encrypted like your personal chats.</p>
        }
        <Link to="/about/copilot" className="mt-1 inline-block font-semibold text-fg underline-offset-2 hover:underline">
          How Copilot uses your information
        </Link>
      </div>
    </aside>);

}