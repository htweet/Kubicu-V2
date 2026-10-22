import React, { useState } from 'react';
import { CheckIcon, CopyIcon, MessageCircleIcon, UsersIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { cardStyle, mix } from '../blocks/pageStyle';

interface ReferralShareCardProps {
  theme: PageTheme;
  handle: string;
  code: string;
  productName: string;
  joinedThroughYou: number;
  reward?: string;
  /** Group goal still needs people. */
  needed: number | null;
}

/** On a DealRoom buyer's order page: their own link, and how many joined through it (D54). */
export function ReferralShareCard({ theme, handle, code, productName, joinedThroughYou, reward, needed }: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false);
  const link = `https://kub.icu/${handle}?ref=${code}`;
  const appLink = `${window.location.origin}/p/${handle}?ref=${code}`;
  const muted = { color: theme.mutedText };
  const message = `I just joined the ${productName} deal${needed ? ` — ${needed} more needed to unlock it` : ''}. Join with my link: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(appLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby="ref-heading" className="flex flex-col gap-3 p-5" style={cardStyle(theme)}>
      <div className="flex items-center gap-2">
        <UsersIcon size={16} aria-hidden />
        <h2 id="ref-heading" className="text-[15px] font-semibold">
          Your link to share
        </h2>
      </div>
      <p className="text-[13.5px] leading-snug" style={muted}>
        {needed ? `${needed} more ${needed === 1 ? 'person is' : 'people are'} needed. ` : ''}
        Everyone who joins through your link is counted for you.{reward ? ` ${reward}` : ''}
      </p>
      <div className="flex items-center gap-2 rounded-md px-3 py-2.5 font-mono text-[13px]" style={{ background: mix(theme.text, 6) }}>
        <span className="min-w-0 flex-1 truncate">{link}</span>
        <button type="button" onClick={copy} aria-label="Copy your link" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: mix(theme.text, 8) }}>
          {copied ? <CheckIcon size={14} aria-hidden /> : <CopyIcon size={14} aria-hidden />}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
        style={{ background: theme.accent, color: theme.accentText, borderRadius: 999 }}>
        
        <MessageCircleIcon size={17} aria-hidden /> Share on WhatsApp
      </a>
      <p className="text-[13px] font-medium" aria-live="polite">
        {joinedThroughYou === 0 ? 'No one has joined through your link yet.' : `${joinedThroughYou} ${joinedThroughYou === 1 ? 'person has' : 'people have'} joined through your link.`}
      </p>
    </section>);

}