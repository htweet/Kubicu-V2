import { useWorkspace } from '../contexts/WorkspaceContext';
import { useLocalStore } from './useLocalStore';
import { providerById, type ProviderCategory } from '../data/providers';
import { uid } from '../utils/id';

export interface ProviderConnection {
  values: Record<string, string>;
  connectedAt: string;
  lastTest?: { ok: boolean; at: string; message: string };
}

export interface ProviderLogEntry {
  id: string;
  at: string;
  providerId: string;
  action: string;
  ok: boolean;
  detail: string;
}

export interface ProvidersData {
  connections: Record<string, ProviderConnection>;
  /** The provider each category uses when more than one is connected. */
  defaults: Partial<Record<ProviderCategory, string>>;
  log: ProviderLogEntry[];
}

const empty = (): ProvidersData => ({ connections: {}, defaults: {}, log: [] });

/** Per-workspace provider connections, kept in this browser (D192). */
export function useProviders() {
  const { current } = useWorkspace();
  const { data, update } = useLocalStore<ProvidersData>(`kubicu.providers.${current.id}`, empty);

  const connected = (id: string) => !!providerById(id)?.builtIn || !!data.connections[id];
  /** The provider in use for a category: the chosen default if connected, else the first connected. */
  const active = (c: ProviderCategory) => {
    const chosen = data.defaults[c];
    if (chosen && connected(chosen)) return providerById(chosen);
    const first = Object.keys(data.connections).map(providerById).find((p) => p?.category === c);
    if (first) return first;
    return c === 'storage' ? providerById('browser') : undefined;
  };

  const log = (providerId: string, action: string, ok: boolean, detail: string) =>
    update((d) => ({ ...d, log: [{ id: uid('plog'), at: new Date().toISOString(), providerId, action, ok, detail }, ...d.log].slice(0, 40) }));

  const connect = (id: string, values: Record<string, string>, message: string) =>
    update((d) => {
      const def = providerById(id);
      const at = new Date().toISOString();
      const defaults = def && !d.defaults[def.category] ? { ...d.defaults, [def.category]: id } : d.defaults;
      return { ...d, defaults, connections: { ...d.connections, [id]: { values, connectedAt: at, lastTest: { ok: true, at, message } } } };
    });

  const disconnect = (id: string) =>
    update((d) => {
      const { [id]: _gone, ...rest } = d.connections;
      const def = providerById(id);
      const defaults = { ...d.defaults };
      if (def && defaults[def.category] === id) delete defaults[def.category];
      return { ...d, connections: rest, defaults };
    });

  const setDefault = (c: ProviderCategory, id: string) => update((d) => ({ ...d, defaults: { ...d.defaults, [c]: id } }));

  const recordTest = (id: string, ok: boolean, message: string) =>
    update((d) => (d.connections[id] ? { ...d, connections: { ...d.connections, [id]: { ...d.connections[id], lastTest: { ok, at: new Date().toISOString(), message } } } } : d));

  return { data, connected, active, connect, disconnect, setDefault, recordTest, log };
}

/** "pk_test_…a1b2" — never show a whole secret. */
export function maskSecret(v: string): string {
  if (!v) return '';
  return v.length <= 8 ? '••••' : `${v.slice(0, Math.min(8, v.length - 4))}…${v.slice(-4)}`;
}
