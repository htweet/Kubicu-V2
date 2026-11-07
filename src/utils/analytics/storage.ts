import type { AnalyticsData, AnalyticsEvent } from '../../types/analytics';

export const analyticsKey = (workspaceId: string) => `kubicu.analytics.${workspaceId}`;
const MAX_EVENTS = 20000;

export function emptyAnalytics(): AnalyticsData {
  return { events: [], settings: { enabled: true, excludeOwn: false, retentionDays: 90 }, dismissedInsights: [], sampleSeeded: false };
}

export function readAnalytics(workspaceId: string): AnalyticsData | null {
  try {
    const raw = window.localStorage.getItem(analyticsKey(workspaceId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AnalyticsData>;
    const base = emptyAnalytics();
    return {
      events: Array.isArray(p.events) ? p.events.map(sampleDevice) : [],
      settings: { ...base.settings, ...p.settings },
      dismissedInsights: Array.isArray(p.dismissedInsights) ? p.dismissedInsights : [],
      sampleSeeded: !!p.sampleSeeded,
    };
  } catch {
    return null;
  }
}

/** Sample visits saved before devices were counted (D258) get one, from their session id — never real visits. */
function sampleDevice(e: AnalyticsEvent): AnalyticsEvent {
  if (!e.sample || (e.device && (e.via || !e.campaign))) return e;
  let h = 0;
  for (let i = 0; i < e.session.length; i++) h = (h * 31 + e.session.charCodeAt(i)) % 100;
  const device = e.device ?? (h < 72 ? 'phone' : h < 94 ? 'desktop' : 'tablet');
  // Sample short-link clicks get where the tap came from (D271): mostly the place the link was made for.
  const via = e.campaign && !e.via ? (e.source === 'qr' ? 'direct' : h % 10 < 7 ? e.source : h % 10 < 9 ? 'direct' : 'other') : e.via;
  return { ...e, device, via };
}

/** Drops events past the retention window and keeps the newest when the cap is reached. */
export function prune(data: AnalyticsData, now = Date.now()): AnalyticsData {
  const since = now - data.settings.retentionDays * 86400000;
  const kept = data.events.filter((e) => Date.parse(e.at) >= since);
  return { ...data, events: kept.length > MAX_EVENTS ? kept.slice(kept.length - MAX_EVENTS) : kept };
}

export function writeAnalytics(workspaceId: string, data: AnalyticsData): void {
  window.localStorage.setItem(analyticsKey(workspaceId), JSON.stringify(prune(data)));
}

/** Appends one event for a workspace (used by public pages, which may belong to any workspace on this device). */
export function appendEvent(workspaceId: string, event: AnalyticsEvent): void {
  const data = readAnalytics(workspaceId) ?? emptyAnalytics();
  if (!data.settings.enabled) return;
  try {
    writeAnalytics(workspaceId, { ...data, events: [...data.events, event] });
    // Same-tab listeners (the workspace screens) refresh from this.
    window.dispatchEvent(new CustomEvent('kubicu:analytics', { detail: workspaceId }));
  } catch {
    // Storage full — analytics are best-effort and never block the visitor.
  }
}
