/**
 * Kiswahili, Twi and isiZulu drafts (D356). Each pass file holds rows of [English, Kiswahili, Twi, isiZulu],
 * the same idea as the four Nigerian columns. DRAFTS — every line needs a native speaker's check.
 */
export type Row3 = [string, string, string, string];
export type Dict = Record<string, string>;

export function columns(rows: Row3[]): { sw: Dict; tw: Dict; zu: Dict } {
  const pick = (i: 1 | 2 | 3): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));
  return { sw: pick(1), tw: pick(2), zu: pick(3) };
}
