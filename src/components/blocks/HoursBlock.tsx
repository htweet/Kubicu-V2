import React from 'react';
import { ClockIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { cardStyle, fontsFor, mix } from './pageStyle';
import { dayInRange, openStatus, summarizeHours, timeZoneName, zonedNow } from '../../utils/openHours';
import { useNow } from '../../hooks/useNow';
import { useT } from '../../contexts/LocaleContext';

/**
 * Business hours (D169): grouped days, today marked in words (not colour alone), and a live open-now label.
 * Day names, status and the time-zone line follow the visitor's language (D504); the title and note stay as written.
 */
export function HoursBlock({ block, theme, mode }: BlockProps<'hours'>) {
  const { t: tr } = useT();
  const c = block.content;
  const now = useNow(60_000);
  if (c.hours.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={ClockIcon} title="Set your hours" hint="Days you’re closed can be marked closed" theme={theme} /> : null;
  const status = openStatus(c.hours, c.timeZone, new Date(now), tr);
  const rows = summarizeHours(c.hours, tr);
  const today = zonedNow(c.timeZone, new Date(now)).day;
  return (
    <section className="p-5 md:p-6" style={cardStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[19px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title || tr('Opening hours')}</h2>
        {status && <PageChip theme={theme} tone={status.open ? 'strong' : 'muted'}>{status.open ? tr('Open now') : tr('Closed')}</PageChip>}
      </div>
      {status && <p className="mt-2 text-[14px] font-medium" style={{ color: theme.text }}>{status.label}</p>}
      <dl className="mt-4 flex flex-col">
        {rows.map((r) => {
          const on = dayInRange(today, r.start, r.end);
          return (
            <div key={r.days} className="flex justify-between gap-3 py-2 text-[14px]" style={{ borderTop: `1px solid ${mix(theme.text, 8)}`, fontWeight: on ? 600 : undefined }}>
              <dt style={{ color: on ? theme.text : theme.mutedText }}>
                {r.days}
                {on && <span className="ml-1.5 text-[12px] font-semibold">· {tr('today')}</span>}
              </dt>
              <dd className="tabular-nums" style={{ color: theme.text }}>{r.time}</dd>
            </div>
          );
        })}
      </dl>
      {c.note && <p className="mt-3 text-[13px] leading-snug" style={{ color: theme.mutedText }}>{c.note}</p>}
      <p className="mt-2 text-[11px]" style={{ color: theme.mutedText }}>{tr('Times in {zone}.', { zone: timeZoneName(c.timeZone, tr) })}</p>
    </section>
  );
}
