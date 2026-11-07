import React, { createContext, useContext } from 'react';
import type { AnalyticsEvent, EventType, SourceId } from '../types/analytics';
import { appendEvent, readAnalytics } from '../utils/analytics/storage';
import { browserId, deviceKind, sessionId } from '../utils/analytics/track';

export type TrackFn = (type: EventType, extra?: Partial<Pick<AnalyticsEvent, 'blockId' | 'label' | 'valueNgn' | 'pageId'>>) => void;

const noop: TrackFn = () => undefined;
const TrackContext = createContext<TrackFn>(noop);

interface TrackerOptions {
  /** Owner of the page being viewed; null for examples (never recorded). */
  workspaceId: string | null;
  handle: string;
  pageId: string | null;
  source: { source: SourceId; campaign?: string };
  /** Draft previews and the canvas never record. */
  disabled: boolean;
  /** The viewer is the page's owner on this device. */
  isOwner: boolean;
}

/** Records what visitors do on a public page (D61). */
export function createTracker({ workspaceId, handle, pageId, source, disabled, isOwner }: TrackerOptions): TrackFn {
  if (disabled || !workspaceId) return noop;
  return (type, extra) => {
    if (isOwner && readAnalytics(workspaceId)?.settings.excludeOwn) return;
    appendEvent(workspaceId, { type, at: new Date().toISOString(), session: sessionId(), browser: browserId(), device: deviceKind(), source: source.source, campaign: source.campaign, handle, pageId, ...extra });
  };
}

export function TrackProvider({ value, children }: { value: TrackFn; children: React.ReactNode }) {
  return <TrackContext.Provider value={value}>{children}</TrackContext.Provider>;
}

export function useTrack(): TrackFn {
  return useContext(TrackContext);
}
