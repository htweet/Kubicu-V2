import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ClockIcon, LogInIcon, UserCheckIcon, UserXIcon, UsersIcon } from 'lucide-react';
import type { Role } from '../../types/team';
import type { AccountFailure } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useT } from '../../contexts/LocaleContext';
import { roleInfo } from '../../data/permissions';
import { sampleInviterName, sampleInviteWorkspace, sampleAccountEmail } from '../../data/accountModeSamples';
import { simulate } from '../../utils/accountModeSim';
import { useAccount } from '../../utils/account/store';
import { AuthLayout } from '../auth/AuthLayout';
import { Button } from '../ui/Button';
import { AccountStateAlert } from '../account/AccountStates';

type State = 'checking' | 'signedOut' | 'ready' | 'joining' | 'wrongAccount' | 'notFound' | 'noSeats' | 'alreadyMember' | 'joined' | 'failed';

/**
 * Accept an invite in account mode (D534). The server never says whether a link expired, was cancelled or
 * was used, so one shared state covers all three. Sample workspace, inviter and role are illustrative.
 */
export function AcceptInviteAccount({ token }: { token: string }) {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const account = useAccount();
  const { simulation } = useAccountMode();
  const [state, setState] = useState<State>('checking');
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const workspace = sampleInviteWorkspace;
  const inviter = sampleInviterName;
  const role: Role = 'editor';
  const next = `/signin?next=${encodeURIComponent(`/invite/${token}`)}`;

  const check = useCallback(() => {
    setState('checking');
    setFailure(null);
    const timer = window.setTimeout(() => {
      if (simulation === 'offline' || simulation === 'serverDown') {
        setFailure({ ok: false, code: simulation === 'offline' ? 'offline' : 'server_unavailable' });
        setState('failed');
      } else if (simulation === 'sessionEnded') setState('signedOut');
      else if (simulation === 'refused') setState('wrongAccount');
      else if (simulation === 'empty') setState('notFound');
      else if (simulation === 'conflict') setState('alreadyMember');
      else setState('ready');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [simulation]);

  useEffect(() => check(), [check]);

  const join = async () => {
    setState('joining');
    const r = await simulate('invite.accept', simulation);
    if (r.ok) return setState('joined');
    if (r.code === 'no_seats') return setState('noSeats');
    setFailure(r);
    setState('failed');
  };

  const shell = (icon: React.ReactNode, title: string, body: string, action?: React.ReactNode) => (
    <AuthLayout title={title} description={body}>
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-fg-muted">{icon}</span>
        {action}
      </div>
    </AuthLayout>
  );

  const openWorkspace = (
    <Button onClick={() => navigate('/app')}>{tr('Open workspace')}</Button>
  );

  switch (state) {
    case 'checking':
      return shell(<UsersIcon size={20} aria-hidden />, tr('Checking your invite…'), tr('This takes a moment.'));
    case 'signedOut':
      return shell(<LogInIcon size={20} aria-hidden />, tr('Sign in to join {workspace}', { workspace }), tr('Use the email address or phone number this invite was sent to. You’ll come back here after signing in.'), <Button onClick={() => navigate(next)}>{tr('Sign in')}</Button>);
    case 'wrongAccount':
      return shell(
        <UserXIcon size={20} aria-hidden />,
        tr('This invite is for a different account'),
        tr('You’re signed in as {email}. Sign in with the e-mail address this invite was sent to.', { email: account.profile.email || sampleAccountEmail }),
        <Button variant="secondary" onClick={() => navigate(next)}>
          {tr('Sign out and use another account')}
        </Button>,
      );
    case 'notFound':
      return shell(<ClockIcon size={20} aria-hidden />, tr('Invite not found or expired'), tr('Ask {inviter} for a new invite.', { inviter }), <Link to="/" className="text-label font-medium text-fg underline underline-offset-2">{tr('Go to KUBICU')}</Link>);
    case 'noSeats':
      return shell(<UsersIcon size={20} aria-hidden />, tr('No seats left'), tr('{workspace} has no free seats right now. Ask the Owner to free a seat or upgrade, then open this link again.', { workspace }), <Button variant="secondary" onClick={() => void join()}>{tr('Try again')}</Button>);
    case 'alreadyMember':
      return shell(<UserCheckIcon size={20} aria-hidden />, tr('Already a member'), tr('You’re already in {workspace}.', { workspace }), openWorkspace);
    case 'joined':
      return shell(<CheckIcon size={20} aria-hidden />, tr('You’ve joined {workspace}', { workspace }), tr('Your role is {role}. {summary}', { role: tr(roleInfo[role].label), summary: tr(roleInfo[role].summary) }), openWorkspace);
    case 'failed':
      return shell(<UsersIcon size={20} aria-hidden />, tr('We couldn’t check your invite'), tr('Nothing has changed.'), failure ? <AccountStateAlert failure={failure} onRetry={check} className="w-full" /> : undefined);
    default:
      return shell(
        <UsersIcon size={20} aria-hidden />,
        tr('Join {workspace}', { workspace }),
        tr('{inviter} invited you as {role}. {summary}', { inviter, role: tr(roleInfo[role].label), summary: tr(roleInfo[role].summary) }),
        <Button loading={state === 'joining'} onClick={() => void join()}>
          {tr('Join {workspace}', { workspace })}
        </Button>,
      );
  }
}
