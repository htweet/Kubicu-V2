import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { InstalledExtension } from '../../types/marketplace';
import { useCommerce } from '../../contexts/CommerceContext';
import { LOYALTY_EXTENSION_ID, REDEEM_NGN, REDEEM_POINTS, loyaltyMembers } from '../../utils/loyalty';
import { ToolSection, ToolStat } from './tools/ToolSection';
import { formatMoney } from '../../utils/currency';
import { ProductFeedTool } from './tools/ProductFeedTool';
import { EmailSyncTool, SheetsSyncTool } from './tools/ContactSyncTools';
import { SearchConsoleTool } from './tools/SearchConsoleTool';

/** The working part of an installed, running extension, shown in its detail sheet (D232). */
export function ExtensionTools({ id, rec, onNavigate }: {id: string;rec: InstalledExtension;onNavigate: () => void;}) {
  switch (id) {
    case 'product-feed':
      return <ProductFeedTool />;
    case 'email-sync':
      return <EmailSyncTool rec={rec} />;
    case 'sheets-sync':
      return <SheetsSyncTool rec={rec} />;
    case 'search-console':
      return <SearchConsoleTool rec={rec} />;
    case LOYALTY_EXTENSION_ID:
      return <LoyaltyTool rec={rec} />;
    case 'clarity':
      return (
        <ToolSection title="Heatmaps">
          <p className="text-label text-fg-muted">Clarity starts recording once visitors accept the cookie notice. Recordings appear in your Clarity account within about two hours.</p>
          <a href={`https://clarity.microsoft.com/projects/view/${encodeURIComponent(rec.settings.projectId ?? '')}/dashboard`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 self-start text-label font-medium text-action hover:underline">
            Open Clarity <ArrowUpRightIcon size={14} aria-hidden />
          </a>
        </ToolSection>);

    case 'accounting-export':
      return (
        <ToolSection title="Where to find it">
          <p className="text-label text-fg-muted">Open the Sales report, choose a period, then press “Accounting export”.</p>
          <Link to="/app/commerce/reports" onClick={onNavigate} className="inline-flex items-center gap-1 self-start text-label font-medium text-action hover:underline">
            Open Sales report <ArrowUpRightIcon size={14} aria-hidden />
          </Link>
        </ToolSection>);

    default:
      return null;
  }
}

function LoyaltyTool({ rec }: {rec: InstalledExtension;}) {
  const { data } = useCommerce();
  const members = loyaltyMembers(data, rec.installedAt);
  const codes = data.discounts.filter((d) => d.loyalty);
  const used = codes.filter((d) => data.orders.some((o) => o.discount?.discountId === d.id)).length;
  return (
    <ToolSection title="Points so far">
      <dl className="grid grid-cols-3 gap-4">
        <ToolStat label="Customers with points" value={members.length} />
        <ToolStat label="Points outstanding" value={members.reduce((s, m) => s + m.balance, 0).toLocaleString()} />
        <ToolStat label="Codes used" value={`${used} of ${codes.length}`} />
      </dl>
      {members.length > 0 &&
      <ul className="flex max-h-40 flex-col divide-y divide-line overflow-y-auto">
          {members.slice(0, 20).map((m) =>
        <li key={m.phone} className="flex items-baseline justify-between gap-3 py-2 text-label">
              <span className="min-w-0 truncate text-fg">{m.name || m.phone}</span>
              <span className="shrink-0 tabular-nums text-fg-muted">{m.balance.toLocaleString()}</span>
            </li>
        )}
        </ul>
      }
      <p className="text-caption text-fg-muted">
        Counting from {new Date(rec.installedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}. {REDEEM_POINTS} points = {formatMoney(REDEEM_NGN)} off; codes appear in Commerce → Discounts.
      </p>
    </ToolSection>);

}