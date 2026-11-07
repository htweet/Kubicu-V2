import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, PlugIcon, RefreshCwIcon } from 'lucide-react';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useT } from '../../../contexts/LocaleContext';
import { useErp } from '../../../hooks/useErp';
import { ERP_PLAN, erpProviders } from '../../../data/erpProviders';
import { plans, planAtLeast } from '../../../data/plans';
import { MAIN_BRANCH, branchesOf } from '../../../utils/commerce/branches';
import { emptyErp, ordersToSend, previewPull, runErpSync } from '../../../utils/erp/sync';
import { formatRelative } from '../../../utils/format';
import { Section } from '../../ui/layout/Section';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TextInput } from '../../ui/TextInput';
import { Switch } from '../../ui/Switch';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { ErpConnectDialog } from './ErpConnectDialog';

const SHOWN = 6;

/** Settings → Integrations → Inventory & ERP (D440): stock follows Odoo, SAP Business One or Sage X3. */
export function ErpSection({ canManage }: { canManage: boolean }) {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, ERP_PLAN);
  const commerce = useCommerce();
  const { data: s, save } = useErp(current.id);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const editable = canManage && allowed;

  const locations = [{ id: MAIN_BRANCH, name: tr('Main shop') }, ...branchesOf(commerce.data).map((b) => ({ id: b.id, name: b.name }))];
  const preview = useMemo(() => (s.provider ? previewPull(commerce.data, s) : null), [commerce.data, s]);
  const pending = useMemo(() => ordersToSend(commerce.data, s).length, [commerce.data, s]);
  const mapped = Object.values(s.warehouses).some((c) => c.trim());
  const name = s.provider ? erpProviders[s.provider].name : '';
  const lastRun = s.runs[0];

  const sync = (trigger: 'manual' | 'auto') => {
    if (!s.provider) return;
    const r = runErpSync(commerce.data, s, trigger, name);
    if (trigger === 'auto' ? !commerce.applySystem(() => r.data) : !commerce.apply(() => r.data)) return;
    save(r.state);
    if (trigger === 'manual')
      toast.success(r.run.updated ? tr('Stock lines updated from {tool}: {n}', { tool: name, n: r.run.updated }) : tr('Stock already matches {tool}', { tool: name }), {
        description: [r.run.ordersSent ? tr('Sales orders sent: {n}', { n: r.run.ordersSent }) : '', r.run.unmatched ? tr('Skipped without a SKU: {n}', { n: r.run.unmatched }) : ''].filter(Boolean).join(' · ') || undefined,
      });
  };

  const syncNow = () => {
    setSyncing(true);
    window.setTimeout(() => {
      sync('manual');
      setSyncing(false);
    }, 800);
  };

  // Hourly sync (simulated): runs when the screen opens if the last one was over an hour ago.
  useEffect(() => {
    if (!s.provider || !s.auto || !allowed || !mapped) return;
    if (lastRun && Date.now() - Date.parse(lastRun.at) < 3_600_000) return;
    sync('auto');
  }, [s.provider, s.auto, allowed, mapped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Section id="int-erp" title={tr('Inventory & ERP')} description={tr('If your stock is managed in an ERP, KUBICU can follow its counts at every location and send your paid orders back as sales orders.')}>
      {!allowed && (
        <InlineAlert tone="info" title={tr('ERP connections are on {plan}', { plan: plans[ERP_PLAN].name })} action={<UpgradeButton plan={ERP_PLAN} feature="Inventory & ERP connections" />}>
          {tr('You can still import products and stock from a spreadsheet in Commerce → Products.')}
        </InlineAlert>
      )}

      {!s.provider ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <p className="text-label text-fg-muted">{tr('Odoo, SAP Business One or Sage X3 — one at a time.')}</p>
          <Button size="sm" variant="secondary" leadingIcon={PlugIcon} disabled={!editable} onClick={() => setConnecting(true)}>
            Connect
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
            <p className="min-w-0 text-label text-fg">
              <span className="font-semibold">{name}</span> <span className="text-fg-subtle">· {s.company} · {s.server.replace(/^https:\/\//, '')}</span>{' '}
              <Badge tone="success" dot>
                Connected · test
              </Badge>
            </p>
            <Button
              size="sm"
              variant="tertiary"
              disabled={!canManage}
              onClick={() => {
                save({ ...emptyErp(), runs: s.runs });
                toast(tr('ERP disconnected'), { description: tr('Stock stays as it is now. You can edit it in KUBICU again.') });
              }}
            >
              Disconnect
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-label font-semibold text-fg">{tr('Warehouses')}</legend>
              <p className="text-caption text-fg-muted">{tr('Match each location to its warehouse in {tool}. Leave one empty to keep its stock in KUBICU only.', { tool: name })}</p>
              {locations.map((l) => (
                <TextInput
                  key={l.id}
                  id={`erp-wh-${l.id}`}
                  label={l.name}
                  optional
                  placeholder={tr(erpProviders[s.provider!].warehouseHint)}
                  value={s.warehouses[l.id] ?? ''}
                  disabled={!editable}
                  onChange={(e) => save({ ...s, warehouses: { ...s.warehouses, [l.id]: e.target.value.trim().slice(0, 16) } })}
                />
              ))}
              <p className="text-caption text-fg-subtle">{tr('Products are matched by SKU. Add more locations in Commerce → Branches.')}</p>
            </fieldset>

            <div className="flex flex-col gap-5">
              <div>
                <p className="text-heading font-semibold text-fg">{!mapped ? tr('Map a warehouse to start') : preview && preview.changed.length ? tr('Stock lines that differ: {n}', { n: preview.changed.length }) : tr('Stock matches')}</p>
                <p className="mt-0.5 text-caption text-fg-muted">
                  {lastRun ? tr('Last sync {when}', { when: formatRelative(lastRun.at) }) + (lastRun.trigger === 'auto' ? ` ${tr('(automatic)')}` : '') : tr('Not synced yet.')}
                  {pending && s.pushOrders ? ` · ${tr('Paid orders to send: {n}', { n: pending })}` : ''}
                </p>
              </div>
              {preview && preview.changed.length > 0 && (
                <ul className="divide-y divide-line border-y border-line text-caption">
                  {preview.changed.slice(0, SHOWN).map((l) => (
                    <li key={`${l.variantId}-${l.location}`} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate text-fg">
                        {l.name} <span className="font-mono text-fg-subtle">{l.sku}</span> <span className="text-fg-muted">· {l.locationName}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-fg">
                        {l.kubicu} → <strong>{l.erp}</strong>
                      </span>
                    </li>
                  ))}
                  {preview.changed.length > SHOWN && <li className="py-2 text-fg-subtle">{tr('More: {n}', { n: preview.changed.length - SHOWN })}</li>}
                </ul>
              )}
              {preview && preview.unmatched.length > 0 && <p className="text-caption text-warning">{tr('Products with no SKU won’t sync ({n}): {names}', { n: preview.unmatched.length, names: preview.unmatched.slice(0, 3).join(', ') + (preview.unmatched.length > 3 ? '…' : '') })}</p>}
              <Button className="self-start" leadingIcon={RefreshCwIcon} loading={syncing} disabled={!editable || !mapped} onClick={syncNow}>
                Sync now
              </Button>
              <div className="flex flex-col gap-4 border-t border-line pt-5">
                <Switch id="erp-orders" label={tr('Send paid orders to {tool} as sales orders', { tool: name })} checked={s.pushOrders} disabled={!editable} onChange={(pushOrders) => save({ ...s, pushOrders })} />
                <Switch id="erp-auto" label="Sync every hour by itself" checked={s.auto} disabled={!editable} onChange={(auto) => save({ ...s, auto })} />
              </div>
              <InlineAlert tone="info" title={tr('{tool} keeps the count', { tool: name })}>
                {tr('Each sync sets KUBICU’s stock to the ERP’s, and every change is recorded in Inventory as a correction. Stock you adjust in KUBICU is overwritten at the next sync for mapped locations.')}
              </InlineAlert>
            </div>
          </div>

          {s.runs.length > 0 && (
            <div>
              <h4 className="text-label font-semibold text-fg">{tr('Sync history')}</h4>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {s.runs.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    <CheckCircle2Icon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
                    <span className="min-w-0 flex-1 text-label text-fg">
                      {tr('Lines updated: {n}', { n: r.updated })}
                      {r.updated ? ` (+${r.unitsIn} / ${r.unitsOut})` : ''}
                      {r.ordersSent ? ` · ${tr('Orders sent: {n}', { n: r.ordersSent })}` : ''}
                      {r.batchesIn ? ` · ${tr('Batches received: {n}', { n: r.batchesIn })}` : ''}
                      {r.unmatched ? <span className="block text-caption text-fg-muted">{tr('Skipped without a SKU: {n}', { n: r.unmatched })}</span> : null}
                    </span>
                    <span className="shrink-0 text-caption text-fg-subtle">
                      {formatRelative(r.at)}
                      {r.trigger === 'auto' ? ` · ${tr('auto')}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ErpConnectDialog
        open={connecting}
        onClose={() => setConnecting(false)}
        onConnect={(provider, server, company) => {
          save({ ...s, provider, server, company, connectedAt: new Date().toISOString(), sentOrders: {} });
          setConnecting(false);
          toast.success(tr('{tool} connected', { tool: erpProviders[provider].name }), { description: tr('Match your locations to its warehouses, then sync.') });
        }}
      />
    </Section>
  );
}
