import React from 'react';
import { TimerIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { remainingUntil } from '../../utils/eventTime';
import { useNow } from '../../hooks/useNow';
import { useT } from '../../contexts/LocaleContext';
import { dateLocale } from '../../utils/localeFormat';

/**
 * Counts down to the owner's real date. At zero it shows the ended message — it never restarts.
 * Unit names and fixed lines follow the visitor's language (D504); the title, ended message and link label stay as written.
 */
export function CountdownBlock({ block, theme, mode }: BlockProps<'countdown'>) {
  const { t: tr, lang } = useT();
  const c = block.content;
  const now = useNow(1000);
  const left = remainingUntil(c.target, now);
  if (!left) {
    return mode === 'edit' ? <BlockPlaceholder icon={TimerIcon} title="Set a real date" hint="The countdown only runs to a date you choose" theme={theme} /> : null;
  }

  const units = [
  { key: 'days', label: tr('days'), value: left.days },
  { key: 'hours', label: tr('hours'), value: left.hours },
  { key: 'mins', label: tr('mins'), value: left.minutes },
  { key: 'secs', label: tr('secs'), value: left.seconds }];

  const target = new Date(c.target as string);
  const ended = c.endedMessage || tr('It’s here.');

  return (
    <section className="p-5 text-center" style={cardStyle(theme)} aria-label={c.title || tr('Countdown')}>
      {c.title &&
      <h2 className="text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {left.done ? ended : c.title}
        </h2>
      }
      {!left.done ?
      <>
          {/* Visual digits are hidden from screen readers; a single readable sentence replaces them. */}
          <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden>
            {units.map((u) =>
          <div key={u.key} className="min-w-0 rounded-lg py-3" style={{ background: mix(theme.text, 6) }}>
                <p className="text-[26px] font-semibold leading-none tabular-nums" style={{ color: theme.text }}>{String(u.value).padStart(2, '0')}</p>
                <p className="mt-1 truncate px-1 text-[11px]" style={{ color: theme.mutedText }}>{u.label}</p>
              </div>
          )}
          </div>
          <p className="sr-only">{tr('Time to go — days: {d}, hours: {h}, minutes: {m}.', { d: left.days, h: left.hours, m: left.minutes })}</p>
          <p className="mt-3 text-[12px]" style={{ color: theme.mutedText }}>
            {tr('Ends {when}', { when: target.toLocaleString(dateLocale(lang), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) })}
          </p>
        </> :

      !c.title && <p className="text-[16px] font-medium" style={{ color: theme.text }}>{ended}</p>
      }
      {c.linkLabel && c.url &&
      <PageAction mode={mode} href={c.url} className="mt-4 flex h-11 w-full items-center justify-center text-[14px] font-semibold" style={buttonStyle(theme, 'featured')}>
          {c.linkLabel}
        </PageAction>
      }
    </section>);

}