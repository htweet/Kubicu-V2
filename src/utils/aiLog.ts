/** A redacted log of AI requests for Super admin → AI operations (D135). No prompts, drafts or customer content are stored. */
export interface AiLogEntry {
  id: string;
  at: string;
  workspaceId: string;
  workspaceName: string;
  feature: string;
  credits: number;
  outcome: 'ok' | 'blocked' | 'failed';
  /** For blocked/failed requests: which rule or error, in plain words. */
  note?: string;
  sample?: boolean;
}

const KEY = 'kubicu.ai.log';
const CAP = 200;
const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

const samples: AiLogEntry[] = [
{ id: 'ail-s1', at: ago(2), workspaceId: 'sample', workspaceName: 'Ade’s Kitchen', feature: 'Block suggestions', credits: 1, outcome: 'ok', sample: true },
{ id: 'ail-s2', at: ago(5), workspaceId: 'sample', workspaceName: 'Lekki Lash Bar', feature: 'AI page setup', credits: 0, outcome: 'blocked', note: 'Asked to write customer reviews — “never invent reviews” rule', sample: true },
{ id: 'ail-s3', at: ago(9), workspaceId: 'sample', workspaceName: 'Glow by Halima', feature: 'Print kit writing helper', credits: 1, outcome: 'ok', sample: true },
{ id: 'ail-s4', at: ago(14), workspaceId: 'sample', workspaceName: 'Ade’s Kitchen', feature: 'Business Coach', credits: 0, outcome: 'failed', note: 'Timed out — no credit used', sample: true },
{ id: 'ail-s5', at: ago(20), workspaceId: 'sample', workspaceName: 'Kano Leather Works', feature: 'Block suggestions', credits: 0, outcome: 'blocked', note: 'Asked for a “guaranteed delivery in 24 hours” promise — delivery promises rule', sample: true },
{ id: 'ail-s6', at: ago(30), workspaceId: 'sample', workspaceName: 'Lekki Lash Bar', feature: 'AI page setup', credits: 5, outcome: 'ok', sample: true }];


export function readAiLog(): AiLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AiLogEntry[];
  } catch {

    /* fall through */}
  return samples;
}

export function logAiRequest(e: Omit<AiLogEntry, 'id' | 'at'>) {
  try {
    const next = [{ ...e, id: `ail_${Date.now().toString(36)}`, at: new Date().toISOString() }, ...readAiLog()].slice(0, CAP);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {

    /* storage blocked — the log is best-effort */}
}