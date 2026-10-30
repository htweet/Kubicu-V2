import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from 'lucide-react';
import type { CopilotChannel } from '../../types/copilot';
import { useT } from '../../contexts/LocaleContext';
import { DRAFT_DAYS } from '../../utils/copilot/store';

/** Shown before the first message (D262). Proportionate: what's used, for how long, and what's never asked. Translated in D339. */
export function CopilotPrivacyNotice({ channel, compact }: {channel: CopilotChannel;compact?: boolean;}) {
  const { t: tr } = useT();
  return (
    <aside aria-label={tr('Privacy')} className="flex w-full gap-3 rounded-2xl border border-line bg-sunken/70 px-4 py-3 text-left">
      <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
      <div className="text-caption text-fg-muted">
        <p className="font-semibold text-fg">{tr('Before we start')}</p>
        <p className="mt-1">
          {tr('I only use what you tell me and the photos you send to make your page. Unclaimed drafts are deleted after {n} days. I never need passwords, card numbers, PINs, BVN or NIN.', { n: DRAFT_DAYS })}
        </p>
        {!compact && channel === 'whatsapp' &&
        <p className="mt-1">{tr('This chat is with KUBICU’s AI agent. Messages are processed by KUBICU to make your page and aren’t end-to-end encrypted like your personal chats.')}</p>
        }
        <Link to="/about/copilot" className="mt-1 inline-block font-semibold text-fg underline-offset-2 hover:underline">
          {tr('How Copilot uses your information')}
        </Link>
      </div>
    </aside>);

}