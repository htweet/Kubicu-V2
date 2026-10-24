import React, { useMemo, useState } from 'react';
import { CopyIcon, GlobeIcon, PlusIcon } from 'lucide-react';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useCan } from '../../contexts/TeamContext';
import { planAtLeast } from '../../data/plans';
import { activeExtraSpaces, MAIN_SPACE_ID } from '../../utils/spaces';
import { spaceDoc, spaceHandle } from '../../utils/domains/links';
import { copyToClipboard } from '../../utils/clipboard';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { DomainCard } from '../../components/domains/DomainCard';
import { ConnectDomainDialog } from '../../components/domains/ConnectDomainDialog';

/** Custom domains need Creator or above (example gating, D62). */
export const DOMAIN_PLAN = 'creator' as const;

export function Domains() {
  const { data } = useDomains();
  const { current } = useWorkspace();
  const plan = usePlan();
  const can = useCan('domains.manage');
  const [open, setOpen] = useState(false);
  const planOk = planAtLeast(plan.id, DOMAIN_PLAN);

  const spaces = useMemo(
    () =>
    [{ id: MAIN_SPACE_ID, name: 'Main page' }, ...activeExtraSpaces(current).map((s) => ({ id: s.id, name: s.name }))].
    map((s) => ({ id: s.id, label: `${s.name} · kub.icu/${spaceHandle(current.id, s.id) ?? '…'}`, short: s.name })).
    filter((s) => spaceDoc(current.id, s.id)),
    [current]
  );
  const labelFor = (id: string) => spaces.find((s) => s.id === id)?.short ?? 'an archived space';
  const mainHandle = spaceHandle(current.id, MAIN_SPACE_ID) ?? '';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Domains"
        description="Show your page on a domain you own, like adaeze.com. Your kub.icu link always keeps working."
        actions={
        planOk ?
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setOpen(true)}>
              Connect a domain
            </Button> :

        <UpgradeButton plan={DOMAIN_PLAN} feature="Custom domains" variant="primary" />

        } />
      

      <section aria-label="Your free address" className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
        <div className="min-w-0">
          <p className="text-caption text-fg-subtle">Your free address</p>
          <p className="truncate text-body font-semibold text-fg">kub.icu/{mainHandle}</p>
        </div>
        <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => copyToClipboard(`https://kub.icu/${mainHandle}`, 'Link copied')}>
          Copy
        </Button>
      </section>

      {!planOk && data.domains.length === 0 ?
      <div className="grid gap-8 rounded-lg border border-line bg-raised p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-8">
          <div>
            <h2 className="text-heading font-semibold text-fg">Your own domain, on Creator</h2>
            <p className="mt-2 text-body text-fg-muted">Customers remember adaeze.com more easily than a kub.icu link, and it looks established on flyers and invoices.</p>
            <div className="mt-5">
              <UpgradeButton plan={DOMAIN_PLAN} feature="Custom domains" variant="primary" />
            </div>
          </div>
          <ul className="flex flex-col gap-3 text-label text-fg-muted">
            <li>Use a whole domain or a subdomain like shop.adaeze.com.</li>
            <li>Guided setup with the exact records for your registrar.</li>
            <li>Free security certificate (https), renewed automatically.</li>
            <li>Readable product links: /shop/ankara-wrap-dress.</li>
            <li className="text-caption text-fg-subtle">QR codes and campaign links are on every plan.</li>
          </ul>
        </div> :

      <>
          {!planOk &&
        <InlineAlert tone="warning" title="Your plan no longer includes custom domains" action={<UpgradeButton plan={DOMAIN_PLAN} feature="Custom domains" />}>
              Connected domains keep working, but you can’t add new ones.
            </InlineAlert>
        }
          {data.domains.length === 0 ?
        <div className="rounded-lg border border-line bg-raised">
              <EmptyState
            icon={GlobeIcon}
            title="No domains yet"
            description="Bought a domain from Whogohost, Qservers, Namecheap or elsewhere? Connect it in about 5 minutes."
            action={
            <Button leadingIcon={PlusIcon} disabled={!can.allowed} onClick={() => setOpen(true)}>
                    Connect a domain
                  </Button>
            } />
          
            </div> :

        <div className="flex flex-col gap-4">
              {data.domains.map((d) =>
          <DomainCard key={d.id} domain={d} spaceLabel={labelFor(d.spaceId)} spaces={spaces.map((s) => ({ id: s.id, label: s.label, short: s.short }))} canManage={can.allowed} reason={can.reason} />
          )}
            </div>
        }
          <p className="text-caption text-fg-subtle">
            Prototype: DNS checks and certificates are simulated, and the record targets are examples until hosting is chosen.
          </p>
        </>
      }

      <ConnectDomainDialog open={open} onClose={() => setOpen(false)} spaces={spaces} />
    </div>);

}