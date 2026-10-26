import React from 'react';
import type { GiftCard } from '../../types/commerce';
import { giftCardState, giftCardStateLabels } from '../../utils/commerce/sellModes';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface GiftCardDetailProps {
  card: GiftCard | null;
  onClose: () => void;
}

/** One gift card's history: where it came from and every order it paid towards (D202). */
export function GiftCardDetail({ card, onClose }: GiftCardDetailProps) {
  const state = card ? giftCardState(card) : 'active';
  return (
    <Dialog
      open={!!card}
      onClose={onClose}
      title={card ? card.code : 'Gift card'}
      footer={
      <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }>
      
      {card &&
      <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-caption text-fg-muted">Balance</p>
              <p className="text-title font-semibold tabular-nums text-fg">{formatNgn(card.balanceNgn)}</p>
            </div>
            <p className="text-right text-caption text-fg-muted">
              of {formatNgn(card.initialNgn)} · {giftCardStateLabels[state]}
            </p>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-label">
            <dt className="text-fg-muted">From</dt>
            <dd className="text-fg">{card.source === 'sold' ? `Bought by ${card.buyerName}${card.orderNumber ? ` · order #${card.orderNumber}` : ''}` : 'Issued by you'}</dd>
            {card.recipientName &&
          <>
                <dt className="text-fg-muted">For</dt>
                <dd className="text-fg">{card.recipientName}</dd>
              </>
          }
            <dt className="text-fg-muted">Created</dt>
            <dd className="text-fg">{formatTimestamp(card.createdAt)}</dd>
            <dt className="text-fg-muted">Expires</dt>
            <dd className="text-fg">{card.expiresAt ? formatTimestamp(card.expiresAt) : 'Never'}</dd>
            {card.message &&
          <>
                <dt className="text-fg-muted">Message</dt>
                <dd className="text-fg">“{card.message}”</dd>
              </>
          }
            {card.note &&
          <>
                <dt className="text-fg-muted">Private note</dt>
                <dd className="text-fg">{card.note}</dd>
              </>
          }
          </dl>
          <section aria-labelledby="gc-uses">
            <h3 id="gc-uses" className="text-label font-semibold text-fg">
              Used on
            </h3>
            {card.source === 'sold' && card.status === 'disabled' &&
          <p className="mt-1 text-caption text-fg-muted">If the order that bought this card was refunded, the card was turned off automatically.</p>
          }
            {card.uses.length === 0 ?
          <p className="mt-1 text-caption text-fg-muted">Not used yet.</p> :

          <ul className="mt-2 divide-y divide-line">
                {card.uses.map((u) =>
            <li key={`${u.orderId}-${u.at}`} className="flex justify-between gap-3 py-2 text-label">
                    <span className="text-fg">
                      {u.amountNgn < 0 ? 'Put back — refund of' : 'Order'} #{u.orderNumber} <span className="text-fg-subtle">· {formatTimestamp(u.at)}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-fg">{u.amountNgn < 0 ? `+${formatNgn(-u.amountNgn)}` : `−${formatNgn(u.amountNgn)}`}</span>
                  </li>
            )}
              </ul>
          }
          </section>
        </div>
      }
    </Dialog>);

}