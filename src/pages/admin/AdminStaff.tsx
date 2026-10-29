import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, KeyRoundIcon, MoreHorizontalIcon, PowerIcon, UserCogIcon, UserPlusIcon, XIcon } from 'lucide-react';

const approvalStatusLabels: Record<PendingApproval['status'], string> = { pending: 'Waiting', approved: 'Approved', rejected: 'Rejected', withdrawn: 'Withdrawn', expired: 'Expired' };
import type { PendingApproval, StaffMember, StaffRole } from '../../types/admin';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { APPROVAL_HOURS, STAFF_KINDS, applyApproval, approvalSummary, effectiveStatus } from '../../utils/admin/approvals';
import { AccessReviewSection } from '../../components/admin/AccessReviewSection';
import { useStaffSession } from '../../hooks/useStaffSession';
import { adminNavItems } from '../../data/adminNavigation';
import { roleInfo, staffRoles } from '../../data/staffRoles';
import { formatRelative } from '../../utils/format';
import { uid } from '../../utils/id';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Menu } from '../../components/ui/Menu';
import { IconButton } from '../../components/ui/IconButton';
import { TextInput } from '../../components/ui/TextInput';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ReasonDialog } from '../../components/admin/ReasonDialog';
import { Section } from '../../components/ui/layout/Section';
import { List } from '../../components/ui/layout/ListRow';

type Action = {kind: 'invite';} | {kind: 'role' | 'reset' | 'disable' | 'enable' | 'cancel';member: StaffMember;} | null;

const roleOptions = staffRoles.map((r) => ({ value: r.id, label: r.label }));
const isEmail = (v: string) => /^[^\s@]+@kubicu\.com$/i.test(v.trim());

