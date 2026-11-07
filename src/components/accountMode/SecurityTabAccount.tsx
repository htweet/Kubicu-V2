import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import type { AccountFailure } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useT } from '../../contexts/LocaleContext';
import { simulate } from '../../utils/accountModeSim';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { AccountStateAlert } from '../account/AccountStates';

/**
 * Account → Sign-in & security in account mode (D538). The server can sign out this device or every
 * session, but can't list devices yet. Password, two-step, backup codes, sign-in history and Google/Apple
 * have no server behind them for e-mail-code accounts, so they're hidden rather than shown doing nothing.
 */
export function SecurityTabAccount() {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const { simulation } = useAccountMode();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);

  const signOutEverywhere = async () => {
    setBusy(true);
    setFailure(null);
    const r = await simulate('session.signOutEverywhere', simulation);
    setBusy(false);
    if (r.ok || r.code === 'session_ended') {
      setConfirming(false);
      navigate('/signin');
      return;
    }
    setFailure(r);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        id="sec-signout"
        emphasis="primary"
        title={tr('Sign out everywhere')}
        description={tr('Signs you out on every phone and computer, including this one.')}
        actions={
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={LogOutIcon}
            onClick={() => {
              setFailure(null);
              setConfirming(true);
            }}
          >
            {tr('Sign out everywhere')}
          </Button>
        }
      />
      <p className="text-caption text-fg-muted">{tr('You sign in with a code sent to your email. Password, two-step sign-in and the list of your devices will appear here once they’re available for your account.')}</p>

      <Dialog
        open={confirming}
        onClose={() => !busy && setConfirming(false)}
        title={tr('Sign out everywhere?')}
        description={tr('You’ll be signed out on every phone and computer, including this one. You can sign in again with a code.')}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>
              {tr('Cancel')}
            </Button>
            <Button variant="destructive" loading={busy} onClick={() => void signOutEverywhere()}>
              {busy ? tr('Signing out…') : tr('Sign out everywhere')}
            </Button>
          </>
        }
      >
        {failure && <AccountStateAlert failure={failure} onRetry={() => void signOutEverywhere()} />}
      </Dialog>
    </div>
  );
}
