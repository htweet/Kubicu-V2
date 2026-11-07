import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { AccountResult, AccountSimulation } from '../types/accountMode';
import { setRealAuthStub, realAuthEnabled, isAccountWorkspace } from '../utils/auth/realAuth';
import { StepUpDialog } from '../components/account/StepUpDialog';

interface AccountModeValue {
  /** realAuthEnabled() && isAccountWorkspace(current workspace). */
  active: boolean;
  simulation: AccountSimulation;
  /**
   * Runs a server action. If the server answers `step_up_required`, "Confirm it's you" opens; once the code
   * is accepted the same action runs again by itself. Cancelling returns `cancelled` and nothing changes.
   */
  withStepUp: <T>(run: () => Promise<AccountResult<T>>) => Promise<AccountResult<T>>;
}

const AccountModeContext = createContext<AccountModeValue>({
  active: false,
  simulation: 'normal',
  withStepUp: (run) => run(),
});

/** Account mode switch and the shared "Confirm it's you" dialog (D529). */
export function AccountModeProvider({ authMode, simulation, children }: { authMode: 'browser' | 'account'; simulation: AccountSimulation; children: React.ReactNode }) {
  // Synchronous so realAuthEnabled() is correct during this render.
  setRealAuthStub(authMode === 'account');
  const [open, setOpen] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const withStepUp = useCallback(async <T,>(run: () => Promise<AccountResult<T>>): Promise<AccountResult<T>> => {
    const first = await run();
    if (first.ok || first.code !== 'step_up_required') return first;
    const ok = await new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpen(true);
    });
    if (!ok) return { ok: false, code: 'cancelled' };
    return run();
  }, []);

  const finish = (ok: boolean) => {
    setOpen(false);
    resolver.current?.(ok);
    resolver.current = null;
  };

  const value = useMemo<AccountModeValue>(() => ({ active: realAuthEnabled() && isAccountWorkspace(), simulation, withStepUp }), [authMode, simulation, withStepUp]);

  return (
    <AccountModeContext.Provider value={value}>
      {children}
      <StepUpDialog open={open} simulation={simulation} onDone={finish} />
    </AccountModeContext.Provider>
  );
}

export function useAccountMode(): AccountModeValue {
  return useContext(AccountModeContext);
}
