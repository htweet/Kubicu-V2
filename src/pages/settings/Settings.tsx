import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
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

const tabs = [
{ id: 'team', label: 'Team', to: '/app/settings', end: true },
{ id: 'roles', label: 'Roles', to: '/app/settings/roles' },
{ id: 'approvals', label: 'Approvals', to: '/app/settings/approvals' },
{ id: 'activity', label: 'Activity', to: '/app/settings/activity' },
{ id: 'privacy', label: 'Privacy', to: '/app/settings/privacy' }];


/** Workspace settings. Team and Roles now; approvals and the activity log follow (D57–D59). */
export function Settings() {
  const { tab = 'team' } = useParams();
  const { current } = useWorkspace();
  const { me, role, data, can } = useTeam();
  const waiting = can('approvals.review').allowed ? data.reviews.filter((r) => r.status === 'pending').length : 0;
  if (!tabs.some((t) => t.id === tab)) return <Navigate to="/app/settings" replace />;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Settings"
        context={current.name}
        description={`You’re signed in as ${me.name} — ${roleInfo[role].label}.`} />
      
      <div className="mt-6">
        <SubNav label="Settings" items={tabs.map(({ id, to, label, end }) => ({ to, label, end, badge: id === 'approvals' ? waiting : undefined }))} />
      </div>
      <div className="pt-6 md:pt-8">{tab === 'roles' ? <RolesTab /> : tab === 'approvals' ? <ApprovalsTab /> : tab === 'activity' ? <ActivityTab /> : tab === 'privacy' ? <PrivacyTab /> : <TeamTab />}</div>
    </div>);

}