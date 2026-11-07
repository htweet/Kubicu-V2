import type { ProviderDef, ProviderField } from '../../data/providers';

/*
 * Placeholder adapters (D192). Each call checks credential shapes and then simulates the provider,
 * so screens can be built and tested end to end. Swap these bodies for real API calls (from a
 * server, never the browser) when providers are chosen — callers don't change.
 */

export type SimulatedOutcome = 'success' | 'rejected' | 'down';

export interface AdapterResult {
  ok: boolean;
  message: string;
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Format problems per field, plus refusal of live keys in the prototype. */
export function fieldErrors(def: ProviderDef, values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  def.fields.forEach((f: ProviderField) => {
    const v = (values[f.key] ?? '').trim();
    if (!v) {
      if (!f.optional) out[f.key] = `Enter the ${f.label.toLowerCase()}.`;
      return;
    }
    if (f.livePattern?.test(v)) {
      out[f.key] = 'That’s a live key. This prototype only accepts test keys — never paste live keys here.';
      return;
    }
    if (f.pattern && !f.pattern.test(v)) out[f.key] = f.patternMessage ?? 'That doesn’t look right.';
  });
  return out;
}

async function run(def: ProviderDef, outcome: SimulatedOutcome, success: string): Promise<AdapterResult> {
  await wait(700);
  if (outcome === 'rejected') return { ok: false, message: `${def.name} didn’t accept these credentials (simulated). Check they’re test keys from the right account.` };
  if (outcome === 'down') return { ok: false, message: `${def.name} didn’t respond in time (simulated). Nothing was changed — try again in a moment.` };
  return { ok: true, message: success };
}

export function testConnection(def: ProviderDef, outcome: SimulatedOutcome): Promise<AdapterResult> {
  return run(def, outcome, `Connected to ${def.name} in test mode (simulated — no request was made).`);
}

export function sendTestMessage(def: ProviderDef, to: string, outcome: SimulatedOutcome): Promise<AdapterResult> {
  return run(def, outcome, `Test ${def.category === 'email' ? 'email' : 'message'} to ${to} accepted by ${def.name} (simulated — nothing was delivered).`);
}

export function addDnsRecords(def: ProviderDef, host: string, count: number, outcome: SimulatedOutcome): Promise<AdapterResult> {
  return run(def, outcome, `${count} record${count === 1 ? '' : 's'} added for ${host} in ${def.name} (simulated). We’ll check them now.`);
}

export function checkStorage(def: ProviderDef, outcome: SimulatedOutcome): Promise<AdapterResult> {
  return run(def, outcome, `Wrote and read a test file in ${def.name} (simulated). New uploads would go here.`);
}
