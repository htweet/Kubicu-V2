import React, { useEffect, useRef } from 'react';
import { appendEvent, readAnalytics } from '../utils/analytics/storage';
import { browserId, deviceKind, sessionId } from '../utils/analytics/track';
import { clickVia, isAutomated, isBurst } from '../utils/analytics/clickQuality';
import { linkScheduled, waHref, waPhoneError } from '../utils/domains/linkRules';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarClockIcon, LinkIcon, MessageCircleIcon, PauseCircleIcon, ShieldAlertIcon } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { fallbackDestination, findShortLink, landingHref, linkEnded, spaceHandle } from '../utils/domains/links';
import { readDomains } from '../utils/domains/storage';
import { readCommerce } from '../utils/commerce/storage';
import { checkDestination } from '../utils/linkSafety';
import { MAIN_SPACE_ID } from '../utils/spaces';
import { pageHref } from '../utils/sitePages';

/**
 * kub.icu/{handle}/s/{slug}: a campaign link or QR scan lands on its destination, tagged for Analytics (D62).
 * If the destination was removed, the scan falls back to the nearest page that still exists (D72) — printed codes never dead-end.
 * Paused links and website links (D268): website addresses are checked again before anyone is sent there.
 */
export function ShortLink() {
  const { handle = '', slug = '' } = useParams();
  const { workspaces } = useWorkspace();
  const hit = findShortLink(workspaces, handle, slug, readDomains);
  const scheduled = hit && !linkEnded(hit.link) && !hit.link.pausedAt && linkScheduled(hit.link);
  const live = hit && !linkEnded(hit.link) && !hit.link.pausedAt && !scheduled;
  const wa = hit && live && hit.link.whatsapp && !waPhoneError(hit.link.whatsapp.phone) ? waHref(hit.link.whatsapp) : null;
  const external = hit && live && !hit.link.whatsapp && hit.link.externalUrl ? checkDestination(hit.link.externalUrl) : null;
  const link = hit && live && !hit.link.externalUrl && !hit.link.whatsapp ? { ...hit.link, destination: fallbackDestination(hit.workspace, readCommerce(hit.workspace.id), hit.link.destination) } : null;
  const target = hit && link ? landingHref(hit.workspace.id, link) : null;

  const externalTarget = wa ?? (external?.ok ? external.url : null);
  const recorded = useRef(false);
  // Every tap or scan that goes somewhere is a click on the link (D270) — website and WhatsApp links included.
  // Bots, link previews and rapid repeats are recorded but flagged, so they're never counted as clicks (D271).
  useEffect(() => {
    if (recorded.current || !hit || !(target || externalTarget)) return;
    recorded.current = true;
    const browser = browserId();
    const invalid = isAutomated() ? 'bot' : isBurst(readAnalytics(hit.workspace.id)?.events ?? [], hit.link.slug, browser) ? 'burst' : undefined;
    appendEvent(hit.workspace.id, {
      type: 'link_click',
      at: new Date().toISOString(),
      session: sessionId(),
      browser,
      device: deviceKind(),
      source: hit.link.source,
      campaign: hit.link.slug,
      handle,
      pageId: null,
      label: wa ? 'whatsapp' : externalTarget ? 'website' : 'page',
      via: clickVia(),
      ...(invalid ? { invalid } : {}),
    });
  }, [hit, target, externalTarget, wa, handle]);
  useEffect(() => {
    if (externalTarget) window.location.replace(externalTarget);
  }, [externalTarget]);

  if (target) return <Navigate to={target} replace />;
  const home = hit ? spaceHandle(hit.workspace.id, MAIN_SPACE_ID) : handle;

  const state = wa
    ? { icon: MessageCircleIcon, title: 'Opening WhatsApp', text: 'This short link starts a WhatsApp chat. You can edit the message before sending.' }
    : external?.ok
    ? { icon: LinkIcon, title: `Taking you to ${external.host}`, text: 'This short link goes to another website.' }
    : scheduled && hit?.link.startsAt
      ? { icon: CalendarClockIcon, title: 'This link isn’t live yet', text: `It starts on ${new Date(hit.link.startsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. Their main page is open now.` }
    : hit?.link.whatsapp && live
      ? { icon: ShieldAlertIcon, title: 'This link can’t open WhatsApp', text: 'Its WhatsApp number isn’t valid. Their main page is still open.' }
    : external && !external.ok
      ? { icon: ShieldAlertIcon, title: 'This link was stopped', text: 'Its website address didn’t pass KUBICU’s safety check, so we haven’t sent you there.' }
      : hit?.link.pausedAt
        ? { icon: PauseCircleIcon, title: 'This link is paused', text: 'The owner has paused it for now. Their main page is still open.' }
        : hit
          ? { icon: LinkIcon, title: 'This link has ended', text: 'The owner stopped using this link or QR code.' }
          : { icon: LinkIcon, title: 'This link doesn’t exist', text: 'Check the address, or visit the page directly.' };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F4EE] px-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center" role="status">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAE4D8] text-[#6B6459]">
          <state.icon size={20} aria-hidden />
        </span>
        <h1 className="text-[20px] font-semibold text-[#1F1B16]">{state.title}</h1>
        <p className="text-[14px] text-[#6B6459]">{state.text}</p>
        {wa ? (
          <a href={wa} rel="noopener noreferrer" className="mt-2 inline-flex h-11 items-center rounded-full bg-[#1F1B16] px-5 text-[14px] font-semibold text-white">
            Open WhatsApp
          </a>
        ) : external?.ok ? (
          <a href={external.url} rel="noopener noreferrer" className="mt-2 inline-flex h-11 items-center rounded-full bg-[#1F1B16] px-5 text-[14px] font-semibold text-white">
            Continue to {external.host}
          </a>
        ) : (
          <Link to={pageHref(home ?? handle, '')} className="mt-2 inline-flex h-11 items-center rounded-full bg-[#1F1B16] px-5 text-[14px] font-semibold text-white">
            Go to kub.icu/{home ?? handle}
          </Link>
        )}
      </div>
    </main>
  );
}
