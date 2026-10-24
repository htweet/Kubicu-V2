/** A short, readable code for a proof-of-work certificate (D126), stable for the same work item. */
export function certificateCode(workId: string): string {
  let h = 2166136261;
  for (let i = 0; i < workId.length; i++) {
    h ^= workId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // No 0/O or 1/I, so it reads cleanly over the phone.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let n = h >>> 0;
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) || h >>> i + 3;
  }
  return `KW-${out.slice(0, 3)}-${out.slice(3)}`;
}