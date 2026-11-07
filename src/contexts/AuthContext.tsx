import { setSignedInNow } from '../utils/autoLink';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, signOutSession, type Me } from '../utils/auth/session';

/**
 * Signed-in state for real sign-in (M2.6). Only GET /v1/me decides who is signed in; the prototype's
 * simulated account (kubicu.account) is ignored for this. Mounted only when the flag is on.
 */
type Status = 'loading' | 'signedIn' | 'signedOut' | 'error';

interface AuthValue {
  status: Status;
  me: Me | null;
  refresh: () => Promise<Me | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchMe();
      setMe(next);
      setStatus(next ? 'signedIn' : 'signedOut');
      setSignedInNow(!!next);
      return next;
    } catch {
      setStatus('error');
      setSignedInNow(false);
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutSession();
    } finally {
      setMe(null);
      setStatus('signedOut');
      setSignedInNow(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ status, me, refresh, signOut }), [status, me, refresh, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** The real sign-in state, or null when the flag is off (prototype behaviour). */
export function useOptionalAuth(): AuthValue | null {
  return useContext(AuthContext);
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth needs AuthProvider (real sign-in is off)');
  return v;
}
