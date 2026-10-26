import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangleIcon, FlaskConicalIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { DEMO_WARN_DAYS, demoDaysLeft, demoExpired, takeDemoWorkspaceNotice, takeRemovedNotice } from '../../utils/demoData';
import { formatDate } from '../../utils/billing';
import { cn } from '../../utils/cn';

/**
 * Demo data notice (D200). Shown on every workspace screen while sample data is in, turning into a
 * warning in the last 2 days. When the 7 days are up, the data is removed the next time this workspace opens.
 */
export function DemoDataBanner() {
  const { current, removeDemoData } = useWorkspace();
  const onSettings = useLocation().pathname.startsWith('/app/settings/business');
  const ran = useRef(false);
  const expired = demoExpired(current);

  useEffect(() => {
    const ws = takeDemoWorkspaceNotice();
    if (ws === 'removed') toast.success('Demo workspace removed', { description: 'Adaeze Atelier and everything in it is gone from this device. Bring it back any time from Your account → Workspaces.' });
    if (ws === 'restored') toast.success('Demo workspace added', { description: 'A fresh copy of Adaeze Atelier, with labelled sample data in every area.' });
    const notice = takeRemovedNotice();
    if (notice)
    toast.success(notice.reason === 'expired' ? 'Demo data removed after 7 days' : 'Demo data removed', {
      description: `${notice.workspaceName} now only has what you added yourself.`
    });
  }, []);

  useEffect(() => {
    if (!expired || ran.current) return;
    ran.current = true;
    removeDemoData('expired');
  }, [expired, removeDemoData]);

  const days = demoDaysLeft(current);
  if (days === null || expired || onSettings) return null;
  const warn = days <= DEMO_WARN_DAYS;
  const Icon = warn ? AlertTriangleIcon : FlaskConicalIcon;
  const when = days <= 1 ? 'tomorrow' : `in ${days} days`;

  return (
    <div role={warn ? 'alert' : 'status'} className={cn('border-b', warn ? 'border-warning/40 bg-warning-soft' : 'border-line bg-info-soft')}>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center md:px-10">
        <p className={cn('flex flex-1 items-start gap-2 text-label', warn ? 'text-fg' : 'text-info')}>
          <Icon size={15} className={cn('mt-0.5 shrink-0', warn && 'text-warning')} aria-hidden />
          <span>
            {warn ?
            <>
                <span className="font-semibold">Demo data is deleted {when}</span> ({formatDate(current.demoData!.expiresAt)}). Your own products, orders and pages stay.
              </> :

            <>
                This workspace has demo data, labelled “Sample”. It’s deleted automatically {when}, on {formatDate(current.demoData!.expiresAt)}.
              </>
            }
          </span>
        </p>
        <Link
          to="/app/settings/business#demo-data"
          className={cn(
            'inline-flex h-9 shrink-0 items-center justify-center self-start whitespace-nowrap rounded-md px-3 text-label font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:self-auto',
            warn ? 'bg-action text-action-fg hover:bg-action-hover' : 'border border-line bg-raised text-fg hover:bg-sunken'
          )}>
          
          Manage demo data
        </Link>
      </div>
    </div>);

}