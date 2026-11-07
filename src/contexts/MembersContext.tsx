import React, { createContext, useContext } from 'react';
import type { MemberRule } from '../types/page';
import type { AccessResult, MemberSession } from '../utils/members';

/** Members-only content on the live page (D110). Absent in the canvas, where everything shows. */
export interface MembersValue {
  handle: string;
  session: MemberSession | null;
  /** Draft preview only: see the page as a visitor or as a member. */
  preview: 'visitor' | 'member' | null;
  check: (rule: MemberRule) => AccessResult;
  openSignIn: () => void;
  signOut: () => void;
  /** Opens sign-up for a plan, or null when the page can't take sign-ups (draft, example). */
  join: ((planId: string) => void) | null;
}

const MembersContext = createContext<MembersValue | null>(null);

export function MembersProvider({ value, children }: { value: MembersValue | null; children: React.ReactNode }) {
  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers(): MembersValue | null {
  return useContext(MembersContext);
}
