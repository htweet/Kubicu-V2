import React, { useMemo } from 'react';
import type { Contact, ContactSource } from '../../types/ops';
import type { SourceId } from '../../types/analytics';
import { sourceLabels } from '../../data/audience';
import { useDomains } from '../../contexts/DomainsContext';
import { useT } from '../../contexts/LocaleContext';

const channelLabels: Record<SourceId, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X',
  google: 'Google',
  qr: 'QR code',
  campaign: 'Campaign link',
  direct: 'Direct or unknown',
  other: 'Another site'
};

interface Row {
  key: string;
  label: string;
  total: number;
  subscribed: number;
}

function tally<K extends string>(contacts: Contact[], keyOf: (c: Contact) => K[] | K | null, labelOf: (k: K) => string): Row[] {
  const map = new Map<K, Row>();
  contacts.forEach((c) => {
    const ks = keyOf(c);
    (Array.isArray(ks) ? ks : ks ? [ks] : []).forEach((k) => {
      const r = map.get(k) ?? { key: k, label: labelOf(k), total: 0, subscribed: 0 };
      r.total += 1;
      if (c.consent === 'subscribed') r.subscribed += 1;
      map.set(k, r);
    });
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/**
 * Where contacts came from (D268): by way in (form, order…), by channel, and by short link. Channel and
 * link are the first touch recorded when they gave their details — anonymous clicks never appear here.
 */
export function AudienceSources({ contacts, onPickCampaign }: {contacts: Contact[];onPickCampaign: (slug: string) => void;}) {
  const { t } = useT();
  const links = useDomains().data.links;
  const byWay = useMemo(() => tally<ContactSource>(contacts, (c) => c.sources, (k) => t(sourceLabels[k])), [contacts, t]);
  const byChannel = useMemo(() => tally<SourceId>(contacts, (c) => c.attribution?.channel ?? null, (k) => channelLabels[k]), [contacts]);
  const byLink = useMemo(() => tally<string>(contacts, (c) => c.attribution?.campaign ?? null, (k) => links.find((l) => l.slug === k)?.name ?? `/s/${k}`), [contacts, links]);
  const untracked = contacts.filter((c) => !c.attribution).length;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-3">
      <Table title="Way in" rows={byWay} />
      <Table title="Channel" rows={byChannel} empty="Channels are recorded for sign-ups from now on." />
      <Table title="Short link" rows={byLink} empty="No one has signed up through a short link yet." onPick={onPickCampaign} />
      {untracked > 0 && <p className="text-caption text-fg-subtle lg:col-span-3">{untracked} contacts were added before channels were recorded, by import or by hand, so they only show under “Way in”.</p>}
    </div>);

}

function Table({ title, rows, empty, onPick }: {title: string;rows: Row[];empty?: string;onPick?: (k: string) => void;}) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <section aria-label={title} className="rounded-lg border border-line bg-raised p-4">
      <h2 className="text-label font-semibold text-fg">{title}</h2>
      {rows.length === 0 ?
      <p className="mt-3 text-caption text-fg-muted">{empty}</p> :

      <table className="mt-3 w-full text-label">
          <thead className="sr-only">
            <tr>
              <th scope="col">{title}</th>
              <th scope="col">Contacts</th>
              <th scope="col">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
          <tr key={r.key} className="border-t border-line first:border-t-0">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  {onPick ?
              <button type="button" onClick={() => onPick(r.key)} className="text-left text-fg underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      {r.label}
                    </button> :

              <span className="text-fg">{r.label}</span>
              }
                  <span className="mt-1 block h-1 rounded-full bg-sunken" aria-hidden>
                    <span className="block h-full rounded-full bg-action" style={{ width: `${r.total / max * 100}%` }} />
                  </span>
                </th>
                <td className="py-2 text-right font-semibold tabular-nums text-fg">{r.total}</td>
                <td className="w-24 py-2 text-right text-caption tabular-nums text-fg-subtle">{r.subscribed} subscribed</td>
              </tr>
          )}
          </tbody>
        </table>
      }
    </section>);

}