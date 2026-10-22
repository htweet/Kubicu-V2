import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { plans, planOrder } from '../../data/plans';
import type { WorkspacePlan } from '../../types/plan';
import { Button } from '../../components/ui/Button';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { cn } from '../../utils/cn';

type Cell = boolean | string;

const shown: WorkspacePlan[] = ['free', 'creator', 'pro', 'business', 'agency'];

const rows: {label: string;note?: string;values: Record<WorkspacePlan, Cell>;}[] = [
{ label: 'Pages and canvas editor', values: { free: true, creator: true, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'All core blocks', note: 'Links, forms, menus, products, events and more', values: { free: true, creator: true, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Full photo galleries', note: 'Free shows the first photo', values: { free: false, creator: true, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Remove “Made with KUBICU”', values: { free: false, creator: true, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Products and checkout', note: 'Free: 5 products, WhatsApp ordering. Pro adds checkout and digital sales', values: { free: 'Limited', creator: 'Limited', pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Bookings', note: 'Services, availability and deposits', values: { free: false, creator: false, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Pages per site', note: 'Example limits', values: { free: '1', creator: '5', pro: '20', business: '20', agency: '20', enterprise: '20' } },
{ label: 'Custom domain', note: 'Planned', values: { free: false, creator: true, pro: true, business: true, agency: true, enterprise: true } },
{ label: 'Team members', note: 'Planned', values: { free: false, creator: false, pro: false, business: true, agency: true, enterprise: true } },
{ label: 'Client workspaces', note: 'Planned', values: { free: false, creator: false, pro: false, business: false, agency: true, enterprise: true } }];


export function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-[36px] font-semibold leading-tight tracking-[-0.028em] text-fg md:text-[44px]">Start free. Pay when it pays you.</h1>
        <p className="mt-4 text-body text-fg-muted">Every plan includes the canvas and publishing. Upgrade for brand control, commerce and teams.</p>
      </header>

      <InlineAlert tone="info" title="Prices are still being tested" className="mt-8 max-w-2xl">
        The ranges below are what we’re testing with early users, not final prices. Nobody will be charged in this prototype. Enterprise pricing is agreed directly.
      </InlineAlert>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">Plan comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] pb-6 align-bottom text-label font-medium text-fg-subtle">Compare plans</th>
              {shown.map((id) =>
              <th key={id} scope="col" className={cn('px-3 pb-6 align-top', id === 'pro' && 'rounded-t-md bg-raised')}>
                  <span className="block pt-3 text-heading font-semibold text-fg">{plans[id].name}</span>
                  <span className="mt-1 block text-label font-semibold tabular-nums text-fg">{plans[id].priceHypothesis}</span>
                  <span className="mt-1 block min-h-[34px] text-caption font-normal text-fg-subtle">{plans[id].intendedFor}</span>
                  <Button size="sm" variant={id === 'free' ? 'primary' : 'secondary'} className="mt-3" onClick={() => navigate('/signup')}>
                    {id === 'free' ? 'Start free' : `Choose ${plans[id].name}`}
                  </Button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
            <tr key={row.label} className="border-t border-line">
                <th scope="row" className="py-3.5 pr-4 text-label font-medium text-fg">
                  {row.label}
                  {row.note && <span className="block text-caption font-normal text-fg-subtle">{row.note}</span>}
                </th>
                {shown.map((id) =>
              <td key={id} className={cn('px-3 py-3.5 text-label', id === 'pro' && 'bg-raised')}>
                    <CellValue value={row.values[id]} />
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-label text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-fg">{plans.enterprise.name}</span> — {plans.enterprise.intendedFor.toLowerCase()}. {planOrder.length} plans in total.
        </p>
        <Button variant="tertiary" onClick={() => navigate('/about/contact')}>
          Talk to us
        </Button>
      </div>
      <p className="mt-6 text-caption text-fg-subtle">Downgrading never deletes your content. Features above your plan pause until you upgrade again.</p>
    </div>);

}

function CellValue({ value }: {value: Cell;}) {
  if (value === true) return <CheckIcon size={17} className="text-success" aria-label="Included" />;
  if (value === false) return <MinusIcon size={17} className="text-fg-subtle" aria-label="Not included" />;
  return <span className="text-fg-muted">{value}</span>;
}