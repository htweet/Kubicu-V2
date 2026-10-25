import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTeam } from './TeamContext';
import { useEditor } from './EditorContext';
import { useWorkspace } from './WorkspaceContext';
import { rolePermissions } from '../data/permissions';
import { joinChannel, type Beat } from '../utils/liveChannel';
import { announce } from '../utils/announce';

export interface Presence {
  id: string;
  name: string;
  colour: string;
  /** The block they have selected, if any. */
  blockId: string | null;
  /** true: another open tab on this device (real live sync). false: a simulated teammate (D60). */
  live: boolean;
  /** For live peers: which page of the space they're on. */
  pageId?: string | null;
}

interface PeerPayload {
  memberId: string;
  name: string;
  blockId: string | null;
  pageId: string | null;
}

const liveColours = ['#7C5CFF', '#E0457B', '#0EA5A4'];
const simColours = ['#E0763C', '#3C8DE0'];
const PresenceContext = createContext<Presence[]>([]);

/**
 * Canvas presence (D143). Other tabs editing the same space on this device appear live, with the block
 * they've selected. Teammates who could edit are added as clearly labelled simulated presence (D60),
 * so the several-phones experience is designed before a real-time server exists.
 */
export function PresenceProvider({ children }: {children: React.ReactNode;}) {
  const team = useTeam();
  const { state } = useEditor();
  const { currentSpace } = useWorkspace();
  const [tick, setTick] = useState(0);
  const [peers, setPeers] = useState<Beat<PeerPayload>[]>([]);
  const channel = useRef<{update: (p: PeerPayload) => void;leave: () => void;} | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 25000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const ch = joinChannel<PeerPayload>(`presence:${currentSpace.id}`, { memberId: team.me.id, name: team.me.name, blockId: null, pageId: null }, setPeers);
    channel.current = ch;
    return () => {
      ch.leave();
      channel.current = null;
      setPeers([]);
    };
  }, [currentSpace.id, team.me.id, team.me.name]);

  useEffect(() => {
    channel.current?.update({ memberId: team.me.id, name: team.me.name, blockId: state.selectedId, pageId: state.activePageId });
  }, [state.selectedId, state.activePageId, team.me.id, team.me.name]);

  // Tell screen-reader users when someone opens or leaves this space in another tab (live peers only).
  const seen = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    const now = new Map(peers.map((p) => [p.tab, p.payload.memberId === team.me.id ? 'Your other tab' : p.payload.name]));
    now.forEach((name, tab) => !seen.current.has(tab) && announce(`${name} is now editing this space`));
    seen.current.forEach((name, tab) => !now.has(tab) && announce(`${name} stopped editing`));
    seen.current = now;
  }, [peers, team.me.id]);

  const value = useMemo<Presence[]>(() => {
    const live: Presence[] = peers.map((p, i) => ({
      id: p.tab,
      name: p.payload.memberId === team.me.id ? `${p.payload.name.split(' ')[0]} (another tab)` : p.payload.name,
      colour: liveColours[i % liveColours.length],
      blockId: p.payload.pageId === state.activePageId ? p.payload.blockId : null,
      pageId: p.payload.pageId,
      live: true
    }));
    const others = team.data.members.
    filter((m) => m.id !== team.me.id && !team.paused.has(m.id) && rolePermissions[m.role].has('pages.edit') && (m.role === 'owner' || m.role === 'admin' || !m.spaceIds || m.spaceIds.includes(currentSpace.id))).
    slice(0, 2);
    const blocks = state.draft.blocks.filter((b) => !b.locked && !live.some((l) => l.blockId === b.id));
    const sims: Presence[] = others.map((member, i) => ({
      id: member.id,
      name: member.name,
      colour: simColours[i % simColours.length],
      blockId: i === 0 && blocks.length > 1 ? blocks[(tick + 1) % blocks.length].id : null,
      live: false
    }));
    return [...live, ...sims];
  }, [peers, team.data.members, team.me.id, team.paused, currentSpace.id, state.draft.blocks, state.activePageId, tick]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence(): Presence[] {
  return useContext(PresenceContext);
}