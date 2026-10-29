import React, { useEffect, useState } from 'react';
import type { PageTheme } from '../../types/page';
import { extensionActive, readMarketplace } from '../../utils/marketplace';
import { CLARITY_ID, GA_ID, PIXEL_ID, TIKTOK_ID, loadClarity, loadGoogleTag, loadMetaPixel, loadTikTokPixel } from '../../utils/trackingTags';

const KEY = 'kubicu.consent';

/**
 * Cookie notice on public pages when a tracking extension is on (D67): Meta Pixel, Google tag,
 * TikTok Pixel or Microsoft Clarity (D232). Tags load only after Accept (D230); the choice is remembered
 * on this device. Paused or uninstalled extensions load nothing and show no notice.
 */
export function ConsentStrip({ workspaceId, theme }: {workspaceId: string;theme: PageTheme;}) {
  const market = readMarketplace(workspaceId);
  const setting = (id: string, key: string) => extensionActive(market, id) ? (market.installed[id]?.settings[key] ?? '').trim() : '';
  const pixelId = setting('meta-pixel', 'pixelId');
  const tagId = setting('google-tag', 'tagId');
  const tiktokId = setting('tiktok-pixel', 'pixelId');
  const clarityId = setting('clarity', 'projectId');
  const tags = [PIXEL_ID.test(pixelId) && 'Meta', GA_ID.test(tagId) && 'Google', TIKTOK_ID.test(tiktokId) && 'TikTok', CLARITY_ID.test(clarityId) && 'Microsoft Clarity'].filter(Boolean) as string[];
  const [choice, setChoice] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (choice !== 'accepted') return;
    if (PIXEL_ID.test(pixelId)) loadMetaPixel(pixelId);
    if (GA_ID.test(tagId)) loadGoogleTag(tagId);
    if (TIKTOK_ID.test(tiktokId)) loadTikTokPixel(tiktokId);
    if (CLARITY_ID.test(clarityId)) loadClarity(clarityId);
  }, [choice, pixelId, tagId, tiktokId, clarityId]);

  if (tags.length === 0 || choice) return null;

  const decide = (v: 'accepted' | 'declined') => {
    try {
      window.localStorage.setItem(KEY, v);
    } catch {

      // Remember for this visit only.
    }setChoice(v);
  };

  const list = tags.length > 1 ? `${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]}` : tags[0];

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[560px] rounded-[14px] p-4 shadow-3" style={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.mutedText}33` }}>
      <p className="text-[13px] leading-snug">
        This page uses {list} cookies to measure visits and ads. Nothing loads unless you accept.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => decide('declined')} className="h-11 flex-1 rounded-full text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ border: `1px solid ${theme.mutedText}66`, color: theme.text }}>
          Decline
        </button>
        <button type="button" onClick={() => decide('accepted')} className="h-11 flex-1 rounded-full text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: theme.accent, color: theme.accentText }}>
          Accept
        </button>
      </div>
    </div>);

}