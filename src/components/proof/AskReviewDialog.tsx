import React, { useMemo } from 'react';
import { CopyIcon, MessageCircleIcon, StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { ProofData, ReviewRequest } from '../../types/proof';
import { useCommerce } from '../../contexts/CommerceContext';
import { useOps } from '../../contexts/OpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useServiceOs } from '../../hooks/useServiceOs';
import { useMainLink } from '../../hooks/useMainLink';
import { eligibleSources, firstName, newRequest, reviewPath, sourceBadge, type EligibleSource } from '../../utils/proof';
import { whatsappLink } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  open: boolean;
  data: ProofData;
  update: (fn: (d: ProofData) => ProofData) => void;
  onClose: () => void;
}

export function requestLink(handle: string, r: ReviewRequest) {
  return `${window.location.origin}${reviewPath(handle, r.token)}`;
}

export function requestMessage(business: string, link: string, r: ReviewRequest) {
  return `Hi ${firstName(r.customerName)}, thank you for choosing ${business}! Would you leave a quick review of your ${r.source.kind === 'order' ? 'order' : r.source.kind === 'booking' ? 'appointment' : 'job'}? It takes a minute: ${link}`;
}

/** Pick a real completed record and send its customer a one-time review link (D91). */
export function AskReviewDialog({ open, data, update, onClose }: Props) {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const ops = useOps();
  const sos = useServiceOs(current.id);
  const { mainHandle } = useMainLink();
  const list = useMemo(() => eligibleSources(commerce.data.orders, ops.data.bookings, sos.data.jobs, data.requests), [commerce.data.orders, ops.data.bookings, sos.data.jobs, data.requests]);

  const create = (e: EligibleSource, via: 'copy' | 'whatsapp') => {
    const req = newRequest(e);
    update((d) => ({ ...d, requests: [req, ...d.requests] }));
    const link = requestLink(mainHandle, req);
    if (via === 'copy') {
      void navigator.clipboard?.writeText(link);
      toast.success('Review link copied', { description: `Send it to ${e.customerName}. It works once.` });
    } else {
      window.open(whatsappLink(e.phone, requestMessage(current.name, link, req)), '_blank', 'noopener');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg" title="Ask for a review" description="Only customers with a completed order, completed booking or finished job in the last 120 days can be asked. Each gets a link that works once.">
      {list.length === 0 ? (
        <EmptyState icon={StarIcon} title="No one to ask right now" description="Mark orders and bookings as completed, or jobs as done, and they’ll appear here." />
      ) : (
        <ul className="-mx-1 flex max-h-[55vh] flex-col divide-y divide-line overflow-y-auto">
          {list.map((e) => (
            <li key={`${e.source.kind}:${e.source.id}`} className="flex flex-col gap-3 px-1 py-3 sm:flex-row sm:items-center">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-medium text-fg">{e.customerName || 'Customer'}</span>
                <span className="block truncate text-caption text-fg-subtle">
                  {sourceBadge[e.source.kind]} · {e.source.label}
                </span>
              </span>
              <span className="flex shrink-0 gap-2">
                <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => create(e, 'copy')}>
                  Copy link
                </Button>
                <Button size="sm" leadingIcon={MessageCircleIcon} disabled={!e.phone} title={e.phone ? undefined : 'No phone number on this record'} onClick={() => create(e, 'whatsapp')}>
                  WhatsApp
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