/** Super admin → Staff & access: accounts, least-privilege roles and two-step sign-in (D83). Platform leads only. */
export function AdminStaff() {
  const [store, setStore] = useAdminStore();
  const me = useStaffSession();
  const [action, setAction] = useState<Action>(null);
  const [role, setRole] = useState<StaffRole>('support');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const staff = store.staff;
  const active = staff.filter((m) => m.status === 'active');
  const activeLeads = active.filter((m) => m.role === 'lead');
  const withTwoStep = active.filter((m) => m.twoStep).length;
  const invited = staff.filter((m) => m.status === 'invited').length;

  const isLastLead = (m: StaffMember) => m.role === 'lead' && m.status === 'active' && activeLeads.length <= 1;
  const staffApprovals = store.approvals.filter((a) => STAFF_KINDS.includes(a.kind));
  const pending = staffApprovals.filter((a) => effectiveStatus(a) === 'pending');
  const recentDecided = staffApprovals.filter((a) => effectiveStatus(a) !== 'pending').slice(0, 5);
  const waitingFor = (m: StaffMember) => pending.some((a) => a.targetId === m.id);
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);

  const approve = (a: PendingApproval) => {
    let error: string | undefined;
    setStore((s) => {
      const r = applyApproval(s, a, staffActor(s));
      error = r.error;
      return r.store;
    });
    if (error) toast.error('Couldn’t approve', { description: error });else
    toast.success('Approved and applied', { description: a.summary });
  };
  const reject = (note: string) => {
    if (!rejecting) return;
    const a = rejecting;
    setStore((s) => audit({ ...s, approvals: s.approvals.map((x) => x.id === a.id ? { ...x, status: 'rejected', decidedBy: staffActor(s), decidedAt: new Date().toISOString(), decisionNote: note } : x) }, { area: 'approvals', action: `Rejected: ${a.summary}`, target: a.targetEmail, reason: note }));
    toast('Request rejected', { description: 'Nothing was changed. The requester sees your note.' });
    setRejecting(null);
  };
  const withdraw = (a: PendingApproval) => {
    setStore((s) => audit({ ...s, approvals: s.approvals.map((x) => x.id === a.id ? { ...x, status: 'withdrawn', decidedBy: staffActor(s), decidedAt: new Date().toISOString() } : x) }, { area: 'approvals', action: `Withdrew: ${a.summary}`, target: a.targetEmail, reason: 'Withdrawn by the requester.' }));
    toast('Request withdrawn');
  };

  const openInvite = () => {
    setName('');
    setEmail('');
    setRole('support');
    setInviteError('');
    setAction({ kind: 'invite' });
  };

  const confirm = (reason: string) => {
    if (!action) return;
    if (action.kind === 'invite') {
      if (!name.trim() || !isEmail(email)) return setInviteError('Add their name and a @kub.icu email.');
      if (staff.some((m) => m.email.toLowerCase() === email.trim().toLowerCase())) return setInviteError('That email already has a staff account.');
      const m: StaffMember = { id: uid('stf'), name: name.trim(), email: email.trim().toLowerCase(), role, status: 'invited', twoStep: false, lastActiveAt: null, invitedAt: new Date().toISOString() };
      setStore((s) => audit({ ...s, staff: [...s.staff, m] }, { area: 'staff', action: `Invited as ${roleInfo(role).label}`, target: m.email, reason }));
      toast.success('Invitation created', { description: 'They set up two-step sign-in the first time they sign in. Nothing is emailed in the prototype.' });
      setAction(null);
      return;
    }
    const m = action.member;
    const patch = (p: Partial<StaffMember>) => (s: typeof store) => ({ ...s, staff: s.staff.map((x) => x.id === m.id ? { ...x, ...p } : x) });
    // Role changes, disabling and two-step resets on active accounts need a second Platform lead (D129).
    if ((action.kind === 'role' || action.kind === 'reset' || action.kind === 'disable') && m.status === 'active') {
      if (action.kind === 'role' && role === m.role) return setAction(null);
      const kind = action.kind === 'role' ? 'staff_role' : action.kind === 'reset' ? 'staff_reset' : 'staff_disable';
      const now = new Date();
      const request: PendingApproval = {
        id: uid('apr'),
        kind,
        summary: approvalSummary(kind, m, action.kind === 'role' ? role : undefined),
        targetId: m.id,
        targetEmail: m.email,
        role: action.kind === 'role' ? role : undefined,
        reason,
        requestedById: me?.id ?? '',
        requestedBy: staffActor(store),
        requestedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + APPROVAL_HOURS * 3600000).toISOString(),
        status: 'pending',
        decidedBy: null,
        decidedAt: null,
        decisionNote: null
      };
      setStore((s) => audit({ ...s, approvals: [request, ...s.approvals] }, { area: 'approvals', action: `Requested: ${request.summary}`, target: m.email, reason }));
      toast.success('Sent for a second approval', { description: `Another Platform lead must approve within ${APPROVAL_HOURS} hours. Nothing changes until then.` });
      setAction(null);
      return;
    }
    if (action.kind === 'role') {
      if (role === m.role) return setAction(null);
      setStore((s) => audit(patch({ role })(s), { area: 'staff', action: `Changed role: ${roleInfo(m.role).label} → ${roleInfo(role).label}`, target: m.email, reason }));
      toast.success(`${m.name.split(' ')[0]} will join as ${roleInfo(role).label}`);
    } else if (action.kind === 'enable') {
      setStore((s) => audit(patch({ status: m.twoStep ? 'active' : 'invited' })(s), { area: 'staff', action: 'Turned staff account back on', target: m.email, reason }));
      toast.success('Account turned back on');
    } else if (action.kind === 'cancel') {
      setStore((s) => audit({ ...s, staff: s.staff.filter((x) => x.id !== m.id) }, { area: 'staff', action: 'Cancelled invitation', target: m.email, reason }));
      toast.success('Invitation cancelled');
    }
    setAction(null);
  };

  const statusBadge = (m: StaffMember) =>
  m.status === 'disabled' ?
  <Badge>Disabled</Badge> :
  m.status === 'invited' ?
  <Badge tone="info" dot>
        Invited
      </Badge> :
  m.twoStep ?
  <Badge tone="success" dot>
        Active · two-step on
      </Badge> :

  <Badge tone="warning" dot>
        Two-step needed
      </Badge>;


  const columns: DataColumn<StaffMember>[] = [
  {
    key: 'who',
    header: 'Staff member',
    sortValue: (m) => m.name,
    render: (m) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">
            {m.name}
            {m.id === me?.id && <span className="font-normal text-fg-subtle"> (you)</span>}
          </span>
          <span className="block truncate text-caption text-fg-subtle">{m.email}</span>
        </span>

  },
  { key: 'role', header: 'Role', sortValue: (m) => roleInfo(m.role).label, render: (m) => <span className="text-fg">{roleInfo(m.role).label}</span> },
  { key: 'status', header: 'Status', render: statusBadge },
  {
    key: 'active',
    header: 'Last active',
    hideOnMobile: true,
    sortValue: (m) => m.lastActiveAt ? Date.parse(m.lastActiveAt) : 0,
    render: (m) => <span className="text-fg-muted">{m.lastActiveAt ? formatRelative(m.lastActiveAt) : `Invited ${formatRelative(m.invitedAt)}`}</span>
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (m) => {
      const self = m.id === me?.id;
      const lastLead = isLastLead(m);
      const guard = self ? 'You can’t change your own access' : lastLead ? 'Keep at least one active Platform lead' : waitingFor(m) ? 'A change is already waiting for approval' : undefined;
      return (
        <Menu
          items={
          m.status === 'invited' ?
          [
          { id: 'role', label: 'Change role…', icon: UserCogIcon, onSelect: () => (setRole(m.role), setAction({ kind: 'role', member: m })) },
          { id: 'cancel', label: 'Cancel invitation…', icon: XIcon, destructive: true, onSelect: () => setAction({ kind: 'cancel', member: m }) }] :

          m.status === 'disabled' ?
          [{ id: 'enable', label: 'Turn back on…', icon: PowerIcon, onSelect: () => setAction({ kind: 'enable', member: m }) }] :
          [
          { id: 'role', label: 'Change role…', icon: UserCogIcon, disabled: !!guard, reason: guard, onSelect: () => (setRole(m.role), setAction({ kind: 'role', member: m })) },
          { id: 'reset', label: 'Reset two-step…', icon: KeyRoundIcon, disabled: self || waitingFor(m), reason: self ? 'Ask another Platform lead' : waitingFor(m) ? 'A change is already waiting for approval' : undefined, onSelect: () => setAction({ kind: 'reset', member: m }) },
          { id: 'disable', label: 'Disable account…', icon: PowerIcon, destructive: true, disabled: !!guard, reason: guard, onSelect: () => setAction({ kind: 'disable', member: m }) }]

          }
          trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`Actions for ${m.name}`} />} />);


    }
  }];


  const dialog = (() => {
    if (!action) return { title: '', description: '', confirmLabel: '' };
    if (action.kind === 'invite') return { title: 'Invite a staff member', description: 'Pick the smallest role that covers their job. They must set up two-step sign-in before they can do anything.', confirmLabel: 'Create invitation' };
    const first = action.member.name.split(' ')[0];
    switch (action.kind) {
      case 'role':
        return action.member.status === 'active' ?
        { title: `Change ${first}’s role`, description: `Another Platform lead must approve this within ${APPROVAL_HOURS} hours. The new role applies once they do.`, confirmLabel: 'Send for approval' } :
        { title: `Change ${first}’s role`, description: 'They haven’t signed in yet, so this applies straight away.', confirmLabel: 'Change role' };
      case 'reset':
        return { title: `Reset ${first}’s two-step sign-in?`, description: `Use this when they lose their phone and backup codes. Another Platform lead must approve. Once approved they’re locked out until they set it up again.`, confirmLabel: 'Send for approval' };
      case 'disable':
        return { title: `Disable ${first}’s account?`, description: `Another Platform lead must approve. Once approved they’re signed out straight away; their audit history stays.`, confirmLabel: 'Send for approval' };
      case 'enable':
        return { title: `Turn ${first}’s account back on?`, description: 'They can sign in again with their password and two-step code.', confirmLabel: 'Turn on' };
      case 'cancel':
        return { title: `Cancel ${first}’s invitation?`, description: 'The invitation stops working.', confirmLabel: 'Cancel invitation' };
    }
  })();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Staff & access"
        description="Who at KUBICU can open the staff console, what each role can reach, and two-step sign-in. Only Platform leads see this screen."
        actions={
        <Button leadingIcon={UserPlusIcon} onClick={openInvite}>
            Invite staff
          </Button>
        } />
      

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Active staff" value={active.length} hint={`${activeLeads.length} Platform lead${activeLeads.length === 1 ? '' : 's'}`} />
        <Stat label="Two-step on" value={`${withTwoStep} of ${active.length}`} hint="Required for everyone" />
        <Stat label="Invitations waiting" value={invited} />
      </StatGroup>

      {pending.length > 0 &&
      <section aria-labelledby="approvals-heading" className="mt-8 rounded-lg border border-warning/40 bg-warning-soft">
          <header className="px-5 pb-3 pt-4 md:px-6">
            <h2 id="approvals-heading" className="text-heading font-semibold text-fg">
              Waiting for a second Platform lead · {pending.length}
            </h2>
            <p className="mt-0.5 text-caption text-fg-muted">High-risk access changes need two people. Whoever asked can’t approve their own request.</p>
          </header>
          <ul className="divide-y divide-line border-t border-line bg-raised">
            {pending.map((a) => {
            const mine = a.requestedById === me?.id;
            return (
              <li key={a.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:gap-6 md:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-label font-semibold text-fg">{a.summary}</p>
                    <p className="mt-0.5 text-caption text-fg-subtle">
                      Asked by {a.requestedBy} · {formatRelative(a.requestedAt)} · expires {formatRelative(a.expiresAt)}
                    </p>
                    <p className="mt-2 text-label text-fg-muted">“{a.reason}”</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {mine ?
                  <>
                        <span className="self-center text-caption text-fg-subtle">Waiting for another lead</span>
                        <Button size="sm" variant="secondary" onClick={() => withdraw(a)}>
                          Withdraw
                        </Button>
                      </> :

                  <>
                        <Button size="sm" variant="secondary" onClick={() => setRejecting(a)}>
                          Reject
                        </Button>
                        <Button size="sm" leadingIcon={CheckIcon} onClick={() => approve(a)}>
                          Approve
                        </Button>
                      </>
                  }
                  </div>
                </li>);

          })}
          </ul>
        </section>
      }

      <section aria-labelledby="staff-list" className="mt-8">
        <h2 id="staff-list" className="sr-only">
          Staff accounts
        </h2>
        <DataTable caption="Staff accounts" rows={staff} columns={columns} filterText={(m) => `${m.name} ${m.email} ${roleInfo(m.role).label}`} filterPlaceholder="Search name, email or role" emptyTitle="No staff match" />
      </section>

      {recentDecided.length > 0 &&
      <Section id="decided" title="Recent approval decisions" className="mt-8">
          <List ruled label="Recent approval decisions">
            {recentDecided.map((a) => {
            const st = effectiveStatus(a);
            return (
              <li key={a.id} className="flex min-h-[48px] flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <span className="min-w-0 flex-1 text-label text-fg">{a.summary}</span>
                  <span className="text-caption text-fg-subtle">{st === 'expired' ? `Expired ${formatRelative(a.expiresAt)}` : `${a.decidedBy ?? ''} · ${a.decidedAt ? formatRelative(a.decidedAt) : ''}`}</span>
                  <Badge tone={st === 'approved' ? 'success' : st === 'rejected' ? 'danger' : 'neutral'}>{approvalStatusLabels[st]}</Badge>
                  {a.decisionNote && <p className="w-full text-caption text-fg-muted">“{a.decisionNote}”</p>}
                </li>);

          })}
          </List>
        </Section>
      }

      <AccessReviewSection />

      <Section
        id="roles"
        title="What each role can open"
        description="Roles are fixed so access reviews stay simple. Every action inside an area still needs a written reason and lands in the audit log."
        className="mt-12 border-t border-line pt-8">
        
        <dl className="flex flex-col divide-y divide-line">
          {staffRoles.map((r) =>
          <div key={r.id} className="grid gap-2 py-4 md:grid-cols-[220px_1fr] md:gap-8">
              <dt>
                <span className="block text-label font-semibold text-fg">{r.label}</span>
                <span className="mt-0.5 block text-caption text-fg-subtle">
                  {staff.filter((m) => m.role === r.id && m.status !== 'disabled').length} people
                </span>
              </dt>
              <dd>
                <p className="text-label text-fg-muted">{r.description}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${r.label} areas`}>
                  {(r.areas === '*' ? [{ id: '*', label: 'Every area' }] : adminNavItems.filter((i) => (r.areas as string[]).includes(i.id))).map((i) =>
                <li key={i.id} className="rounded-md bg-sunken px-2 py-0.5 text-caption text-fg">
                      {i.label}
                    </li>
                )}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </Section>

      <ReasonDialog open={!!action} onClose={() => setAction(null)} onConfirm={confirm} destructive={action?.kind === 'disable' || action?.kind === 'cancel' || action?.kind === 'reset'} {...dialog}>
        {action?.kind === 'invite' &&
        <>
            <TextInput id="staff-invite-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput id="staff-invite-email" label="Work email" type="email" placeholder="name@kub.icu" value={email} onChange={(e) => setEmail(e.target.value)} error={inviteError || undefined} />
          </>
        }
        {(action?.kind === 'invite' || action?.kind === 'role') && <SelectInput<StaffRole> id="staff-role" label="Role" value={role} options={roleOptions} onChange={setRole} hint={roleInfo(role).description} />}
      </ReasonDialog>
      <ReasonDialog open={!!rejecting} onClose={() => setRejecting(null)} onConfirm={reject} destructive title="Reject this request?" description={rejecting ? `${rejecting.summary}. Nothing changes; ${rejecting.requestedBy.split(' ·')[0]} sees your note.` : ''} confirmLabel="Reject" />
    </div>);

}