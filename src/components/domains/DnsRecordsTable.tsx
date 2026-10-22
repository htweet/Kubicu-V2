import React from 'react';
import { CopyIcon } from 'lucide-react';
import type { DnsRecord } from '../../utils/domains/dns';
import { copyToClipboard } from '../../utils/clipboard';

/** The records to add at the registrar — a list on phones, a table from md up. */
export function DnsRecordsTable({ records }: {records: DnsRecord[];}) {
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="hidden w-full text-label md:table">
        <thead>
          <tr className="border-b border-line bg-sunken text-caption text-fg-subtle">
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Name / Host</th>
            <th className="px-3 py-2 text-left font-medium">Value / Points to</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) =>
          <tr key={`${r.type}-${r.name}`} className="border-b border-line last:border-0 align-top">
              <td className="px-3 py-2.5 font-mono text-caption font-semibold text-fg">{r.type}</td>
              <td className="px-3 py-2.5">
                <CopyCell value={r.name} label="Name" />
              </td>
              <td className="px-3 py-2.5">
                <CopyCell value={r.value} label="Value" />
                <p className="mt-1 text-caption text-fg-subtle">{r.purpose}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ul className="divide-y divide-line md:hidden">
        {records.map((r) =>
        <li key={`${r.type}-${r.name}`} className="flex flex-col gap-2 p-3">
            <p className="text-caption text-fg-subtle">
              <span className="font-mono font-semibold text-fg">{r.type}</span> · {r.purpose}
            </p>
            <CopyCell value={r.name} label="Name" showLabel />
            <CopyCell value={r.value} label="Value" showLabel />
          </li>
        )}
      </ul>
    </div>);

}

function CopyCell({ value, label, showLabel }: {value: string;label: string;showLabel?: boolean;}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {showLabel && <span className="w-12 shrink-0 text-caption text-fg-subtle">{label}</span>}
      <code className="min-w-0 flex-1 break-all rounded-sm bg-sunken px-1.5 py-1 font-mono text-caption text-fg">{value}</code>
      <button
        type="button"
        onClick={() => copyToClipboard(value, `${label} copied`)}
        aria-label={`Copy ${label.toLowerCase()} ${value}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-fg-muted transition-colors duration-150 ease-out hover:bg-sunken hover:text-fg">
        
        <CopyIcon size={14} aria-hidden />
      </button>
    </div>);

}