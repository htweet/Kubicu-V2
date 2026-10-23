import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { roleInfo } from '../../data/permissions';
import { PageHeader } from '../../components/shell/PageHeader';
import { SubNav } from '../../components/shell/SubNav';
import { TeamTab } from '../../components/settings/TeamTab';
import { RolesTab } from '../../components/settings/RolesTab';
import { ApprovalsTab } from '../../components/settings/ApprovalsTab';
import { ActivityTab } from '../../components/settings/ActivityTab';
import { PrivacyTab } from '../../components/settings/PrivacyTab';
import { BillingTab } from '../../components/settings/BillingTab';
import { NotificationsTab } from '../../components/settings/NotificationsTab';
import { useBilling } from '../../contexts/BillingContext';

const tabs = [
{ id: 'team', label: 'Team', to: '/app/settings', end: true },
{ id: 'roles', label: 'Roles', to: '/app/settings/roles' },
{ id: 'approvals', label: 'Approvals', to: '/app/settings/approvals' },
{ id: 'billing', label: 'Plan & billing', to: '/app/settings/billing' },
{ id: 'notifications', label: 'Notifications', to: '/app/settings/notifications' },
{ id: 'activity', label: 'Activity', to: '/app/settings/activity' },
{ id: 'privacy', label: 'Privacy', to: '/app/settings/privacy' }];


const panels: Record<string, () => React.ReactElement | null> = {
  team: TeamTab,
  roles: RolesTab,
  approvals: ApprovalsTab,
  billing: BillingTab,
  notifications: NotificationsTab,
  activity: ActivityTab,
  privacy: PrivacyTab
};

/** Workspace settings. Team and Roles now; approvals and the activity log follow (D57–D59). */
export function Settings() {
  const { tab = 'team' } = useParams();
  const { current } = useWorkspace();
  const { me, role, data, can } = useTeam();
  const waiting = can('approvals.review').allowed ? data.reviews.filter((r) => r.status === 'pending').length : 0;
  const billing = useBilling();
  const billingAlert = can('billing.manage').allowed && billing.data.status === 'past_due' ? 1 : 0;
  if (!tabs.some((t) => t.id === tab)) return <Navigate to="/app/settings" replace />;
  const Panel = panels[tab];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Settings"
        context={current.name}
        description={`Settings for everyone in ${current.name}. You’re ${me.name} — ${roleInfo[role].label}.`} />
      
      <p className="mt-2 text-caption text-fg-subtle">
        Your own profile, password and preferences are in{' '}
        <Link to="/app/account" className="font-medium text-fg underline-offset-2 hover:underline">
          Your account
        </Link>
        .
      </p>
      <div className="mt-6">
        <SubNav label="Settings" items={tabs.map(({ id, to, label, end }) => ({ to, label, end, badge: id === 'approvals' ? waiting : id === 'billing' ? billingAlert : undefined }))} />
      </div>
      <div className="pt-6 md:pt-8">
        <Panel />
      </div>
    </div>);

}