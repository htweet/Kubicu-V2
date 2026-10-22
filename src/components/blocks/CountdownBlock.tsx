import React from 'react';
import { TimerIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { remainingUntil } from '../../utils/eventTime';
import { useNow } from '../../hooks/useNow';

/** Counts down to the owner's real date. At zero it shows the ended message — it never restarts. */
export function CountdownBlock({ block, theme, mode }: BlockProps<'countdown'>) {
  const c = block.content;
  const now = useNow(1000);
  const left = remainingUntil(c.target, now);
  if (!left) {
    return mode === 'edit' ? <BlockPlaceholder icon={TimerIcon} title="Set a real date" hint="The countdown only runs to a date you choose" theme={theme} /> : null;
  }

  const units = [
  { label: 'days', value: left.days },
  { label: 'hours', value: left.hours },
  { label: 'mins', value: left.minutes },
  { label: 'secs', value: left.seconds }];

  const target = new Date(c.target as string);

  return (
    <section className="p-5 text-center" style={cardStyle(theme)} aria-label={c.title || 'Countdown'}>
      {c.title &&
      <h2 className="text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {left.done ? c.endedMessage || 'It’s here.' : c.title}
        </h2>
      }
      {!left.done ?
      <>
          {/* Visual digits are hidden from screen readers; a single readable sentence replaces them. */}
          <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden>
            {units.map((u) =>
          <div key={u.label} className="rounded-lg py-3" style={{ background: mix(theme.text, 6) }}>
                <p className="text-[26px] font-semibold leading-none tabular-nums" style={{ color: theme.text }}>{String(u.value).padStart(2, '0')}</p>
                <p className="mt-1 text-[11px]" style={{ color: theme.mutedText }}>{u.label}</p>
              </div>
          )}
          </div>
          <p className="sr-only">
            {left.days} days, {left.hours} hours and {left.minutes} minutes to go.
          </p>
          <p className="mt-3 text-[12px]" style={{ color: theme.mutedText }}>
            Ends {target.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
          </p>
        </> :

      !c.title && <p className="text-[16px] font-medium" style={{ color: theme.text }}>{c.endedMessage || 'It’s here.'}</p>
      }
      {c.linkLabel && c.url &&
      <PageAction mode={mode} href={c.url} className="mt-4 flex h-11 w-full items-center justify-center text-[14px] font-semibold" style={buttonStyle(theme, 'featured')}>
          {c.linkLabel}
        </PageAction>
      }
    </section>);

}