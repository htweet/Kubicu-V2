import React, { createContext, useContext } from 'react';

/** Lets a Subscription block on the live page open the sign-up sheet (D69). Absent in the canvas. */
const SubscribeContext = createContext<((planId: string) => void) | null>(null);

export function SubscribeProvider({ open, children }: { open: ((planId: string) => void) | null; children: React.ReactNode }) {
  return <SubscribeContext.Provider value={open}>{children}</SubscribeContext.Provider>;
}

export function useSubscribeOpener(): ((planId: string) => void) | null {
  return useContext(SubscribeContext);
}
