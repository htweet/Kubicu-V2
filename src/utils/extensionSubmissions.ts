import { useCallback, useEffect, useState } from 'react';
import type { ExtensionSubmission, SubmissionEvent, SubmissionStore } from '../types/extensionSubmission';
import type { ExtensionInfo } from '../types/marketplace';
import type { WorkspacePlan } from '../types/plan';
import { extensionById } from '../data/extensions';
import { scopeLabel, webhookEvents } from '../data/developerApi';
import { uid } from './id';

/**
 * Developer-submitted extensions (D132). ONE browser-wide key so the developer's workspace, the staff
 * review queue and every workspace's catalogue see the same submissions — standing in for a server.
 */
const KEY = 'kubicu.extensionSubmissions';
const EVENT = 'kubicu:extension-submissions';
const DAY = 86400000;

export const DEV_SHARE = 0.8;

/**
 * Highest monthly price a developer may charge, by the developer's own plan (D134, example figures).
 * Free can't submit; the higher the plan, the higher the cap.
 */
export const DEV_PRICE_CAP_NGN: Record<WorkspacePlan, number | null> = {
  free: null,
  creator: 5000,
  pro: 15000,
  business: 25000,
  agency: 50000,
  enterprise: 100000,
};

export const canSubmitExtensions = (plan: WorkspacePlan) => DEV_PRICE_CAP_NGN[plan] !== null;
export const priceCapFor = (plan: WorkspacePlan) => DEV_PRICE_CAP_NGN[plan] ?? 0;

const empty = (): SubmissionStore => ({ submissions: [], seeded: false });

export function readSubmissions(): SubmissionStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: SubmissionStore = raw ? { ...empty(), ...(JSON.parse(raw) as Partial<SubmissionStore>) } : empty();
    const store = parsed.seeded ? parsed : { submissions: [...parsed.submissions, ...seed()], seeded: true };
    if (!parsed.seeded) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(store));
      } catch {
        /* storage full — sample stays in memory */
      }
    }
    registerListed(store);
    return store;
  } catch {
    return empty();
  }
}

export function updateSubmissions(fn: (s: SubmissionStore) => SubmissionStore): boolean {
  try {
    const next = fn(readSubmissions());
    window.localStorage.setItem(KEY, JSON.stringify(next));
    registerListed(next);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

export function useSubmissions(): [SubmissionStore, (fn: (s: SubmissionStore) => SubmissionStore) => boolean] {
  const [store, setStore] = useState<SubmissionStore>(() => readSubmissions());
  useEffect(() => {
    const sync = () => setStore(readSubmissions());
    const onStorage = (e: StorageEvent) => e.key === KEY && sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return [store, useCallback(updateSubmissions, [])];
}

export const subEvent = (label: string, by: SubmissionEvent['by']): SubmissionEvent => ({ id: uid('sev'), at: new Date().toISOString(), label, by });

/** Shapes an approved submission like a catalogue extension so the same list, detail and install screens work. */
export function asExtension(s: ExtensionSubmission): ExtensionInfo {
  return {
    id: s.id,
    name: s.name,
    publisher: s.developerName,
    verified: 'community',
    category: s.category,
    summary: s.summary,
    description: s.description,
    adds: s.adds,
    permissions: [
      ...s.scopes.map(scopeLabel),
      ...(s.events.length ? [`Receive events: ${s.events.map((e) => webhookEvents.find((x) => x.id === e)?.label.toLowerCase() ?? e).join(', ')}`] : []),
      `Opens ${hostOf(s.appUrl)} for setup`,
    ],
    minPlan: s.minPlan,
    priceNgn: s.priceNgn,
    version: s.version,
    versions: [{ version: s.version, date: (s.listedAt ?? s.submittedAt).slice(0, 10), notes: s.releaseNotes || 'First release.' }],
    reviews: [],
    preview: true,
    uninstallNote: `${s.developerName} loses access straight away. Ask them to delete any data they copied — support: ${s.supportEmail}.`,
  };
}

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/** Listed community extensions join the shared catalogue lookup so install and detail screens resolve them. */
function registerListed(store: SubmissionStore) {
  store.submissions.forEach((s) => {
    if (s.status === 'listed') extensionById[s.id] = asExtension(s);
  });
}

export const listedCommunity = (store: SubmissionStore): ExtensionInfo[] => store.submissions.filter((s) => s.status === 'listed').map(asExtension);

function seed(): ExtensionSubmission[] {
  const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
  const base = {
    reviewNote: null,
    sample: true,
  };
  return [
    {
      ...base,
      id: 'cx_sabibooks',
      workspaceId: 'sample_sabibooks',
      developerName: 'SabiBooks Ltd',
      name: 'SabiBooks accounting sync',
      summary: 'Paid orders and refunds go straight into your SabiBooks ledger, with VAT split out.',
      description: 'Every paid order becomes a sales entry and every refund a credit note. Monthly profit and loss is ready without retyping receipts.',
      category: 'operations',
      adds: ['A sales entry for every paid order', 'Credit notes for refunds', 'VAT shown on its own line'],
      scopes: ['orders:read', 'products:read'],
      events: ['order.paid', 'order.refunded'],
      appUrl: 'https://app.sabibooks.ng/kubicu',
      supportEmail: 'help@sabibooks.ng',
      privacyUrl: 'https://sabibooks.ng/privacy',
      priceNgn: 1500,
      minPlan: 'business',
      version: '1.0.0',
      releaseNotes: 'First release.',
      status: 'listed',
      submittedAt: ago(16),
      listedAt: ago(14),
      history: [subEventAt('Approved and listed', 'staff', ago(14)), subEventAt('Submitted for review', 'developer', ago(16))],
    },
    {
      ...base,
      id: 'cx_kekeroute',
      workspaceId: 'sample_kekeroute',
      developerName: 'KekeRoute',
      name: 'KekeRoute dispatch board',
      summary: 'Plan today’s deliveries by area and send riders a route on WhatsApp.',
      description: 'Pulls paid delivery orders each morning, groups them by area and landmark, and builds a route for each rider.',
      category: 'operations',
      adds: ['Morning dispatch board grouped by area', 'One WhatsApp route per rider'],
      scopes: ['orders:read', 'orders:write'],
      events: ['order.paid'],
      appUrl: 'https://kekeroute.com/connect',
      supportEmail: 'support@kekeroute.com',
      privacyUrl: 'https://kekeroute.com/privacy',
      priceNgn: 0,
      minPlan: 'business',
      version: '0.9.0',
      releaseNotes: 'Beta for Lagos riders.',
      status: 'in_review',
      submittedAt: ago(1),
      listedAt: null,
      history: [subEventAt('Submitted for review', 'developer', ago(1))],
    },
  ];
}

function subEventAt(label: string, by: SubmissionEvent['by'], at: string): SubmissionEvent {
  return { id: uid('sev'), at, label, by };
}
