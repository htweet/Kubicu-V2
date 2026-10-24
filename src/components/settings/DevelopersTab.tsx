import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, LockIcon } from 'lucide-react';
import { usePlan } from '../../contexts/PlanContext';
import { useCan } from '../../contexts/TeamContext';
import { planAtLeast } from '../../data/plans';
import { UpgradeButton } from '../ui/UpgradeButton';
import { InlineAlert } from '../ui/InlineAlert';
import { ApiKeysSection } from './developers/ApiKeysSection';
import { WebhooksSection } from './developers/WebhooksSection';
import { ConnectedAppsSection } from './developers/ConnectedAppsSection';
import { YourExtensionsSection } from './developers/YourExtensionsSection';
import { canSubmitExtensions } from '../../utils/extensionSubmissions';

/** Settings → Developers (D131): webhooks on Pro+, API keys and connected apps on Business+. Owner and Admin manage. */
export function DevelopersTab() {
  const plan = usePlan();
  const can = useCan('extensions.manage');
  const hasWebhooks = planAtLeast(plan.id, 'pro');
  const hasApi = planAtLeast(plan.id, 'business');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-label text-fg-muted">Connect your own software to KUBICU. Everything here is test mode in the prototype — no real requests are made.</p>
        <Link to="/developers" target="_blank" className="inline-flex shrink-0 items-center gap-1.5 text-label font-medium text-action underline-offset-2 hover:underline">
          <BookOpenIcon size={15} aria-hidden />
          Developer docs
        </Link>
      </div>
      {!can.allowed && <InlineAlert tone="info" title="View only">{can.reason ?? 'Only Owners and Admins can change developer settings.'}</InlineAlert>}

      {hasWebhooks ?
      <WebhooksSection canManage={can.allowed} /> :

      <Locked title="Webhooks are on Pro" text="Send paid orders, bookings and form answers to your own tools the moment they happen." plan="pro" feature="Webhooks" />
      }

      {hasApi ?
      <>
          <ApiKeysSection canManage={can.allowed} />
          <ConnectedAppsSection canManage={can.allowed} />
        </> :

      <Locked title="API keys and connected apps are on Business" text="Sync stock with your shop till, pull orders into accounting, or let a trusted app work for you." plan="business" feature="API keys and connected apps" />
      }

      {/* Every paid plan can sell extensions; the price cap rises with the plan (D134). */}
      {canSubmitExtensions(plan.id) ?
      <YourExtensionsSection canManage={can.allowed} /> :

      <Locked title="Selling extensions starts on Creator" text="Build a tool other sellers need, list it in Extensions after KUBICU reviews it, and keep 80% of what it earns." plan="creator" feature="Selling your own extensions" />
      }
    </div>);

}

function Locked({ title, text, plan, feature }: {title: string;text: string;plan: 'creator' | 'pro' | 'business';feature: string;}) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <LockIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
        <div>
          <h2 className="text-label font-semibold text-fg">{title}</h2>
          <p className="mt-0.5 text-caption text-fg-muted">{text}</p>
        </div>
      </div>
      <UpgradeButton plan={plan} feature={feature} className="shrink-0" />
    </section>);

}