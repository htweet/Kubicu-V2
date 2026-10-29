import type { MoneyData } from '../types/money';
import type { AdminStore } from '../types/admin';
import { useMoney } from './useMoney';
import { flagOn, useAdminStore } from '../utils/admin/store';
import { isVerified } from '../utils/money/store';

export interface VerifiedTick {
  /** Show the tick on public pages. */
  shown: boolean;
  /** Verified, but KUBICU staff have hidden the tick (whole platform or this workspace). */
  hiddenByKubicu: boolean;
  /** Plain words for the tooltip/screen readers — never the person's legal name. */
  label: string;
}

/**
 * The "Verified by KUBICU" tick (D254). Only a KUBICU-approved verification earns it; operations can switch
 * it off for everyone (Feature flags → Verified tick) or hide it for one workspace without withdrawing approval.
 */
export function verifiedTickFor(money: MoneyData, store: AdminStore, workspaceId: string): VerifiedTick {
  const verified = isVerified(money);
  const platformOn = flagOn(store, 'verified_tick');
  const hiddenHere = !!store.verifiedTickOff?.[workspaceId];
  const k = money.kyc;
  const label = k.entity && k.entity !== 'individual' ? `Business verified by KUBICU${k.business.registeredName ? ` · ${k.business.registeredName}` : ''}` : 'Identity verified by KUBICU';
  return { shown: verified && platformOn && !hiddenHere, hiddenByKubicu: verified && (!platformOn || hiddenHere), label };
}

export function useVerifiedTick(workspaceId: string): VerifiedTick {
  const money = useMoney(workspaceId);
  const [store] = useAdminStore();
  return verifiedTickFor(money.data, store, workspaceId);
}