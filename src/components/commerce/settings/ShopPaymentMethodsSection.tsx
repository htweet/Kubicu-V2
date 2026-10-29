import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { useShopSection } from '../../../hooks/useShopSection';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { Switch } from '../../ui/Switch';
import { USSD_AVAILABLE } from '../../../data/ussdBanks';
import { Badge } from '../../ui/Badge';
import { InlineAlert } from '../../ui/InlineAlert';
import { SettingsSection } from './SettingsSection';
import { transferDetails } from '../../../utils/commerce/bankTransfer';
import { payOptionsOf } from '../../../utils/commerce/payOptions';
import { isNaira } from '../../../utils/currency';
import { TRANSFER_ACCOUNT_MINUTES } from '../../checkout/TransferAccountPay';

/**
 * Which ways buyers can pay (D222). Bank transfer is a one-time provider account on its own, or that
 * plus the seller's own bank details; when both are on, the buyer chooses.
 */
export function ShopPaymentMethodsSection() {
  const s = useShopSection('methods', 'Payment methods saved');
  const { current } = useWorkspace();
  const m = s.draft;
  const naira = isNaira();
  const own = transferDetails(current.id, current.name);
  const pay = payOptionsOf(s.data);
  const anyOn = m.card || naira && (m.transfer || USSD_AVAILABLE && m.ussd);
  const error = anyOn ? '' : 'Keep at least one way to pay on, or buyers can’t check out.';

  return (
    <SettingsSection id="methods" title="Payment methods" description="The ways buyers can pay at checkout and on payment links." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={!!error}>
      {error &&
      <p className="rounded-md bg-danger-soft px-3 py-2.5 text-label text-danger" role="alert">
          {error}
        </p>
      }
      <Switch id="pm-card" label="Card" description="Visa, Mastercard and Verve through your payment provider. Paying in instalments always needs a card." checked={m.card} onChange={(card) => s.patch({ card })} />

      <div className="flex flex-col gap-4 border-t border-line pt-5">
        <Switch
          id="pm-transfer"
          label="Bank transfer"
          disabled={!naira}
          description={naira ? `Buyers get a one-time account number from your provider, valid for ${TRANSFER_ACCOUNT_MINUTES} minutes. The order confirms itself when the money lands — no checking for you.` : 'Naira shops only.'}
          checked={naira && m.transfer}
          onChange={(transfer) => s.patch({ transfer })} />
        
        {naira && m.transfer &&
        <div className="ml-0 flex flex-col gap-3 border-l-2 border-line pl-4 sm:ml-1">
            <Switch
            id="pm-own"
            label="Also offer my own bank details"
            description="Buyers can choose to transfer straight to your account and tap “I’ve paid”. The order waits until you confirm the money arrived."
            checked={m.transferOwn}
            onChange={(transferOwn) => s.patch({ transferOwn })} />
          
            {m.transferOwn && !own &&
          <InlineAlert tone="info" title="Add your bank details first">
                Your own account shows at checkout once the Bank transfer payments app has your bank and 10-digit account number.{' '}
                <Link to="/app/extensions" className="font-semibold underline underline-offset-2">
                  Set it up in Extensions
                </Link>
              </InlineAlert>
          }
            {m.transferOwn && own &&
          <p className="text-caption text-fg-muted">
                Showing {own.bank} · {own.account}.{' '}
                <Link to="/app/extensions" className="font-medium text-action hover:underline">
                  Change in Extensions
                </Link>
              </p>
          }
          </div>
        }
      </div>

      <div className="border-t border-line pt-5">
        <Switch
          id="pm-ussd"
          label="USSD"
          disabled={!USSD_AVAILABLE || !naira}
          description={!USSD_AVAILABLE ? 'Not available yet. Buyers can pay by card or bank transfer for now.' : naira ? 'Buyers dial a code from their bank phone and approve with their PIN — no card or data needed.' : 'Naira shops only.'}
          checked={USSD_AVAILABLE && naira && m.ussd}
          onChange={(ussd) => s.patch({ ussd })} />
        
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
        {[
        { label: 'Pay on delivery', on: naira && pay.pod.enabled },
        { label: 'Pay in instalments', on: naira && pay.instalments.enabled }].
        map((row) =>
        <li key={row.label} className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
            <span className="flex items-center gap-2 text-label font-medium text-fg">
              {row.label}
              <Badge tone={row.on ? 'success' : 'neutral'}>{row.on ? 'On' : 'Off'}</Badge>
            </span>
            <Link to="/app/commerce/payments" className="inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
              Set up in Payments <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
          </li>
        )}
      </ul>
    </SettingsSection>);

}