import React, { useRef, useState } from 'react';
import { FileTextIcon, GavelIcon, PaperclipIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { updateDispute } from '../../utils/commerce/ops';
import { uid } from '../../utils/id';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextArea } from '../ui/TextArea';

const statusCopy = {
  needs_response: { label: 'Needs your response', tone: 'warning' as const },
  under_review: { label: 'With the provider', tone: 'info' as const },
  won: { label: 'Resolved in your favour', tone: 'success' as const },
  lost: { label: 'Resolved for the customer', tone: 'neutral' as const },
};

/** Disputes are decided by the customer’s bank and the payment provider — KUBICU helps gather evidence. */
export function DisputePanel({ order }: { order: Order }) {
  const { apply } = useCommerce();
  const d = order.dispute!;
  const [response, setResponse] = useState(d.response);
  const fileRef = useRef<HTMLInputElement>(null);
  const daysLeft = Math.ceil((Date.parse(d.respondBy) - Date.now()) / 86400000);
  const open = d.status === 'needs_response';

  const submit = () => {
    if (!response.trim() || d.evidence.length === 0) {
      toast('Add a written response and at least one piece of evidence');
      return;
    }
    if (apply((data) => updateDispute(data, order.id, { status: 'under_review', response: response.trim() }, 'Dispute response submitted to provider')))
      toast('Response submitted (test mode)', { description: 'Providers usually decide within 30–75 days.' });
  };

  return (
    <section aria-labelledby={`dispute-${order.id}`} className="rounded-md border border-warning/40 bg-warning-soft/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`dispute-${order.id}`} className="flex items-center gap-2 text-label font-semibold text-fg">
          <GavelIcon size={16} strokeWidth={2.25} className="text-warning" aria-hidden />
          Dispute · {formatNgn(d.amountNgn)}
        </h3>
        <Badge tone={statusCopy[d.status].tone}>{statusCopy[d.status].label}</Badge>
      </div>
      <p className="mt-2 text-label text-fg-muted">{d.reason}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-caption">
        <div>
          <dt className="text-fg-subtle">Opened</dt>
          <dd className="font-medium text-fg">{formatTimestamp(d.openedAt)}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Respond by</dt>
          <dd className={daysLeft <= 2 && open ? 'font-semibold text-danger' : 'font-medium text-fg'}>
            {formatTimestamp(d.respondBy)}
            {open && ` · ${Math.max(0, daysLeft)} day${daysLeft === 1 ? '' : 's'} left`}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-label font-medium text-fg">Evidence</p>
        {d.evidence.length === 0 ? (
          <p className="mt-1 text-caption text-fg-subtle">Delivery confirmation, chat screenshots or a signed receipt help most.</p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1">
            {d.evidence.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-caption text-fg">
                <FileTextIcon size={13} className="text-fg-subtle" aria-hidden /> {e.name}
              </li>
            ))}
          </ul>
        )}
        {open && (
          <>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) apply((data) => updateDispute(data, order.id, { evidence: [...d.evidence, { id: uid('evd'), name: f.name, at: new Date().toISOString() }] }, `Evidence added: ${f.name}`));
                e.target.value = '';
              }}
            />
            <Button size="sm" variant="secondary" leadingIcon={PaperclipIcon} className="mt-2" onClick={() => fileRef.current?.click()}>
              Add evidence
            </Button>
          </>
        )}
      </div>

      {open ? (
        <div className="mt-4 flex flex-col gap-3">
          <TextArea id={`dispute-resp-${order.id}`} label="Your response" rows={3} value={response} placeholder="What happened, with dates. Keep it factual." onChange={(e) => setResponse(e.target.value)} />
          <Button size="sm" className="self-start" onClick={submit}>
            Submit to provider
          </Button>
        </div>
      ) : (
        d.response && <p className="mt-4 rounded-md bg-raised px-3 py-2 text-caption text-fg-muted">“{d.response}”</p>
      )}

      {d.status === 'under_review' && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-caption text-fg-subtle">Prototype only — simulate the provider’s decision:</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => apply((data) => updateDispute(data, order.id, { status: 'won' }, 'Dispute resolved in your favour'))}>
              Won
            </Button>
            <Button size="sm" variant="secondary" onClick={() => apply((data) => updateDispute(data, order.id, { status: 'lost' }, `Dispute lost — ${formatNgn(d.amountNgn)} returned to customer by provider`))}>
              Lost
            </Button>
          </div>
        </div>
      )}
      <p className="mt-3 text-caption text-fg-subtle">The customer’s bank and your payment provider decide disputes. KUBICU never holds or releases funds.</p>
    </section>
  );
}
