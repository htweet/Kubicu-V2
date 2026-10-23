import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, CrownIcon, LayersIcon, MoreHorizontalIcon, RefreshCwIcon, ShieldIcon, Trash2Icon, UserPlusIcon, XIcon } from 'lucide-react';
import type { Member, Role } from '../../types/team';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useOps } from '../../contexts/OpsContext';
import { usePlan } from '../../contexts/PlanContext';
import { roleInfo, seatLimits } from '../../data/permissions';
import { planOrder } from '../../data/plans';
import { initials, inviteState } from '../../utils/team';
import { workspaceSpaces } from '../../utils/spaces';
import { formatRelative } from '../../utils/format';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { Menu } from '../ui/Menu';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { UpgradeButton } from '../ui/UpgradeButton';
import { InviteDialog } from './InviteDialog';
import { RolePicker } from './RolePicker';
import { SpaceAccessField } from './SpaceAccessField';
import { cn } from '../../utils/cn';

type Pending = {kind: 'role' | 'spaces' | 'remove' | 'transfer';member: Member;} | null;

/** Settings → Team: members, seats and invitations (D57, D59). */
export function TeamTab() {
  const team = useTeam();
  const commerce = useCommerce();
  const ops = useOps();
  const { current } = useWorkspace();
  const plan = usePlan();
  const [inviting, setInviting] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [roleDraft, setRoleDraft] = useState<Role>('editor');
  const [spacesDraft, setSpacesDraft] = useState<string[] | null>(null);
  const manage = team.can('team.manage');
  const transfer = team.can('ownership.transfer');
  const atLimit = team.seatsUsed >= team.seatLimit;
  const nextPlan = planOrder.find((p) => seatLimits[p] > team.seatLimit);
  const spaces = workspaceSpaces(current);
  const spaceNames = (ids: string[] | null) => ids === null ? 'Every space' : ids.length === 0 ? 'No spaces' : ids.map((id) => spaces.find((s) => s.id === id)?.name ?? 'Archived space').join(', ');
  const invites = team.data.invites.filter((i) => inviteState(i) === 'pending' || inviteState(i) === 'expired');
  const pausedNames = team.data.members.filter((m) => team.paused.has(m.id)).map((m) => m.name.split(' ')[0]);

  const open = (kind: NonNullable<Pending>['kind'], member: Member) => {
    setRoleDraft(member.role === 'owner' ? 'admin' : member.role);
    setSpacesDraft(member.spaceIds);
    setPending({ kind, member });
  };

  const confirm = () => {
    if (!pending) return;
    const m = pending.member;
    if (pending.kind === 'role') {
      team.changeRole(m.id, roleDraft);
      toast(`${m.name} is now ${roleInfo[roleDraft].label === 'Admin' || roleInfo[roleDraft].label === 'Editor' ? 'an' : 'a'} ${roleInfo[roleDraft].label}`);
    } else if (pending.kind === 'spaces') {
      team.setSpaces(m.id, spacesDraft);
      toast('Access updated');
    } else if (pending.kind === 'remove') {
      // Their open work moves to you (D60); finished work keeps their name.
      const to = team.me.id;
      let moved = 0;
      commerce.applySystem((d) => ({
        ...d,
        orders: d.orders.map((o) => o.assigneeId === m.id && !['completed', 'cancelled', 'refunded'].includes(o.status) ? (moved++, { ...o, assigneeId: to }) : o)
      }));
      ops.applySystem((d) => ({
        ...d,
        bookings: d.bookings.map((b) => b.assigneeId === m.id && (b.status === 'confirmed' || b.status === 'pending_deposit') ? (moved++, { ...b, assigneeId: to }) : b),
        contacts: d.contacts.map((c) => ({
          ...c,
          assigneeId: c.assigneeId === m.id ? (moved++, to) : c.assigneeId,
          tasks: c.tasks.map((t) => t.assigneeId === m.id && !t.done ? (moved++, { ...t, assigneeId: to }) : t)
        }))
      }));
      team.removeMember(m.id);
      toast(`${m.name} removed`, { description: `They lost access straight away.${moved ? ` ${moved} open item${moved === 1 ? '' : 's'} moved to you.` : ''} Their history stays in the activity log.` });
    } else {
      team.transferOwnership(m.id);
      toast(`${m.name} is now the Owner`, { description: 'You’re an Admin now.' });
    }
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-semibold text-fg">
            <span className="tabular-nums">{team.seatsUsed}</span> of {team.seatLimit} seat{team.seatLimit === 1 ? '' : 's'} on {plan.name}
          </p>
          <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <div className={cn('h-full rounded-full', atLimit ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.min(100, team.seatsUsed / team.seatLimit * 100)}%` }} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-caption text-fg-subtle">
            Pending invites use a seat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {atLimit && nextPlan && manage.allowed && <UpgradeButton plan={nextPlan} feature="More team seats" />}
          <Button leadingIcon={UserPlusIcon} disabled={!manage.allowed || atLimit} title={!manage.allowed ? manage.reason : atLimit ? 'No seats left' : undefined} onClick={() => setInviting(true)}>
            Invite people
          </Button>
        </div>
      </div>

      {!manage.allowed && <p className="text-caption text-fg-muted">{manage.reason}</p>}

      {pausedNames.length > 0 &&
      <InlineAlert tone="warning" title={`${pausedNames.join(', ')} ${pausedNames.length === 1 ? 'is' : 'are'} paused as Viewer${pausedNames.length === 1 ? '' : 's'}`} action={nextPlan ? <UpgradeButton plan={nextPlan} feature="More team seats" /> : undefined}>
          {plan.name} includes {team.seatLimit} seat{team.seatLimit === 1 ? '' : 's'}. Nobody is removed — they keep their account and can see everything, but can’t change anything until there’s room.
        </InlineAlert>
      }

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-label font-semibold text-fg">
          Members
        </h2>
        <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
          {team.data.members.map((m) => {
            const isPaused = team.paused.has(m.id);
            const isMe = m.id === team.me.id;
            const items = [
            { id: 'role', label: 'Change role', icon: ShieldIcon, disabled: m.role === 'owner' || !manage.allowed, reason: m.role === 'owner' ? 'Transfer ownership to change the Owner.' : manage.reason, onSelect: () => open('role', m) },
            { id: 'spaces', label: 'Spaces they can edit', icon: LayersIcon, disabled: m.role === 'owner' || m.role === 'admin' || !manage.allowed, reason: m.role === 'owner' || m.role === 'admin' ? 'Owners and Admins can always edit every space.' : manage.reason, onSelect: () => open('spaces', m) },
            { id: 'transfer', label: 'Make Owner', icon: CrownIcon, disabled: m.role === 'owner' || !transfer.allowed, reason: m.role === 'owner' ? 'Already the Owner.' : transfer.reason, onSelect: () => open('transfer', m) },
            { id: 'remove', label: 'Remove from workspace', icon: Trash2Icon, destructive: true, disabled: m.role === 'owner' || !manage.allowed || m.role === 'admin' && team.role !== 'owner', reason: m.role === 'owner' ? 'Transfer ownership first.' : m.role === 'admin' && team.role !== 'owner' ? 'Only the Owner can remove an Admin.' : manage.reason, onSelect: () => open('remove', m) }];

            return (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-soft text-label font-semibold text-action">
                  {initials(m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-medium text-fg">
                    <span className="truncate">{m.name}</span>
                    {isMe && <span className="text-caption font-normal text-fg-subtle">(you)</span>}
                    {m.sample && <Badge tone="neutral">Sample</Badge>}
                  </p>
                  <p className="truncate text-caption text-fg-subtle">
                    {[m.contact, m.role === 'owner' || m.role === 'admin' ? 'Every space' : spaceNames(m.spaceIds), m.lastActiveAt ? `Active ${formatRelative(m.lastActiveAt)}` : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={m.role === 'owner' ? 'accent' : isPaused ? 'warning' : 'neutral'}>{isPaused ? `${roleInfo[m.role].label} · paused` : roleInfo[m.role].label}</Badge>
                  <Menu align="end" items={items} trigger={(p) => <IconButton {...p} size="sm" icon={MoreHorizontalIcon} label={`Actions for ${m.name}`} />} />
                </div>
              </li>);

          })}
        </ul>
      </section>

      {invites.length > 0 &&
      <section aria-labelledby="invites-heading">
          <h2 id="invites-heading" className="text-label font-semibold text-fg">
            Invitations
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
            {invites.map((i) => {
            const state = inviteState(i);
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-medium text-fg">{i.contact}</p>
                    <p className="text-caption text-fg-subtle">
                      {roleInfo[i.role].label} · invited by {i.invitedBy} · {state === 'expired' ? 'expired' : `expires ${formatRelative(i.expiresAt)}`}
                    </p>
                  </div>
                  <Badge tone={state === 'expired' ? 'neutral' : 'info'}>{state === 'expired' ? 'Expired' : 'Pending'}</Badge>
                  {/* Phones: actions drop to their own row. */}
                  <div className="flex w-full flex-wrap gap-1 sm:w-auto">
                    <Button
                    size="sm"
                    variant="tertiary"
                    leadingIcon={CopyIcon}
                    onClick={() => {
                      void navigator.clipboard?.writeText(`${window.location.origin}/invite/${i.token}`);
                      toast('Invite link copied');
                    }}>
                    
                      Copy link
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} disabled={!manage.allowed} onClick={() => {team.resendInvite(i.id);toast('Invite resent', { description: 'Valid for another 7 days (prototype — nothing is sent).' });}}>
                      Resend
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={XIcon} disabled={!manage.allowed} onClick={() => {team.cancelInvite(i.id);toast('Invite cancelled', { description: 'The link no longer works.' });}}>
                      Cancel
                    </Button>
                  </div>
                </li>);

          })}
          </ul>
        </section>
      }

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />

      <Dialog
        open={!!pending}
        onClose={() => setPending(null)}
        size={pending?.kind === 'role' ? 'lg' : 'md'}
        title={
        !pending ? '' : pending.kind === 'role' ? `Change ${pending.member.name}’s role` : pending.kind === 'spaces' ? `Spaces ${pending.member.name} can edit` : pending.kind === 'remove' ? `Remove ${pending.member.name}?` : `Make ${pending.member.name} the Owner?`
        }
        description={
        pending?.kind === 'remove' ?
        'They lose access straight away. Anything assigned to them moves to you, and their history stays in the activity log.' :
        pending?.kind === 'transfer' ?
        'They get billing, the plan and the right to delete the workspace. You become an Admin. Only they can transfer it back.' :
        undefined
        }
        footer={
        <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant={pending?.kind === 'remove' ? 'destructive' : 'primary'} onClick={confirm}>
              {pending?.kind === 'remove' ? 'Remove' : pending?.kind === 'transfer' ? 'Transfer ownership' : 'Save'}
            </Button>
          </>
        }>
        
        {pending?.kind === 'role' && <RolePicker value={roleDraft} onChange={setRoleDraft} />}
        {pending?.kind === 'spaces' && <SpaceAccessField value={spacesDraft} onChange={setSpacesDraft} />}
      </Dialog>
    </div>);

}