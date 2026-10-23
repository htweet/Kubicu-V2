import React from "react";
import { BanknoteIcon, CheckIcon, LockIcon, ShieldCheckIcon, WalletIcon, BoxIcon } from "lucide-react";
import { toast } from "sonner";
import { EscrowFeePayer, PayArea, PayMethod } from "../../types/money";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useCan } from "../../contexts/TeamContext";
import { usePlan } from "../../contexts/PlanContext";
import { planAtLeast } from "../../data/plans";
import { useMoney } from "../../hooks/useMoney";
import { areaLabels, escrowFee, inspectionDays, methodFor, methodLabels, payAreas } from "../../utils/money/store";
import { formatNgn } from "../../utils/format";
import { cn } from "../../utils/cn";
import { Section } from "../ui/layout/Section";
import { Card } from "../ui/layout/Card";
import { SelectInput } from "../ui/SelectInput";
import { Segmented } from "../ui/Segmented";
import { Switch } from "../ui/Switch";
import { Badge } from "../ui/Badge";
import { UpgradeButton } from "../ui/UpgradeButton";
import { PartnerNote } from "./PartnerNote";
interface MethodInfo {
  id: PayMethod;
  icon: BoxIcon;
  title: string;
  body: string;
  timing: string;
}
const methods: MethodInfo[] = [{
  id: 'direct',
  icon: BanknoteIcon,
  title: 'Direct to bank',
  body: 'Each payment settles to your bank account from the payment provider.',
  timing: 'Usually next business day'
}, {
  id: 'wallet',
  icon: WalletIcon,
  title: 'KUBICU wallet',
  body: 'Payments collect in your wallet. Pay out when you like, or on a schedule.',
  timing: 'Available after 24 hours'
}, {
  id: 'escrow',
  icon: ShieldCheckIcon,
  title: 'Escrow',
  body: 'The buyer’s money is held until they confirm delivery or the inspection window ends, then released to your wallet.',
  timing: 'Released after delivery'
}];
const later = [{
  title: 'Pay on delivery',
  body: 'Rider collects cash or card at the door. Needs a delivery partner.'
}, {
  title: 'Instalments',
  body: 'Buyer pays over time through a lending partner; you’re paid upfront.'
}];

