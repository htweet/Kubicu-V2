import { useMemo } from 'react';
import type { Order } from '../types/commerce';
import { useMoney } from './useMoney';
import { useProof } from './useProof';
import { readMarketplace, extensionActive } from '../utils/marketplace';
import { TRUST_APP_ID, computePassport } from '../utils/trustPassport';

/**
 * A workspace's Trust Passport worked out at the moment it's viewed (D111), so a badge can never
 * show a level the seller has since lost. Sample records never count (computePassport skips them).
 */
export function usePublicPassport(workspaceId: string, orders: Order[]) {
  const money = useMoney(workspaceId);
  const proof = useProof(workspaceId);
  // Read on every render (cheap) so installing or pausing the app shows up without a reload.
  const appOn = extensionActive(readMarketplace(workspaceId), TRUST_APP_ID);
  const passport = useMemo(() => computePassport(orders, money.data, proof.data), [orders, money.data, proof.data]);
  return { passport, appOn };
}