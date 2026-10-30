import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, ClockIcon, LockIcon, UserRoundXIcon } from 'lucide-react';
import type { Listing } from '../../../utils/marketplaceListings';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useTeam } from '../../../contexts/TeamContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useT } from '../../../contexts/LocaleContext';
import { planAtLeast, plans } from '../../../data/plans';

const primary =
'group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2';
const secondary =
'inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-sunken px-6 text-[15px] font-bold text-fg transition-colors duration-150 hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/** Workspace-changing kinds need the "Install and manage extensions" permission. */
const needsPermission = (l: Listing) => l.kind === 'apps' || l.kind === 'kits' || l.kind === 'recipes';

/**
 * The action box on a listing (D268): checks plan, role and installed state before offering the action.
 * Every button opens the real screen in the workspace, where the existing install steps take over. Translated in D335.
 */
export function InstallPanel({ listing }: {listing: Listing;}) {
  const { t: tr } = useT();
  const market = useMarketplace();
  const plan = usePlan();
  const team = useTeam();
  const { current } = useWorkspace();
  const installed = !!listing.ext && market.isActive(listing.ext.id);
  const planOk = planAtLeast(plan.id, listing.minPlan);
  const allowed = !needsPermission(listing) || team.can('extensions.manage');
  const actionLabel = tr(listing.action.label);

  let body: React.ReactNode;
  if (listing.status === 'planned') {
    body =
    <>
        <State icon={ClockIcon} title={tr('Not available yet')} text={tr('This is planned. It can’t be installed on any plan today.')} />
        <Link to={listing.action.to} className={secondary}>
          {actionLabel}
        </Link>
      </>;

  } else if (installed) {
    body =
    <>
        <State icon={CheckCircle2Icon} tone="success" title={tr('Installed in {workspace}', { workspace: current.name })} text={tr('Pause, change its settings or uninstall from Extensions.')} />
        <Link to={`/app/extensions?ext=${listing.ext!.id}`} className={primary}>
          {tr('Manage')} <ArrowRightIcon size={16} aria-hidden />
        </Link>
      </>;

  } else if (!allowed) {
    body =
    <>
        <State icon={UserRoundXIcon} title={tr('Ask an owner or admin')} text={tr('Your role in this workspace can’t install extensions or add workspace-wide drafts.')} />
        <Link to="/app/settings/roles" className={secondary}>
          {tr('See who can')}
        </Link>
      </>;

  } else if (!planOk) {
    body =
    <>
        <State
        icon={LockIcon}
        title={tr('Needs the {plan} plan', { plan: plans[listing.minPlan].name })}
        text={tr('{workspace} is on {plan}. Preview everything here; upgrade to use it.', { workspace: current.name, plan: plan.name })} />
      
        <Link to="/pricing" className={primary}>
          {tr('Compare plans')} <ArrowRightIcon size={16} aria-hidden />
        </Link>
        <Link to={listing.action.to} className={secondary}>
          {listing.kind === 'apps' ? tr('See it in Extensions') : actionLabel}
        </Link>
      </>;

  } else {
    body =
    <Link to={listing.action.to} className={primary}>
        {actionLabel} <ArrowRightIcon size={16} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
      </Link>;

  }

  return (
    <aside aria-label={tr('Get it')} className="flex flex-col gap-3 rounded-[24px] bg-raised p-5 shadow-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[20px] font-extrabold text-fg">{tr(listing.priceLabel)}</p>
        {listing.minPlan !== 'free' && listing.status !== 'planned' && <p className="text-[13px] font-semibold text-fg-muted">{tr('{plan} and above', { plan: plans[listing.minPlan].name })}</p>}
      </div>
      {body}
      {listing.status !== 'planned' &&
      <p className="text-[12px] leading-snug text-fg-subtle">
          {tr(needsPermission(listing) ? 'Opens your workspace, where you confirm permissions before anything is added.' : 'Opens your workspace.')}{' '}
          {tr('In this prototype you’re already signed in as the demo workspace.')}
        </p>
      }
    </aside>);

}

function State({ icon: Icon, title, text, tone }: {icon: typeof ClockIcon;title: string;text: string;tone?: 'success';}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-sunken p-3.5" role="status">
      <Icon size={18} aria-hidden className={tone === 'success' ? 'mt-0.5 shrink-0 text-success' : 'mt-0.5 shrink-0 text-fg-muted'} />
      <div>
        <p className="text-[14px] font-bold text-fg">{title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">{text}</p>
      </div>
    </div>);

}