/** Commerce → Payments → How you get paid (D92). */
export function PaymentMethodsSection() {
  const {
    current
  } = useWorkspace();
  const {
    data,
    update
  } = useMoney(current.id);
  const can = useCan('commerce.settings');
  const {
    id: plan
  } = usePlan();
  const escrowAllowed = planAtLeast(plan, 'pro');
  const m = data.methods;
  const escrowInUse = m.default === 'escrow' || Object.values(m.overrides).includes('escrow') || m.buyerChoice;
  const setDefault = (id: PayMethod) => {
    if (!can.allowed) return toast.error(can.reason);
    if (id === 'escrow' && !escrowAllowed) return;
    update((d) => ({
      ...d,
      methods: {
        ...d.methods,
        default: id
      }
    }));
    toast.success(`New payments go ${id === 'direct' ? 'straight to your bank' : id === 'wallet' ? 'to your wallet' : 'through escrow'}`, {
      description: 'Payments already made aren’t changed.'
    });
  };
  const setOverride = (area: PayArea, value: PayMethod | 'same') => {
    update((d) => {
      const overrides = {
        ...d.methods.overrides
      };
      if (value === 'same') delete overrides[area];else overrides[area] = value;
      return {
        ...d,
        methods: {
          ...d.methods,
          overrides
        }
      };
    });
  };
  const overrideOptions = [{
    value: 'same' as const,
    label: `Same as default (${methodLabels[m.default]})`
  }, {
    value: 'direct' as const,
    label: methodLabels.direct
  }, {
    value: 'wallet' as const,
    label: methodLabels.wallet
  }, {
    value: 'escrow' as const,
    label: escrowAllowed ? methodLabels.escrow : 'Escrow — Pro plan',
    disabled: !escrowAllowed
  }];
  return <Section id="how-paid" title="How you get paid" description="Choose where money from each sale goes. You can set a different method for each part of your business.">
      <div className="flex flex-col gap-6">
        <PartnerNote />
        {!escrowAllowed && escrowInUse && <p className="rounded-md bg-danger-soft px-3 py-2 text-label text-danger" role="alert">
            Escrow is set somewhere below but your plan no longer includes it. New sales that use it still go through escrow until you change the setting or upgrade.
          </p>}

        <div role="radiogroup" aria-label="Default payment method" className="grid gap-4 md:grid-cols-3">
          {methods.map((x) => {
          const selected = m.default === x.id;
          const locked = x.id === 'escrow' && !escrowAllowed;
          const Icon = x.icon;
          return <div key={x.id} className={cn('flex h-full flex-col rounded-lg border bg-raised p-5', selected ? 'border-action shadow-1' : 'border-line')}>
                <button type="button" role="radio" aria-checked={selected} aria-disabled={locked || !can.allowed} onClick={() => setDefault(x.id)} className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-raised">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-md', selected ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')}>
                      <Icon size={18} strokeWidth={2.25} aria-hidden />
                    </span>
                    {selected ? <Badge tone="action" icon={CheckIcon}>
                        Default
                      </Badge> : locked ? <Badge tone="neutral" icon={LockIcon}>
                        Pro
                      </Badge> : null}
                  </span>
                  <span className="mt-4 text-label font-semibold text-fg">{x.title}</span>
                  <span className="mt-1 text-caption text-fg-muted">{x.body}</span>
                  <span className="mt-auto pt-4 text-caption font-medium text-fg-subtle">{x.timing}</span>
                </button>
                {locked && <div className="mt-4 border-t border-line pt-4">
                    <UpgradeButton plan="pro" feature="Escrow" variant="secondary" />
                  </div>}
              </div>;
        })}
        </div>

        <ul className="grid gap-4 md:grid-cols-2" aria-label="Coming later">
          {later.map((l) => <li key={l.title} className="flex items-start justify-between gap-4 rounded-lg border border-dashed border-line px-5 py-4">
              <span>
                <span className="block text-label font-medium text-fg-muted">{l.title}</span>
                <span className="mt-0.5 block text-caption text-fg-subtle">{l.body}</span>
              </span>
              <Badge tone="neutral">Coming later</Badge>
            </li>)}
        </ul>

        <Card title="By area" description="Override the default where it makes sense — for example escrow for big custom jobs, wallet for tickets." body="flush">
          <ul className="divide-y divide-line">
            {payAreas.map((area) => <li key={area} className="grid items-center gap-2 px-5 py-3.5 sm:grid-cols-[1fr_minmax(0,280px)] md:px-6">
                <span>
                  <span className="block text-label font-medium text-fg">{areaLabels[area]}</span>
                  <span className="block text-caption text-fg-subtle">
                    Uses {methodLabels[methodFor(data, area)].toLowerCase()}
                    {methodFor(data, area) === 'escrow' ? ` · ${inspectionDays[area]}-day inspection window` : ''}
                  </span>
                </span>
                <div className="[&_label]:sr-only">
                  <SelectInput id={`area-${area}`} label={`Method for ${areaLabels[area]}`} value={m.overrides[area] ?? 'same'} options={overrideOptions} onChange={(v) => setOverride(area, v)} disabled={!can.allowed} />
                </div>
              </li>)}
          </ul>
        </Card>

        <Card title="Escrow options" description={`Escrow fee: 1% of the payment, capped at ${formatNgn(5000)} (example figure). On a ${formatNgn(80000)} order that’s ${formatNgn(escrowFee(80000))}.`}>
          <div className="flex flex-col gap-5">
            <Switch id="buyer-choice" checked={m.buyerChoice} disabled={!escrowAllowed || !can.allowed} onChange={(v) => update((d) => ({
            ...d,
            methods: {
              ...d.methods,
              buyerChoice: v
            }
          }))} label="Let buyers choose “Protect my payment”" description="Buyers can opt into escrow at checkout even when your method is direct or wallet. They pay the escrow fee." />
            <div className="flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block text-label font-medium text-fg">Who pays the escrow fee</span>
                <span className="block text-caption text-fg-subtle">Shown to the buyer before they pay.</span>
              </span>
              <Segmented<EscrowFeePayer> ariaLabel="Who pays the escrow fee" value={m.escrowFeePayer} onChange={(v) => can.allowed && update((d) => ({
              ...d,
              methods: {
                ...d.methods,
                escrowFeePayer: v
              }
            }))} options={[{
              value: 'seller',
              label: 'You'
            }, {
              value: 'split',
              label: 'Split'
            }, {
              value: 'buyer',
              label: 'Buyer'
            }]} />
            </div>
          </div>
        </Card>
      </div>
    </Section>;
}