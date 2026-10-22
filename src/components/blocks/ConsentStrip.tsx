import React, { useState } from 'react';
import type { PageTheme } from '../../types/page';
import { extensionActive, readMarketplace } from '../../utils/marketplace';

const KEY = 'kubicu.consent';

/**
 * Cookie notice on public pages when a tracking extension (Meta Pixel, Google tag) is on (D67).
 * Tags only "load" after Accept; the choice is remembered on this device.
 */
export function ConsentStrip({ workspaceId, theme }: {workspaceId: string;theme: PageTheme;}) {
  const market = readMarketplace(workspaceId);
  const tags = [extensionActive(market, 'meta-pixel') && 'Meta', extensionActive(market, 'google-tag') && 'Google'].filter(Boolean) as string[];
  const [choice, setChoice] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });
  if (tags.length === 0 || choice) return null;

  const decide = (v: 'accepted' | 'declined') => {
    try {
      window.localStorage.setItem(KEY, v);
    } catch {

      // Remember for this visit only.
    }setChoice(v);
  };

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[560px] rounded-[14px] p-4 shadow-3" style={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.mutedText}33` }}>
      <p className="text-[13px] leading-snug">
        This page uses {tags.join(' and ')} cookies to measure visits and ads. Nothing loads unless you accept.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => decide('declined')} className="h-9 flex-1 rounded-full text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ border: `1px solid ${theme.mutedText}66`, color: theme.text }}>
          Decline
        </button>
        <button type="button" onClick={() => decide('accepted')} className="h-9 flex-1 rounded-full text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: theme.accent, color: theme.accentText }}>
          Accept
        </button>
      </div>
    </div>);

}