import React from 'react';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { permissionRows, roleInfo, roleOrder, rolePermissions } from '../../data/permissions';
import { CurrencyInput } from '../ui/CurrencyInput';
import { formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/** Settings → Roles: exactly what each role can do (D57). */
export function RolesTab() {
  const { t: tr } = useT();
  const team = useTeam();
  const manage = team.can('team.manage');
  return (
    <div className="flex flex-col gap-8">
      <div className="scroll-quiet -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[640px] border-collapse text-label">
          <caption className="sr-only">{tr('What each role can do')}</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2.5 pr-4 text-left text-caption font-medium text-fg-subtle">
                {tr('Action')}
              </th>
              {roleOrder.map((r) =>
              <th key={r} scope="col" className={cn('px-3 py-2.5 text-center text-caption font-semibold', r === team.role ? 'text-action' : 'text-fg')}>
                  {tr(roleInfo[r].label)}
                  {r === team.role && <span className="block text-meta font-normal">{tr('you')}</span>}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) =>
            <tr key={row.id} className="border-b border-line">
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-fg">
                  {tr(row.label)}
                  {row.id === 'orders.refund' && <span className="block text-caption text-fg-subtle">{tr('Sales up to {amount}', { amount: formatNgn(team.data.salesRefundLimitNgn) })}</span>}
                </th>
                {roleOrder.map((r) => {
                const yes = rolePermissions[r].has(row.id);
                return (
                  <td key={r} className={cn('px-3 py-2.5 text-center', r === team.role && 'bg-action-soft/40')}>
                      {yes ? <CheckIcon size={16} className="mx-auto text-success" aria-label={tr('Yes')} /> : <MinusIcon size={16} className="mx-auto text-fg-subtle" aria-label={tr('No')} />}
                    </td>);

              })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="refund-limit-heading" className="max-w-md">
        <h2 id="refund-limit-heading" className="text-label font-semibold text-fg">
          {tr('Sales refund limit')}
        </h2>
        <p className="mt-0.5 text-caption text-fg-muted">{tr('Sales can refund up to this amount per order. Bigger refunds need an Admin or the Owner.')}</p>
        <div className="mt-3">
          <CurrencyInput
            id="refund-limit"
            label="Up to"
            value={team.data.salesRefundLimitNgn}
            disabled={!manage.allowed}
            hint={!manage.allowed ? manage.reason : undefined}
            onChange={(v) => {
              team.update({ salesRefundLimitNgn: v ?? 0 });
            }} />
          
        </div>
      </section>
    </div>);

}