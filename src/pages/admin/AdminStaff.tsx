import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, MoreHorizontalIcon, PowerIcon, UserCogIcon, UserPlusIcon, XIcon } from 'lucide-react';
import type { StaffMember, StaffRole } from '../../types/admin';
import { audit, useAdminStore } from '../../utils/admin/store';
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
      if (!name.trim() || !isEmail(email)) return setInviteError('Add their name and a @kubicu.com email.');
      if (staff.some((m) => m.email.toLowerCase() === email.trim().toLowerCase())) return setInviteError('That email already has a staff account.');
      const m: StaffMember = { id: uid('stf'), name: name.trim(), email: email.trim().toLowerCase(), role, status: 'invited', twoStep: false, lastActiveAt: null, invitedAt: new Date().toISOString() };
      setStore((s) => audit({ ...s, staff: [...s.staff, m] }, { area: 'staff', action: `Invited as ${roleInfo(role).label}`, target: m.email, reason }));
      toast.success('Invitation created', { description: 'They set up two-step sign-in the first time they sign in. Nothing is emailed in the prototype.' });
      setAction(null);
      return;
    }
    const m = action.member;
    const patch = (p: Partial<StaffMember>) => (s: typeof store) => ({ ...s, staff: s.staff.map((x) => x.id === m.id ? { ...x, ...p } : x) });
    if (action.kind === 'role') {
      if (role === m.role) return setAction(null);
      setStore((s) => audit(patch({ role })(s), { area: 'staff', action: `Changed role: ${roleInfo(m.role).label} → ${roleInfo(role).label}`, target: m.email, reason }));
      toast.success(`${m.name.split(' ')[0]} is now ${roleInfo(role).label}`);
    } else if (action.kind === 'reset') {
      setStore((s) => audit(patch({ twoStep: false })(s), { area: 'staff', action: 'Reset two-step sign-in', target: m.email, reason }));
      toast.success('Two-step reset', { description: 'They must set it up again before they can use the console.' });
    } else if (action.kind === 'disable') {
      setStore((s) => audit(patch({ status: 'disabled' })(s), { area: 'staff', action: 'Disabled staff account', target: m.email, reason }));
      toast.success('Account disabled', { description: 'They’re signed out everywhere straight away.' });
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
      const guard = self ? 'You can’t change your own access' : lastLead ? 'Keep at least one active Platform lead' : undefined;
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
          { id: 'reset', label: 'Reset two-step…', icon: KeyRoundIcon, disabled: self, reason: self ? 'Ask another Platform lead' : undefined, onSelect: () => setAction({ kind: 'reset', member: m }) },
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
        return { title: `Change ${first}’s role`, description: 'The new role applies the next time they open a screen.', confirmLabel: 'Change role' };
      case 'reset':
        return { title: `Reset ${first}’s two-step sign-in?`, description: 'Use this when they lose their phone. They’re locked out of the console until they set it up again.', confirmLabel: 'Reset' };
      case 'disable':
        return { title: `Disable ${first}’s account?`, description: 'They’re signed out straight away and can’t sign in. Their audit history stays.', confirmLabel: 'Disable' };
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

      <section aria-labelledby="staff-list" className="mt-8">
        <h2 id="staff-list" className="sr-only">
          Staff accounts
        </h2>
        <DataTable caption="Staff accounts" rows={staff} columns={columns} filterText={(m) => `${m.name} ${m.email} ${roleInfo(m.role).label}`} filterPlaceholder="Search name, email or role" emptyTitle="No staff match" />
      </section>

      <section aria-labelledby="roles-heading" className="mt-12 border-t border-line pt-8">
        <h2 id="roles-heading" className="text-heading font-semibold text-fg">
          What each role can open
        </h2>
        <p className="mt-1 max-w-2xl text-label text-fg-muted">Roles are fixed so access reviews stay simple. Every action inside an area still needs a written reason and lands in the audit log.</p>
        <dl className="mt-6 divide-y divide-line">
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
      </section>

      <ReasonDialog open={!!action} onClose={() => setAction(null)} onConfirm={confirm} destructive={action?.kind === 'disable' || action?.kind === 'cancel' || action?.kind === 'reset'} {...dialog}>
        {action?.kind === 'invite' &&
        <>
            <TextInput id="staff-invite-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput id="staff-invite-email" label="Work email" type="email" placeholder="name@kubicu.com" value={email} onChange={(e) => setEmail(e.target.value)} error={inviteError || undefined} />
          </>
        }
        {(action?.kind === 'invite' || action?.kind === 'role') && <SelectInput<StaffRole> id="staff-role" label="Role" value={role} options={roleOptions} onChange={setRole} hint={roleInfo(role).description} />}
      </ReasonDialog>
    </div>);

}