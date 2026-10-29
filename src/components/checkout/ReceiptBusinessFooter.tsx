import React from 'react';
import type { ShopSettings } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';

interface ReceiptBusinessFooterProps {
  business: ShopSettings['business'];
  /** Page title, used when no trading name is set. */
  fallbackName: string;
  muted: React.CSSProperties;
  borderColor: string;
}

/** The seller's business details at the foot of a buyer receipt (D222). Shows nothing extra until they're set. */
export function ReceiptBusinessFooter({ business: b, fallbackName, muted, borderColor }: ReceiptBusinessFooterProps) {
  const ids = [b.regNumber.trim(), b.tin.trim() && `TIN ${b.tin.trim()}`].filter(Boolean).join(' · ');
  const contact = [b.phone.trim(), b.email.trim()].filter(Boolean).join(' · ');
  if (!b.tradingName.trim() && !b.address.trim() && !ids && !contact && !b.receiptFooter.trim() && !b.logoUrl) return null;
  return (
    <div className="flex items-start gap-3 border-t pt-3 text-[12.5px] leading-snug" style={{ borderColor }}>
      {b.logoUrl && <MediaImage src={b.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-contain" />}
      <div className="min-w-0">
        <p className="font-semibold">{b.tradingName.trim() || fallbackName}</p>
        {b.address.trim() && <p style={muted}>{b.address.trim()}</p>}
        {ids && <p style={muted}>{ids}</p>}
        {contact && <p style={muted}>{contact}</p>}
        {b.receiptFooter.trim() && <p className="mt-1.5">{b.receiptFooter.trim()}</p>}
      </div>
    </div>);

}