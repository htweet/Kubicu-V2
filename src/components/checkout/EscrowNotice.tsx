import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useMoney } from '../../hooks/useMoney';
import { caseSummary, stageLabels } from '../../utils/money/escrow';
import { cardStyle } from '../blocks/pageStyle';

/** On the order page: shows that the payment is protected and links to the buyer protection page (D94). */
export function EscrowNotice({ workspaceId, handle, orderId, theme: t }: {workspaceId: string;handle: string;orderId: string;theme: PageTheme;}) {
  const { data } = useMoney(workspaceId);
  const c = data.escrow.find((x) => x.orderId === orderId);
  if (!c) return null;
  return (
    <Link to={`/p/${handle}/protect/${orderId}`} className="flex items-start gap-3 p-4" style={{ ...cardStyle(t), color: t.text }}>
      <ShieldCheckIcon size={20} className="mt-0.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">Payment protected · {stageLabels[c.stage]}</span>
        <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: t.mutedText }}>
          {caseSummary(c)}
        </span>
        <span className="mt-1.5 block text-[13px] font-semibold underline">{c.stage === 'delivered' ? 'Confirm you got it, or report a problem' : 'Open buyer protection'}</span>
      </span>
      <ChevronRightIcon size={18} className="mt-0.5 shrink-0" aria-hidden />
    </Link>);

}