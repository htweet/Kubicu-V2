import type { MobileNetwork } from '../types/country';

/**
 * Helpers for the simulated mobile money and instant EFT flows (D433). Nothing is sent anywhere — the codes look
 * like real confirmation codes so receipts and support conversations can be designed around them.
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

/** An M-Pesa style confirmation code: 10 capitals and digits, e.g. "SKJ4H7XQ2P". */
export function mpesaCode(): string {
  let out = '';
  for (let i = 0; i < 10; i++) out += i === 3 || i === 6 || i === 8 ? String(Math.floor(Math.random() * 10)) : pick(LETTERS);
  return out;
}

/** A mobile money transaction ID, e.g. "7841 2290 5531". */
export function momoTransactionId(): string {
  return Array.from({ length: 3 }, () => String(Math.floor(1000 + Math.random() * 9000))).join(' ');
}

/** An EFT reference, e.g. "EFT-48K2QP". */
export function eftReference(): string {
  let out = 'EFT-';
  for (let i = 0; i < 6; i++) out += i % 2 ? String(Math.floor(Math.random() * 10)) : pick(LETTERS);
  return out;
}

/** The network a Ghanaian number belongs to, from its first digits (024…, 020…, 026…). Null when unsure. */
export function guessNetwork(networks: MobileNetwork[], phone: string): MobileNetwork | null {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('233') ? `0${digits.slice(3)}` : digits.startsWith('0') ? digits : `0${digits}`;
  if (local.length < 3) return null;
  return networks.find((n) => n.prefixes.some((p) => local.startsWith(p))) ?? null;
}

/** A 6-digit voucher looks right (Telecel Cash asks buyers to make one and type it in). */
export const voucherOk = (v: string) => /^\d{6}$/.test(v.trim());
