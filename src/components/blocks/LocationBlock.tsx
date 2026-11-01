import React from 'react';
import { MapPinIcon, NavigationIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { openStatus, summarizeHours, timeZoneName } from '../../utils/openHours';
import { useNow } from '../../hooks/useNow';
import { useT } from '../../contexts/LocaleContext';

/** Address, hours and directions. Fixed wording follows the visitor's language (D504); the name, address and note stay as written. */
export function LocationBlock({ block, theme, mode }: BlockProps<'location'>) {
  const { t: tr } = useT();
  const c = block.content;
  const now = useNow(60_000);
  if (!c.address.trim()) {
    return mode === 'edit' ? <BlockPlaceholder icon={MapPinIcon} title="Add your address" hint="Plus opening hours for an open-now badge" theme={theme} /> : null;
  }
  const status = openStatus(c.hours, c.timeZone, new Date(now), tr);
  const rows = summarizeHours(c.hours, tr);
  const query = encodeURIComponent(`${c.name ? `${c.name}, ` : ''}${c.address}`);

  return (
    <section className="p-5" style={cardStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.name || tr('Visit us')}</h2>
          <p className="mt-1 whitespace-pre-line text-[14px] leading-snug" style={{ color: theme.mutedText }}>{c.address}</p>
        </div>
        {status && <PageChip theme={theme} tone={status.open ? 'strong' : 'muted'}>{status.open ? tr('Open now') : tr('Closed')}</PageChip>}
      </div>
      {status && <p className="mt-3 text-[13px] font-medium" style={{ color: theme.text }}>{status.label}</p>}
      {rows.length > 0 &&
      <dl className="mt-3 flex flex-col">
          {rows.map((r) =>
        <div key={r.days} className="flex justify-between gap-3 py-1.5 text-[13px]" style={{ borderTop: `1px solid ${mix(theme.text, 8)}` }}>
              <dt style={{ color: theme.mutedText }}>{r.days}</dt>
              <dd className="tabular-nums" style={{ color: theme.text }}>{r.time}</dd>
            </div>
        )}
        </dl>
      }
      {c.note && <p className="mt-3 text-[13px] leading-snug" style={{ color: theme.mutedText }}>{c.note}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <PageAction mode={mode} href={`https://www.google.com/maps/search/?api=1&query=${query}`} className="flex h-11 items-center justify-center gap-1.5 text-[14px] font-semibold" style={buttonStyle(theme, 'featured')}>
          <NavigationIcon size={15} aria-hidden />
          {tr('Directions')}
        </PageAction>
        <PageAction mode={mode} href={`https://www.openstreetmap.org/search?query=${query}`} className="flex h-11 items-center justify-center text-[14px] font-medium" style={buttonStyle(theme, 'default')}>
          OpenStreetMap
        </PageAction>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: theme.mutedText }}>{tr('Hours shown in {zone}. No map is loaded, to save your data.', { zone: timeZoneName(c.timeZone, tr) })}</p>
    </section>);

}