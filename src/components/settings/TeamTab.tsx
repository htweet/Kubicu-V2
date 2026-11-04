import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { List } from '../ui/layout/ListRow';
import { RolePicker } from './RolePicker';
import { SpaceAccessField } from './SpaceAccessField';
import { BranchAccessField } from './BranchAccessField';
import { branchesOf, locationName } from '../../utils/commerce/branches';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

type Pending = {kind: 'role' | 'spaces' | 'remove' | 'transfer';member: Member;} | null;

/** Settings → Team: members, seats and invitations (D57, D59). */
export function TeamTab() {
  const { t: tr } = useT();
  const team = useTeam();
  const commerce = useCommerce();
  const ops = useOps();
  const { current } = useWorkspace();
  const plan = usePlan();
  const [inviting, setInviting] = useState(false);
  // Contacts suggested after linking a browser workspace (real sign-in, D-UI-2b). Never set otherwise.
  const suggested = ((useLocation().state as {suggestedInvites?: Array<{contact: string;role: Role;}>;} | null)?.suggestedInvites ?? []).filter(
    (s) => !team.data.members.some((m) => m.contact.toLowerCase() === s.contact.toLowerCase()) && !team.data.invites.some((i) => i.contact.toLowerCase() === s.contact.toLowerCase() && inviteState(i) === 'pending')
  );
  const [prefill, setPrefill] = useState<{contact: string;role: Role;} | undefined>(undefined);
  const [pending, setPending] = useState<Pending>(null);
  const [roleDraft, setRoleDraft] = useState<Role>('editor');
  const [spacesDraft, setSpacesDraft] = useState<string[] | null>(null);
  const [branchDraft, setBranchDraft] = useState<string | null>(null);
  const branchName = (id: string | null | undefined) => !id || !branchesOf(commerce.data).length ? null : locationName(commerce.data, id, tr('Main shop'));
  const manage = team.can('team.manage');
  const transfer = team.can('ownership.transfer');
  const atLimit = team.seatsUsed >= team.seatLimit;
  const nextPlan = planOrder.find((p) => seatLimits[p] > team.seatLimit);
  const spaces = workspaceSpaces(current);
  const spaceNames = (ids: string[] | null) => ids === null ? tr('Every space') : ids.length === 0 ? tr('No spaces') : ids.map((id) => spaces.find((s) => s.id === id)?.name ?? tr('Archived space')).join(', ');
  const invites = team.data.invites.filter((i) => inviteState(i) === 'pending' || inviteState(i) === 'expired');
  const pausedNames = team.data.members.filter((m) => team.paused.has(m.id)).map((m) => m.name.split(' ')[0]);

  const open = (kind: NonNullable<Pending>['kind'], member: Member) => {
    setRoleDraft(member.role === 'owner' ? 'admin' : member.role);
    setSpacesDraft(member.spaceIds);
    setBranchDraft(member.branchId ?? null);
    setPending({ kind, member });
  };

  const confirm = () => {
    if (!pending) return;
    const m = pending.member;
    if (pending.kind === 'role') {
      team.changeRole(m.id, roleDraft);
      toast(tr('{name}’s role is now {role}', { name: m.name, role: tr(roleInfo[roleDraft].label) }));
    } else if (pending.kind === 'spaces') {
      team.setSpaces(m.id, spacesDraft);
      if ((m.branchId ?? null) !== branchDraft) team.setBranch(m.id, branchDraft);
      toast(tr('Access updated'));
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
      toast(tr('{name} removed', { name: m.name }), { description: `${tr('They lost access straight away.')}${moved ? ` ${tr('Open items moved to you: {n}.', { n: moved })}` : ''} ${tr('Their history stays in the activity log.')}` });
    } else {
      team.transferOwnership(m.id);
      toast(tr('{name} is now the Owner', { name: m.name }), { description: tr('You’re an Admin now.') });
    }
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {suggested.length > 0 &&
      <InlineAlert tone="info" title="Suggested from your browser workspace">
          <span className="block">{tr('These people were on this team before. Invite the ones who should have access; nobody gets in until they accept.')}</span>
          <span className="mt-2 flex flex-col gap-1.5">
            {suggested.map((s) =>
          <span key={s.contact} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{s.contact}</span>
                <span>{tr(roleInfo[s.role]?.label ?? s.role)}</span>
                <button
              type="button"
              className="font-semibold underline underline-offset-2"
              onClick={() => {
                setPrefill({ contact: s.contact, role: s.role });
                setInviting(true);
              }}>
                  {tr('Invite')}
                </button>
              </span>
          )}
          </span>
        </InlineAlert>
      }
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-semibold text-fg">
            {tr('{used} of {limit} seats on {plan}', { used: team.seatsUsed, limit: team.seatLimit, plan: plan.name })}
          </p>
          <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <div className={cn('h-full rounded-full', atLimit ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.min(100, team.seatsUsed / team.seatLimit * 100)}%` }} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-caption text-fg-subtle">
            {tr('Pending invites use a seat.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {atLimit && nextPlan && manage.allowed && <UpgradeButton plan={nextPlan} feature="More team seats" />}
          <Button leadingIcon={UserPlusIcon} disabled={!manage.allowed || atLimit} title={!manage.allowed ? manage.reason : atLimit ? tr('No seats left') : undefined} onClick={() => setInviting(true)}>
            Invite people
          </Button>
        </div>
      </div>

      {!manage.allowed && <p className="text-caption text-fg-muted">{manage.reason}</p>}

      {pausedNames.length > 0 &&
      <InlineAlert tone="warning" title={tr('Paused as Viewers: {names}', { names: pausedNames.join(', ') })} action={nextPlan ? <UpgradeButton plan={nextPlan} feature="More team seats" /> : undefined}>
          {tr('{plan} includes {n} seats. Nobody is removed — they keep their account and can see everything, but can’t change anything until there’s room.', { plan: plan.name, n: team.seatLimit })}
        </InlineAlert>
      }

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-label font-semibold text-fg">
          {tr('Members')}
        </h2>
        <List ruled className="mt-3">
          {team.data.members.map((m) => {
            const isPaused = team.paused.has(m.id);
            const isMe = m.id === team.me.id;
            const items = [
            { id: 'role', label: 'Change role', icon: ShieldIcon, disabled: m.role === 'owner' || !manage.allowed, reason: m.role === 'owner' ? tr('Transfer ownership to change the Owner.') : manage.reason, onSelect: () => open('role', m) },
            { id: 'spaces', label: 'Spaces they can edit', icon: LayersIcon, disabled: m.role === 'owner' || m.role === 'admin' || !manage.allowed, reason: m.role === 'owner' || m.role === 'admin' ? tr('Owners and Admins can always edit every space.') : manage.reason, onSelect: () => open('spaces', m) },
            { id: 'transfer', label: 'Make Owner', icon: CrownIcon, disabled: m.role === 'owner' || !transfer.allowed, reason: m.role === 'owner' ? tr('Already the Owner.') : transfer.reason, onSelect: () => open('transfer', m) },
            { id: 'remove', label: 'Remove from workspace', icon: Trash2Icon, destructive: true, disabled: m.role === 'owner' || !manage.allowed || m.role === 'admin' && team.role !== 'owner', reason: m.role === 'owner' ? tr('Transfer ownership first.') : m.role === 'admin' && team.role !== 'owner' ? tr('Only the Owner can remove an Admin.') : manage.reason, onSelect: () => open('remove', m) }];

            return (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action-soft text-label font-semibold text-action">
                  {initials(m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-medium text-fg">
                    <span className="truncate">{m.name}</span>
                    {isMe && <span className="text-caption font-normal text-fg-subtle">({tr('you')})</span>}
                    {m.sample && <Badge tone="neutral">Sample</Badge>}
                  </p>
                  <p className="truncate text-caption text-fg-subtle">
                    {[m.contact, m.role === 'owner' || m.role === 'admin' ? tr('Every space') : spaceNames(m.spaceIds), m.role === 'owner' || m.role === 'admin' ? null : branchName(m.branchId), m.lastActiveAt ? tr('Active {when}', { when: formatRelative(m.lastActiveAt) }) : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={m.role === 'owner' ? 'accent' : isPaused ? 'warning' : 'neutral'}>{isPaused ? `${tr(roleInfo[m.role].label)} · ${tr('paused')}` : roleInfo[m.role].label}</Badge>
                  <Menu align="end" items={items} trigger={(p) => <IconButton {...p} size="sm" icon={MoreHorizontalIcon} label={tr('Actions for {name}', { name: m.name })} />} />
                </div>
              </li>);

          })}
        </List>
      </section>

      {invites.length > 0 &&
      <section aria-labelledby="invites-heading">
          <h2 id="invites-heading" className="text-label font-semibold text-fg">
            {tr('Invitations')}
          </h2>
          <List ruled className="mt-3">
            {invites.map((i) => {
            const state = inviteState(i);
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-medium text-fg">{i.contact}</p>
                    <p className="text-caption text-fg-subtle">
                      {tr(roleInfo[i.role].label)} · {tr('invited by {name}', { name: i.invitedBy })} · {state === 'expired' ? tr('expired') : tr('expires {when}', { when: formatRelative(i.expiresAt) })}
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
                      toast(tr('Invite link copied'));
                    }}>
                    
                      Copy link
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} disabled={!manage.allowed} onClick={() => {team.resendInvite(i.id);toast(tr('Invite resent'), { description: tr('Valid for another 7 days (prototype — nothing is sent).') });}}>
                      Resend
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={XIcon} disabled={!manage.allowed} onClick={() => {team.cancelInvite(i.id);toast(tr('Invite cancelled'), { description: tr('The link no longer works.') });}}>
                      Cancel
                    </Button>
                  </div>
                </li>);

          })}
          </List>
        </section>
      }

      <InviteDialog
        open={inviting}
        prefill={prefill}
        onClose={() => {
          setInviting(false);
          setPrefill(undefined);
        }} />

      <Dialog
        open={!!pending}
        onClose={() => setPending(null)}
        size={pending?.kind === 'role' ? 'lg' : 'md'}
        title={
        !pending ? '' : tr(pending.kind === 'role' ? 'Change {name}’s role' : pending.kind === 'spaces' ? 'Spaces {name} can edit' : pending.kind === 'remove' ? 'Remove {name}?' : 'Make {name} the Owner?', { name: pending.member.name })
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
        {pending?.kind === 'spaces' &&
        <div className="flex flex-col gap-5">
            <SpaceAccessField value={spacesDraft} onChange={setSpacesDraft} />
            <BranchAccessField id="member-branch" value={branchDraft} onChange={setBranchDraft} />
          </div>
        }
      </Dialog>
    </div>);

}