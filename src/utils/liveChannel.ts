/**
 * Live sync between browser tabs on this device (D143), used for canvas presence and door check-in.
 * Each tab sends a heartbeat on a BroadcastChannel; peers that stop sending are dropped.
 * In production this becomes a real-time server connection so different phones see each other.
 */

const TAB_KEY = 'kubicu.tabId';

/** A stable id for this tab (survives reloads, not shared with other tabs). */
export function tabId(): string {
  try {
    let id = sessionStorage.getItem(TAB_KEY);
    if (!id) {
      id = `tab_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(TAB_KEY, id);
    }
    return id;
  } catch {
    return 'tab_local';
  }
}

export interface Beat<T> {
  tab: string;
  at: number;
  bye?: boolean;
  payload: T;
}

export const HEARTBEAT_MS = 3000;
export const STALE_MS = 9000;

/** Join a named channel. Returns a function that updates our payload, and a cleanup. */
export function joinChannel<T>(name: string, initial: T, onPeers: (peers: Beat<T>[]) => void): {update: (p: T) => void;leave: () => void;} {
  const me = tabId();
  let payload = initial;
  const peers = new Map<string, Beat<T>>();
  if (typeof BroadcastChannel === 'undefined') return { update: () => undefined, leave: () => undefined };
  const ch = new BroadcastChannel(`kubicu:${name}`);
  const emit = () => onPeers([...peers.values()].filter((p) => Date.now() - p.at < STALE_MS));
  const send = (bye = false) => ch.postMessage({ tab: me, at: Date.now(), bye, payload } satisfies Beat<T>);
  ch.onmessage = (e: MessageEvent<Beat<T> & {hello?: boolean;}>) => {
    const b = e.data;
    if (!b || b.tab === me) return;
    if (b.bye) peers.delete(b.tab);else
    peers.set(b.tab, { ...b, at: Date.now() });
    if (b.hello) send();
    emit();
  };
  ch.postMessage({ tab: me, at: Date.now(), payload, hello: true });
  const beat = window.setInterval(() => {
    send();
    let changed = false;
    for (const [k, p] of peers) {
      if (Date.now() - p.at >= STALE_MS) {
        peers.delete(k);
        changed = true;
      }
    }
    if (changed) emit();
  }, HEARTBEAT_MS);
  const onUnload = () => send(true);
  window.addEventListener('pagehide', onUnload);
  return {
    update: (p) => {
      payload = p;
      send();
    },
    leave: () => {
      send(true);
      window.clearInterval(beat);
      window.removeEventListener('pagehide', onUnload);
      ch.close();
    }
  };
}