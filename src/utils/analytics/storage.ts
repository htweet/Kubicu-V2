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
      events: Array.isArray(p.events) ? p.events : [],
      settings: { ...base.settings, ...p.settings },
      dismissedInsights: Array.isArray(p.dismissedInsights) ? p.dismissedInsights : [],
      sampleSeeded: !!p.sampleSeeded
    };
  } catch {
    return null;
  }
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
  }}