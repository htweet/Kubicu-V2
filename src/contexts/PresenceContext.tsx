import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Member } from '../types/team';
import { useTeam } from './TeamContext';
import { useEditor } from './EditorContext';
import { useWorkspace } from './WorkspaceContext';
import { rolePermissions } from '../data/permissions';

export interface Presence {
  member: Member;
  colour: string;
  /** The block they're “editing”, if any. */
  blockId: string | null;
}

const colours = ['#E0763C', '#3C8DE0', '#2EA36B', '#B35AD6'];
const PresenceContext = createContext<Presence[]>([]);

/**
 * SIMULATED canvas presence (D60): teammates who could edit this space appear as if they're
 * here, one of them on a block. Real presence needs live sync and comes with the backend.
 */
export function PresenceProvider({ children }: {children: React.ReactNode;}) {
  const team = useTeam();
  const { state } = useEditor();
  const { currentSpace } = useWorkspace();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 25000);
    return () => window.clearInterval(t);
  }, []);

  const value = useMemo(() => {
    const others = team.data.members.
    filter((m) => m.id !== team.me.id && !team.paused.has(m.id) && rolePermissions[m.role].has('pages.edit') && (m.role === 'owner' || m.role === 'admin' || !m.spaceIds || m.spaceIds.includes(currentSpace.id))).
    slice(0, 2);
    const blocks = state.draft.blocks.filter((b) => !b.locked);
    return others.map((member, i) => ({
      member,
      colour: colours[i % colours.length],
      blockId: i === 0 && blocks.length > 1 ? blocks[(tick + 1) % blocks.length].id : null
    }));
  }, [team.data.members, team.me.id, team.paused, currentSpace.id, state.draft.blocks, tick]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence(): Presence[] {
  return useContext(PresenceContext);
}