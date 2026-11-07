import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CrownIcon, LayersIcon, Loader2Icon, LogOutIcon, MailIcon, MoreHorizontalIcon, RefreshCwIcon, ShieldIcon, Trash2Icon, UserPlusIcon, XIcon } from 'lucide-react';
import type { Role } from '../../types/team';
import type { AccountInvite, AccountMember } from '../../types/accountMode';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useT } from '../../contexts/LocaleContext';
import { roleInfo } from '../../data/permissions';
import { accountSeats, SAMPLE_OWNED_WORKSPACE_LIMIT } from '../../data/accountModeSamples';
import { initials } from '../../utils/team';
import { workspaceSpaces } from '../../utils/spaces';
import { formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { Menu } from '../ui/Menu';
import { Dialog } from '../ui/Dialog';
import { EmptyState } from '../ui/EmptyState';
import { List } from '../ui/layout/ListRow';
import { RolePicker } from '../settings/RolePicker';
import { SpaceAccessField } from '../settings/SpaceAccessField';
import { BranchAccessField } from '../settings/BranchAccessField';
import { AccountStateAlert, toastFailure } from '../account/AccountStates';
import { InviteDialogAccount } from './InviteDialogAccount';
import { TeamPoliciesSection } from './TeamPoliciesSection';
import { useTeamAccount, type RowStatus } from './useTeamAccount';

type Pending = { kind: 'role' | 'spaces' | 'remove' | 'transfer'; member: AccountMember } | { kind: 'leave' } | { kind: 'cancelInvite'; invite: AccountInvite; reinvite: boolean } | null;

/** Settings → Team in account mode (D532–D535). Same layout as the browser Team tab; data comes from the server. */
export function TeamTabAccount() {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const team = useTeam();
  const plan = usePlan();
  const { current } = useWorkspace();
  const s = useTeamAccount();
  const [inviting, setInviting] = useState<{ contact: string } | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [working, setWorking] = useState(false);
  const [roleDraft, setRoleDraft] = useState<Role>('editor');
  const [spacesDraft, setSpacesDraft] = useState<string[] | null>(null);
  const [branchDraft, setBranchDraft] = useState<string | null>(null);

  const me = s.members.find((m) => m.id === s.meId);
  const myRole: Role = me?.role ?? team.role;
  const manage = team.can('team.manage');
  const canTransfer = team.can('ownership.transfer').allowed && myRole === 'owner';
  const seatLimit = accountSeats[plan.id];
  const seatsUsed = s.members.length + s.invites.length;
  const atLimit = seatsUsed >= seatLimit;
  const spaces = workspaceSpaces(current);
  const spaceNames = (ids: string[] | null) => (ids === null ? tr('Every space') : ids.length === 0 ? tr('No spaces') : ids.map((id) => spaces.find((x) => x.id === id)?.name ?? tr('Archived space')).join(', '));
  const daysLeft = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400000));

  if (s.screenFailure) {
    return <AccountStateAlert failure={s.screenFailure} />;
  }
  if (s.status === 'loading') {
    return (
      <p className="flex items-center gap-2 py-10 text-label text-fg-muted" role="status">
        <Loader2Icon size={16} className="animate-spin" aria-hidden />
        {tr('Loading your team…')}
      </p>
    );
  }
  if (s.status === 'error' && s.loadFailure) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-label font-semibold text-fg">{tr('Couldn’t load your team')}</p>
        <AccountStateAlert failure={s.loadFailure} onRetry={() => void s.reload()} />
      </div>
    );
  }

  const open = (kind: 'role' | 'spaces' | 'remove' | 'transfer', member: AccountMember) => {
    setRoleDraft(member.role === 'owner' ? 'admin' : member.role);
    setSpacesDraft(member.spaceIds);
    setBranchDraft(member.branchId);
    setPending({ kind, member });
  };

  const confirm = async () => {
    if (!pending) return;
    setWorking(true);
    if (pending.kind === 'leave') {
      const f = await s.leave();
      setWorking(false);
      if (!f) {
        setPending(null);
        toast(tr('You left {workspace}', { workspace: current.name }), { description: tr('It’s no longer in your list of workspaces.') });
        navigate('/app/account/workspaces');
      } else {
        setPending(null);
        toastFailure(tr, f);
      }
      return;
    }
    if (pending.kind === 'cancelInvite') {
      const { invite, reinvite } = pending;
      const f = await s.cancelInvite(invite);
      setWorking(false);
      setPending(null);
      if (!f) {
        toast(tr('Invite cancelled'), { description: tr('The link no longer works.') });
        if (reinvite) setInviting({ contact: invite.contact });
      } else if (f.code === 'conflict') {
        toast(tr('That invite was already used or cancelled'));
      } else {
        toastFailure(tr, f);
      }
      return;
    }
    const m = pending.member;
    const outcome =
      pending.kind === 'role' ? await s.changeRole(m, roleDraft) : pending.kind === 'spaces' ? await s.changeAccess(m, spacesDraft, branchDraft) : pending.kind === 'remove' ? await s.remove(m) : await s.transfer(m, SAMPLE_OWNED_WORKSPACE_LIMIT);
    setWorking(false);
    // Cancelled "Confirm it's you": nothing changed and this dialog stays open.
    if (outcome === 'cancelled') return;
    setPending(null);
    if (outcome !== 'done') return;
    if (pending.kind === 'role') toast(tr('{name}’s role is now {role}', { name: m.name, role: tr(roleInfo[roleDraft].label) }));
    else if (pending.kind === 'spaces') toast(tr('Access updated'));
    else if (pending.kind === 'remove') toast(tr('{name} removed', { name: m.name }), { description: tr('They lost access straight away. Their history stays in the activity log.') });
    else toast(tr('{name} is now the Owner', { name: m.name }), { description: tr('You’re an Admin now.') });
  };

  const rowNote = (id: string, st: RowStatus | undefined) => {
    if (!st) return null;
    if (st.kind === 'saving')
      return (
        <span className="flex items-center gap-1 text-caption text-fg-subtle" role="status">
          <Loader2Icon size={12} className="animate-spin" aria-hidden />
          {tr('Saving…')}
        </span>
      );
    if (st.kind === 'saved')
      return (
        <span className="text-caption text-success" role="status">
          {tr('Saved')}
        </span>
      );
    return (
      <span className="flex flex-wrap items-center gap-2 text-caption text-danger" role="alert">
        {st.kind === 'gone' ? tr('This person is no longer in the team.') : st.text}
        <button type="button" className="font-medium text-fg underline underline-offset-2" onClick={() => (st.kind === 'gone' ? s.dismissRow(id) : s.clearRow(id))}>
          {st.kind === 'gone' ? tr('Update list') : tr('Dismiss')}
        </button>
      </span>
    );
  };

  const dialogTitle = !pending
    ? ''
    : pending.kind === 'leave'
      ? tr('Leave {workspace}?', { workspace: current.name })
      : pending.kind === 'cancelInvite'
        ? tr('Cancel the invite for {contact}?', { contact: pending.invite.contact })
        : tr(pending.kind === 'role' ? 'Change {name}’s role' : pending.kind === 'spaces' ? 'Spaces {name} can edit' : pending.kind === 'remove' ? 'Remove {name}?' : 'Make {name} the Owner?', { name: pending.member.name });

  const dialogDescription = !pending
    ? undefined
    : pending.kind === 'leave'
      ? tr('You lose access straight away. To come back, someone has to invite you again.')
      : pending.kind === 'cancelInvite'
        ? pending.reinvite
          ? tr('The old link stops working, then you can create a new invite for them.')
          : tr('The link stops working and the seat is freed.')
        : pending.kind === 'remove'
          ? tr('They lose access straight away. Their history stays in the activity log. You’ll be asked to confirm it’s you.')
          : pending.kind === 'transfer'
            ? tr('You’ll become an Admin. {name} will be the Owner and the only person who can transfer it again. You’ll be asked to confirm it’s you.', { name: pending.member.name })
            : tr('You’ll be asked to confirm it’s you.');

  const confirmLabel = !pending ? '' : pending.kind === 'leave' ? tr('Leave workspace') : pending.kind === 'cancelInvite' ? tr('Cancel invite') : pending.kind === 'remove' ? tr('Remove') : pending.kind === 'transfer' ? (working ? tr('Transferring…') : tr('Transfer ownership')) : tr('Save');
  const destructive = pending?.kind === 'remove' || pending?.kind === 'leave' || pending?.kind === 'cancelInvite';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-semibold text-fg">{tr('{used} of {limit} seats on {plan}', { used: seatsUsed, limit: seatLimit, plan: plan.name })}</p>
          <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <div className={cn('h-full rounded-full', atLimit ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.min(100, (seatsUsed / seatLimit) * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-caption text-fg-subtle">{tr('Pending invites use a seat.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {myRole !== 'owner' && (
            <Button variant="tertiary" leadingIcon={LogOutIcon} onClick={() => setPending({ kind: 'leave' })}>
              {tr('Leave workspace')}
            </Button>
          )}
          <Button leadingIcon={UserPlusIcon} disabled={!manage.allowed} title={!manage.allowed ? manage.reason : undefined} onClick={() => setInviting({ contact: '' })}>
            {tr('Invite people')}
          </Button>
        </div>
      </div>

      {!manage.allowed && <p className="text-caption text-fg-muted">{manage.reason}</p>}

      <section aria-labelledby="acc-members-heading">
        <h2 id="acc-members-heading" className="text-label font-semibold text-fg">
          {tr('Members')}
        </h2>
        <List ruled className="mt-3">
          {s.members.map((m) => {
            const isMe = m.id === s.meId;
            const st = s.rows[m.id];
            const busy = st?.kind === 'saving';
            const items = [
              { id: 'role', label: 'Change role', icon: ShieldIcon, disabled: busy || m.role === 'owner' || !manage.allowed, reason: m.role === 'owner' ? tr('The Owner’s role changes only through ownership transfer.') : manage.reason, onSelect: () => open('role', m) },
              { id: 'spaces', label: 'Spaces they can edit', icon: LayersIcon, disabled: busy || m.role === 'owner' || m.role === 'admin' || !manage.allowed, reason: m.role === 'owner' || m.role === 'admin' ? tr('Owners and Admins can always edit every space.') : manage.reason, onSelect: () => open('spaces', m) },
              { id: 'transfer', label: 'Make Owner', icon: CrownIcon, disabled: busy || m.role === 'owner' || !canTransfer, reason: m.role === 'owner' ? tr('Already the Owner.') : tr('Only the Owner can transfer ownership.'), onSelect: () => open('transfer', m) },
              { id: 'remove', label: 'Remove from workspace', icon: Trash2Icon, destructive: true, disabled: busy || m.role === 'owner' || isMe || !manage.allowed, reason: m.role === 'owner' ? tr('The Owner cannot be removed. Transfer ownership first.') : isMe ? tr('Use Leave workspace instead.') : manage.reason, onSelect: () => open('remove', m) },
            ];
            return (
              <li key={m.id} className={cn('flex flex-col gap-1 py-3', st?.kind === 'gone' && 'opacity-60')}>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-soft text-label font-semibold text-action">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-medium text-fg">
                      <span className="truncate">{m.name}</span>
                      {isMe && <span className="text-caption font-normal text-fg-subtle">({tr('you')})</span>}
                    </p>
                    <p className="truncate text-caption text-fg-subtle">
                      {[m.contact, m.role === 'owner' || m.role === 'admin' ? tr('Every space') : spaceNames(m.spaceIds), tr('Joined {date}', { date: formatTimestamp(m.joinedAt) })].join(' · ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={m.role === 'owner' ? 'accent' : 'neutral'}>{roleInfo[m.role].label}</Badge>
                    <Menu align="end" items={items} trigger={(p) => <IconButton {...p} size="sm" icon={MoreHorizontalIcon} label={tr('Actions for {name}', { name: m.name })} />} />
                  </div>
                </div>
                {st && <div className="pl-[52px]">{rowNote(m.id, st)}</div>}
              </li>
            );
          })}
        </List>
      </section>

      <section aria-labelledby="acc-invites-heading">
        <h2 id="acc-invites-heading" className="text-label font-semibold text-fg">
          {tr('Invitations')}
        </h2>
        {s.invites.length === 0 ? (
          <EmptyState icon={MailIcon} title={tr('No pending invites')} description={tr('Invites you create show here until they’re accepted, cancelled or expire.')} />
        ) : (
          <List ruled className="mt-3">
            {s.invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label font-medium text-fg">{i.contact}</p>
                  <p className="text-caption text-fg-subtle">
                    {tr(roleInfo[i.role].label)} · {tr('expires in {n} days', { n: daysLeft(i.expiresAt) })}
                  </p>
                </div>
                <Badge tone="info">{tr('Pending')}</Badge>
                <div className="flex w-full flex-wrap gap-1 sm:w-auto">
                  <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} disabled={!manage.allowed} onClick={() => setPending({ kind: 'cancelInvite', invite: i, reinvite: true })}>
                    {tr('Cancel and invite again')}
                  </Button>
                  <Button size="sm" variant="tertiary" leadingIcon={XIcon} disabled={!manage.allowed} onClick={() => setPending({ kind: 'cancelInvite', invite: i, reinvite: false })}>
                    {tr('Cancel invite')}
                  </Button>
                </div>
              </li>
            ))}
          </List>
        )}
      </section>

      <TeamPoliciesSection onScreenFailure={s.setScreenFailure} />

      <InviteDialogAccount
        open={!!inviting}
        initialContact={inviting?.contact ?? ''}
        onClose={() => setInviting(null)}
        onCreated={s.addInvite}
        existingContacts={[...s.members.map((m) => m.contact.toLowerCase()), ...s.invites.map((i) => i.contact.toLowerCase())]}
        seatLimit={seatLimit}
        planName={plan.name}
        onScreenFailure={s.setScreenFailure}
      />

      <Dialog
        open={!!pending}
        onClose={() => !working && setPending(null)}
        size={pending?.kind === 'role' ? 'lg' : 'md'}
        title={dialogTitle}
        description={dialogDescription}
        footer={
          <>
            <Button variant="secondary" disabled={working} onClick={() => setPending(null)}>
              {pending?.kind === 'cancelInvite' ? tr('Keep invite') : tr('Cancel')}
            </Button>
            <Button variant={destructive ? 'destructive' : 'primary'} loading={working} onClick={() => void confirm()}>
              {confirmLabel}
            </Button>
          </>
        }
      >
        {pending?.kind === 'role' && <RolePicker value={roleDraft} onChange={setRoleDraft} />}
        {pending?.kind === 'spaces' && (
          <div className="flex flex-col gap-5">
            <SpaceAccessField value={spacesDraft} onChange={setSpacesDraft} />
            <BranchAccessField id="acc-member-branch" value={branchDraft} onChange={setBranchDraft} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
