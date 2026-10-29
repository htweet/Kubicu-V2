import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';
import type { OrderMessageId } from '../../../types/commerce';
import { useShopSection } from '../../../hooks/useShopSection';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { Badge } from '../../ui/Badge';
import { SettingsSection } from './SettingsSection';
import { orderMessageLabels, shopSettingsOf } from '../../../utils/commerce/shopSettings';
import { formatNgn } from '../../../utils/format';
import { cn } from '../../../utils/cn';

const ids = Object.keys(orderMessageLabels) as OrderMessageId[];

/** Which order updates buyers get, and how (D222). Previews only — nothing is sent without a messaging partner. */
export function CustomerMessagesSection() {
  const s = useShopSection('messages', 'Customer messages saved');
  const { current } = useWorkspace();
  const [openId, setOpenId] = useState<OrderMessageId | null>(null);
  const prefix = shopSettingsOf(s.data).orders.prefix;
  const fill = (text: string) =>
  text.
  replace('{name}', 'Ngozi').
  replace('{order}', prefix ? `${prefix}-1042` : '#1042').
  replace('{amount}', formatNgn(28000)).
  replace('{address}', s.data.fulfilment.pickupAddress || 'our studio');

  return (
    <SettingsSection id="messages" title="Customer messages" description="Order update emails buyers get. You can always message a buyer yourself from the order." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset}>
      <p className="flex flex-wrap items-center gap-2 rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
        <Badge tone="neutral">Preview</Badge>
        Nothing is sent yet — email needs a messaging partner. Your choices are saved for when it’s connected.
      </p>
      <p className="text-caption text-fg-muted">
        WhatsApp order updates are set in one place: the WhatsApp app’s automatic messages.{' '}
        <Link to="/app/whatsapp" className="font-medium text-action hover:underline">
          Open WhatsApp
        </Link>
      </p>
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[22rem] text-left">
          <caption className="sr-only">Order messages</caption>
          <thead className="bg-sunken text-caption font-semibold text-fg-muted">
            <tr>
              <th scope="col" className="px-3.5 py-2">Message</th>
              <th scope="col" className="w-24 px-2 py-2 text-center">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ids.map((id) => {
              const m = s.draft[id];
              const open = openId === id;
              return (
                <React.Fragment key={id}>
                  <tr>
                    <th scope="row" className="px-3.5 py-2.5 text-left font-normal">
                      <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : id)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-sm text-label font-medium text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <ChevronDownIcon size={14} aria-hidden className={cn('shrink-0 text-fg-subtle transition-transform duration-150 ease-out', open && 'rotate-180')} />
                        {orderMessageLabels[id].label}
                      </button>
                    </th>
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${orderMessageLabels[id].label} by email`}
                        checked={m.email}
                        onChange={(e) => s.patch({ [id]: { ...m, email: e.target.checked } } as Partial<typeof s.draft>)}
                        className="h-5 w-5 cursor-pointer" />
                      
                    </td>
                  </tr>
                  {open &&
                  <tr>
                      <td colSpan={2} className="bg-canvas px-3.5 pb-3 pt-1">
                        <p className="rounded-md border border-line bg-raised px-3 py-2.5 text-caption text-fg">
                          <span className="mb-1 block text-meta font-semibold text-fg-subtle">From {current.name}</span>
                          {fill(orderMessageLabels[id].preview)}
                        </p>
                      </td>
                    </tr>
                  }
                </React.Fragment>);

            })}
          </tbody>
        </table>
      </div>
    </SettingsSection>);

}