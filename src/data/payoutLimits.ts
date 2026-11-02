import type { CountryCode } from '../types/country';
import type { KycTier } from '../types/money';
import { figure, onOpsSettings } from '../utils/opsSettings';

/**
 * Payout limits and payout costs for each country, in that country's own currency (D432).
 * EXAMPLE FIGURES — rounded to local habits, not converted. Confirm each one with the licensed payment partner
 * in that country before launch (listed in NOT_FOR_PRODUCTION.md).
 */
export interface TierLimit {
  /** Most that can be paid out in one day. */
  daily: number;
  /** Most the wallet can hold, or null for no cap. */
  cap: number | null;
}

export interface PayoutRules {
  limits: Record<KycTier, TierLimit>;
  /** Fee for a payout you start yourself; scheduled payouts are free. */
  manualFee: number;
  /** Hours before a sale becomes available to pay out. */
  settleHours: number;
  /** Smallest scheduled payout worth sending. */
  minAuto: number;
  /** Largest single transfer to a mobile money wallet, or null when there's no wallet limit (e.g. M-Pesa KSh 250,000). */
  walletMaxPerTransfer: number | null;
}

export const payoutRules: Record<CountryCode, PayoutRules> = {
  NG: {
    limits: { 0: { daily: 0, cap: 300_000 }, 1: { daily: 50_000, cap: 300_000 }, 2: { daily: 2_000_000, cap: 10_000_000 }, 3: { daily: 20_000_000, cap: null } },
    manualFee: 50,
    settleHours: 24,
    minAuto: 1_000,
    walletMaxPerTransfer: null
  },
  KE: {
    limits: { 0: { daily: 0, cap: 25_000 }, 1: { daily: 5_000, cap: 25_000 }, 2: { daily: 150_000, cap: 800_000 }, 3: { daily: 1_500_000, cap: null } },
    manualFee: 10,
    settleHours: 24,
    minAuto: 100,
    walletMaxPerTransfer: 250_000
  },
  GH: {
    limits: { 0: { daily: 0, cap: 2_500 }, 1: { daily: 400, cap: 2_500 }, 2: { daily: 15_000, cap: 80_000 }, 3: { daily: 150_000, cap: null } },
    manualFee: 1,
    settleHours: 24,
    minAuto: 10,
    walletMaxPerTransfer: 20_000
  },
  ZA: {
    limits: { 0: { daily: 0, cap: 3_500 }, 1: { daily: 600, cap: 3_500 }, 2: { daily: 25_000, cap: 120_000 }, 3: { daily: 250_000, cap: null } },
    manualFee: 5,
    settleHours: 24,
    minAuto: 15,
    walletMaxPerTransfer: null
  }
};

// Staff can change every figure above in Super admin → Figures & names (D466).
onOpsSettings(() => {
  (Object.keys(payoutRules) as CountryCode[]).forEach((c) => {
    const r = payoutRules[c];
    const f = (k: string) => figure(`payout.${c}.${k}`);
    r.limits[1].daily = f('daily1');
    r.limits[2].daily = f('daily2');
    r.limits[3].daily = f('daily3');
    r.limits[0].cap = f('cap0');
    r.limits[1].cap = f('cap0');
    r.limits[2].cap = f('cap2');
    r.manualFee = f('manualFee');
    r.minAuto = f('minAuto');
    r.settleHours = f('settleHours');
    if (r.walletMaxPerTransfer !== null) r.walletMaxPerTransfer = f('walletMax');
  });
});