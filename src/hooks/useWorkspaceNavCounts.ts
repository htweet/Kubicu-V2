import { useMemo } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTeam } from '../contexts/TeamContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useDomains } from '../contexts/DomainsContext';
import { useBilling } from '../contexts/BillingContext';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useWhatsApp } from './useWhatsApp';
import { useServiceOs } from './useServiceOs';
import { useFulfilment } from './useFulfilment';
import { ordersToActOn } from '../utils/commerce/orderQueue';
import { whatsappCounts } from '../utils/whatsappCounts';
import { invoiceView } from '../utils/serviceOs';
import { readyOrders } from '../utils/fulfilment';
import { pendingDrafts } from '../utils/ops/pendingDrafts';
import { openRequests } from '../utils/ops/slots';

/**
 * Workspace sidebar badges (D247, D251). Each number is the same calculation as a count the area's
 * own page shows, and only counts things waiting on *you* — not things waiting on a customer,
 * courier or partner. Areas whose page shows no such count get no badge.
 */
export function useWorkspaceNavCounts(): Record<string, number> {
  const { current } = useWorkspace();
  const { data: team, can } = useTeam();
  const commerce = useCommerce().data;
  const ops = useOps().data;
  const domains = useDomains().data;
  const billing = useBilling().data;
  const market = useMarketplace();
  const wa = useWhatsApp(current.id).data;
  const svc = useServiceOs(current.id).data;
  const ful = useFulfilment(current.id).data;

  return useMemo(() => {
    const on = (id: string) => market.isActive(id);
    const waNums = whatsappCounts(wa, commerce.products);
    return {
      // Commerce → Orders tab badge
      commerce: ordersToActOn(commerce.orders),
      // Settings → Approvals + Plan & billing tab badges
      settings:
        (can('approvals.review').allowed ? team.reviews.filter((r) => r.status === 'pending').length : 0) +
        (can('billing.manage').allowed && billing.status === 'past_due' ? 1 : 0),
      // WhatsApp → Chats (unread) + Catalogue (needs sync) tab badges
      whatsapp: on('whatsapp-catalogue') ? waNums.unread + waNums.outOfDate : 0,
      // Bookings → "Requests to answer" on Schedule (D256)
      bookings: openRequests(ops.bookings).length,
      // Quotes & jobs → Invoices tab badge (overdue, to chase)
      services: on('service-os') ? svc.invoices.filter((i) => invoiceView(i) === 'overdue').length : 0,
      // Deliveries → "Ready to send" tab badge
      deliveries: on('local-fulfilment') ? readyOrders(commerce.orders, ful).length : 0,
      // Automations → "Drafts waiting for you"
      automations: on('automations') ? pendingDrafts(ops.automations).length : 0,
      // Domains → Domains tab badge (connection problems)
      domains: on('domains') ? domains.domains.filter((d) => d.status === 'problem').length : 0,
    };
  }, [market, wa, commerce, can, team.reviews, billing.status, svc.invoices, ful, ops.automations, ops.bookings, domains.domains]);
}
