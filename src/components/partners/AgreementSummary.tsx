import React from 'react';
import { CheckCircle2Icon, CircleDashedIcon } from 'lucide-react';
import type { Agreement } from '../../types/partnership';
import { agreementLines } from '../../utils/partnerships';
import { formatTimestamp } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';

/**
 * The agreement in plain words, with who has accepted this version.
 * The numbered agreement lines stay English: both businesses accept the same wording, whatever language each one's screen is in.
 */
export function AgreementSummary({ agreement: a, leadName, partnerName, title }: { agreement: Agreement; leadName: string; partnerName: string; title?: string }) {
  const { t: tr } = useT();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-label font-semibold text-fg">{title ?? tr('Agreement')}</p>
        <span className="text-caption text-fg-subtle">{tr('Version {n}', { n: a.version })}</span>
      </div>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-label text-fg-muted marker:text-fg-subtle">
        {agreementLines(a, leadName, partnerName).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ol>
      <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-caption">
        {([
          ['lead', leadName],
          ['partner', partnerName],
        ] as const).map(([side, name]) => {
          const at = a.acceptedBy[side];
          return (
            <li key={side} className="flex items-center gap-2">
              {at ? <CheckCircle2Icon size={14} className="text-success" aria-hidden /> : <CircleDashedIcon size={14} className="text-fg-subtle" aria-hidden />}
              <span className={at ? 'text-fg' : 'text-fg-muted'}>{at ? tr('{name} accepted · {when}', { name, when: formatTimestamp(at) }) : tr('{name} — not accepted yet', { name })}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
