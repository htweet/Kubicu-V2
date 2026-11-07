import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, ClockIcon, MailXIcon, UserCheckIcon } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTeam } from '../contexts/TeamContext';
import { roleInfo, rolePermissions, permissionRows } from '../data/permissions';
import { inviteState, readTeam } from '../utils/team';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { useAccountMode } from '../contexts/AccountModeContext';
import { AcceptInviteAccount } from '../components/accountMode/AcceptInviteAccount';

/** /invite/:token — account mode uses the server-backed version (D534); browser mode is unchanged. */
export function AcceptInvite() {
  const { token = '' } = useParams();
  const account = useAccountMode();
  return account.active ? <AcceptInviteAccount token={token} /> : <AcceptInviteBrowser />;
}

/** Accept a team invite (simulated sign-in). Expired, cancelled and used links each explain themselves. */
function AcceptInviteBrowser() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { workspaces, current, switchTo } = useWorkspace();
  const team = useTeam();
  const [name, setName] = useState('');
  const [tried, setTried] = useState(false);

  // Find the invite in any workspace on this device.
  const found = useMemo(() => {
    for (const w of workspaces) {
      const t = w.id === current.id ? team.data : readTeam(w.id);
      const inv = t?.invites.find((i) => i.token === token);
      if (inv) return { workspace: w, invite: inv };
    }
    return null;
  }, [workspaces, current.id, team.data, token]);

  const state = found ? inviteState(found.invite) : null;

  const accept = () => {
    setTried(true);
    if (!found || !name.trim()) return;
    if (found.workspace.id !== current.id) {
      switchTo(found.workspace.id);
      toast('Switched workspace — open the link again to accept', { description: 'Prototype: invites are accepted from the workspace that sent them.' });
      return;
    }
    const m = team.acceptInvite(token, name);
    if (!m) return;
    toast.success(`Welcome to ${found.workspace.name}`, { description: `${m.name} joined as ${roleInfo[m.role].label}. Prototype: you’re still using the app as before — pick “Viewing as” in the Controls panel to try their role.` });
    navigate('/app/settings');
  };

  const shell = (icon: React.ReactNode, title: string, body: string, action?: React.ReactNode) => (
    <AuthLayout title={title} description={body}>
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-fg-muted">{icon}</span>
        {action}
      </div>
    </AuthLayout>
  );

  if (!found) return shell(<MailXIcon size={20} aria-hidden />, 'This invite link doesn’t work', 'It may be incomplete or from another device. Ask the person who invited you to send a new one.', <Link to="/" className="text-label font-medium text-fg underline underline-offset-2">Go to KUBICU</Link>);
  if (state === 'expired') return shell(<ClockIcon size={20} aria-hidden />, 'This invite has expired', `Invites last 7 days. Ask ${found.invite.invitedBy} to resend it from ${found.workspace.name}’s team settings.`);
  if (state === 'cancelled') return shell(<MailXIcon size={20} aria-hidden />, 'This invite was cancelled', `${found.invite.invitedBy} cancelled it. If that’s a mistake, ask them to invite you again.`);
  if (state === 'accepted') return shell(<UserCheckIcon size={20} aria-hidden />, 'You’ve already joined', `This invite has been used. Sign in to open ${found.workspace.name}.`, <Button onClick={() => navigate('/signin')}>Sign in</Button>);

  const r = found.invite.role;
  const allowed = permissionRows.filter((p) => rolePermissions[r].has(p.id)).slice(0, 6);

  return (
    <AuthLayout title={`${found.invite.invitedBy} invited you to ${found.workspace.name}`} description={`As ${r === 'admin' || r === 'editor' ? 'an' : 'a'} ${roleInfo[r].label}. ${roleInfo[r].summary}`}>
      <div className="flex flex-col gap-6">
        {allowed.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {allowed.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-label text-fg">
                <CheckIcon size={15} className="text-success" aria-hidden /> {p.label}
              </li>
            ))}
          </ul>
        )}
        <TextInput id="invite-name" label="Your name" value={name} autoComplete="name" error={tried && !name.trim() ? 'Enter your name.' : undefined} onChange={(e) => setName(e.target.value)} />
        <Button fullWidth onClick={accept}>
          Join {found.workspace.name}
        </Button>
        <p className="text-caption text-fg-subtle">Prototype: joining doesn’t create a real account. Invited as {found.invite.contact}.</p>
      </div>
    </AuthLayout>
  );
}
