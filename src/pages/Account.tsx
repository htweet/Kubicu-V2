import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { accountTabs } from '../data/accountOptions';
import { useAccount } from '../utils/account/store';
import { PageHeader } from '../components/shell/PageHeader';
import { SubNav } from '../components/shell/SubNav';
import { AccountAvatar } from '../components/account/AccountAvatar';
import { ProfileTab } from '../components/account/ProfileTab';
import { SecurityTab } from '../components/account/SecurityTab';
import { PreferencesTab } from '../components/account/PreferencesTab';
import { WorkspacesTab } from '../components/account/WorkspacesTab';
import { DataPrivacyTab } from '../components/account/DataPrivacyTab';

const panels: Record<string, () => React.ReactElement | null> = {
  profile: ProfileTab,
  security: SecurityTab,
  preferences: PreferencesTab,
  workspaces: WorkspacesTab,
  privacy: DataPrivacyTab,
};

/** Your personal account — the same in every workspace (D80). Workspace settings stay under Settings. */
export function Account() {
  const { tab = 'profile' } = useParams();
  const account = useAccount();
  if (!panels[tab]) return <Navigate to="/app/account" replace />;
  const Panel = panels[tab];
  const twoStepOff = account.security.twoStep === 'none';

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <div className="flex items-center gap-4">
        <AccountAvatar name={account.profile.name} photo={account.profile.photo} size="md" className="hidden sm:inline-flex" />
        <div className="min-w-0 flex-1">
          <PageHeader title="Your account" context={account.profile.email} description="Your profile, sign-in and preferences. They follow you into every workspace." />
        </div>
      </div>
      <div className="mt-6">
        <SubNav label="Account" items={accountTabs.map(({ id, to, label, ...rest }) => ({ to, label, end: 'end' in rest ? rest.end : undefined, badge: id === 'security' && twoStepOff ? 1 : undefined }))} />
      </div>
      <div className="pt-6 md:pt-8">
        <Panel />
      </div>
    </div>
  );
}
