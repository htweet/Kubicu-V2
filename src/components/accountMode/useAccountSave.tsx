import React, { useRef, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { AccountAction, AccountFailure } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useT } from '../../contexts/LocaleContext';
import { simulate } from '../../utils/accountModeSim';
import { accountErrorCopy, isScreenFailure, toastSaved } from '../account/AccountStates';

export type SaveOutcome = 'ok' | 'cancelled' | 'failed' | 'screen';
export type SaveState = { kind: 'saving' } | { kind: 'saved' } | { kind: 'failed'; text: string } | null;

/**
 * One save to the server for one control (D544). The caller keeps showing the old value unless `run`
 * resolves 'ok'. Used by existing settings controls in account mode; browser mode never calls it.
 */
export function useAccountSave() {
  const { active, simulation, withStepUp } = useAccountMode();
  const { t: tr } = useT();
  const [state, setState] = useState<SaveState>(null);
  const [screenFailure, setScreenFailure] = useState<AccountFailure | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const run = async (opts: { action: AccountAction; stepUp?: boolean; refusal?: string }): Promise<SaveOutcome> => {
    window.clearTimeout(timer.current);
    setState({ kind: 'saving' });
    const r = await withStepUp(() => simulate(opts.action, simulation, { stepUp: opts.stepUp, refusal: opts.refusal }));
    if (r.ok) {
      setState({ kind: 'saved' });
      toastSaved(tr);
      timer.current = window.setTimeout(() => setState(null), 2500);
      return 'ok';
    }
    if (r.code === 'cancelled') {
      setState(null);
      return 'cancelled';
    }
    if (isScreenFailure(r.code)) {
      setState(null);
      setScreenFailure(r);
      return 'screen';
    }
    setState({ kind: 'failed', text: `${tr('Couldn’t save.')} ${accountErrorCopy(tr, r).body}` });
    return 'failed';
  };

  return { active, state, screenFailure, run, busy: state?.kind === 'saving' };
}

/** Saving… / Saved / Couldn't save line shown under a control. */
export function SaveStatus({ state, className }: { state: SaveState; className?: string }) {
  const { t: tr } = useT();
  if (!state) return null;
  if (state.kind === 'saving')
    return (
      <p className={`flex items-center gap-1.5 text-caption text-fg-subtle ${className ?? ''}`} role="status">
        <Loader2Icon size={12} className="animate-spin" aria-hidden />
        {tr('Saving…')}
      </p>
    );
  if (state.kind === 'saved')
    return (
      <p className={`text-caption text-success ${className ?? ''}`} role="status">
        {tr('Saved')}
      </p>
    );
  return (
    <p className={`text-caption text-danger ${className ?? ''}`} role="alert">
      {state.text}
    </p>
  );
}
