import React, { useMemo } from 'react';
import { AwardIcon } from 'lucide-react';
import type { CommerceData } from '../../types/commerce';
import type { PageTheme } from '../../types/page';
import type { PageCommerce } from '../../hooks/usePageCommerce';
import { extensionActive, readMarketplace } from '../../utils/marketplace';
import { LOYALTY_EXTENSION_ID, REDEEM_NGN, REDEEM_POINTS, loyaltyBalance, redeemPoints, unusedLoyaltyCode } from '../../utils/loyalty';
import { cardStyle, mix } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';

interface Props {
  theme: PageTheme;
  workspaceId?: string | null;
  data: CommerceData;
  apply: PageCommerce['apply'];
  phone: string;
  code: string;
  onApply: (code: string) => void;
}

/** Loyalty points at checkout (D232): 500 points become a one-time ₦500 code, applied like any discount code. */
export function LoyaltyRedeem({ theme, workspaceId, data, apply, phone, code, onApply }: Props) {
  const rec = useMemo(() => {
    if (!workspaceId) return null;
    const m = readMarketplace(workspaceId);
    return extensionActive(m, LOYALTY_EXTENSION_ID) ? m.installed[LOYALTY_EXTENSION_ID] : null;
  }, [workspaceId]);
  if (!rec) return null;
  const bal = loyaltyBalance(data, phone, rec.installedAt);
  if (!bal) return null;
  const saved = unusedLoyaltyCode(data, phone);
  const usingPoints = !!saved && saved.code === code;
  if (!saved && bal.balance === 0) return null;

  const redeem = () => {
    if (saved) {
      onApply(saved.code);
      return;
    }
    let made = '';
    const ok = apply((d) => {
      const r = redeemPoints(d, phone, rec.installedAt);
      if (!r) return d;
      made = r.code;
      return r.data;
    });
    if (ok && made) onApply(made);
  };

  const muted = { color: theme.mutedText };
  return (
    <div className="flex flex-col gap-2 rounded-md px-3 py-3" style={{ background: mix(theme.text, 5) }} aria-live="polite">
      <p className="flex items-center gap-2 text-[13.5px] font-semibold">
        <AwardIcon size={15} aria-hidden />
        {usingPoints ? `Points code ${saved?.code} applied — ${formatNgn(REDEEM_NGN)} off` : `You have ${bal.balance.toLocaleString()} points`}
      </p>
      {usingPoints ?
      <p className="text-[12.5px]" style={muted}>
          If you don’t finish now, the code still works once on your next order.
        </p> :
      saved ?
      <>
          <p className="text-[12.5px]" style={muted}>
            You already turned {REDEEM_POINTS} points into code {saved.code}. It replaces any other code on this order.
          </p>
          <button type="button" onClick={redeem} className="h-11 self-start px-4 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ ...cardStyle(theme), borderRadius: 999 }}>
            Use code {saved.code}
          </button>
        </> :
      bal.balance >= REDEEM_POINTS ?
      <>
          <p className="text-[12.5px]" style={muted}>
            Use {REDEEM_POINTS} for {formatNgn(REDEEM_NGN)} off. It replaces any other code on this order.
          </p>
          <button type="button" onClick={redeem} className="h-11 self-start px-4 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ ...cardStyle(theme), borderRadius: 999 }}>
            Use {REDEEM_POINTS} points
          </button>
        </> :

      <p className="text-[12.5px]" style={muted}>
          {REDEEM_POINTS - bal.balance} more to {formatNgn(REDEEM_NGN)} off. You earn 1 point for every ₦100.
        </p>
      }
    </div>);

}