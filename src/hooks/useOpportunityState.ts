import { useCallback, useEffect, useState } from 'react';

/** Per-workspace record of what the owner handled, snoozed or dismissed in the Opportunity Inbox (D81). */
export interface OpportunityState {
  /** id → ISO time the snooze ends. */
  snoozed: Record<string, string>;
  /** id → ISO time it was dismissed or marked handled. */
  dismissed: Record<string, string>;
}

const empty: OpportunityState = { snoozed: {}, dismissed: {} };
const key = (workspaceId: string) => `kubicu.opportunities.${workspaceId}`;

function read(workspaceId: string): OpportunityState {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<OpportunityState>;
    return { snoozed: parsed.snoozed ?? {}, dismissed: parsed.dismissed ?? {} };
  } catch {
    return empty;
  }
}

export function useOpportunityState(workspaceId: string) {
  const [state, setState] = useState<OpportunityState>(() => read(workspaceId));
  useEffect(() => setState(read(workspaceId)), [workspaceId]);

  const update = useCallback(
    (fn: (s: OpportunityState) => OpportunityState) => {
      setState((s) => {
        const next = fn(s);
        try {
          window.localStorage.setItem(key(workspaceId), JSON.stringify(next));
        } catch {
          /* storage full — keep in memory */
        }
        return next;
      });
    },
    [workspaceId],
  );

  const snooze = (id: string, days: number) => update((s) => ({ ...s, snoozed: { ...s.snoozed, [id]: new Date(Date.now() + days * 86400000).toISOString() } }));
  const dismiss = (id: string) => update((s) => ({ ...s, dismissed: { ...s.dismissed, [id]: new Date().toISOString() } }));
  const restore = (id: string) =>
    update((s) => {
      const snoozed = { ...s.snoozed };
      const dismissed = { ...s.dismissed };
      delete snoozed[id];
      delete dismissed[id];
      return { snoozed, dismissed };
    });

  const isHidden = (id: string, now = Date.now()) => !!state.dismissed[id] || (!!state.snoozed[id] && Date.parse(state.snoozed[id]) > now);

  return { state, snooze, dismiss, restore, isHidden };
}
