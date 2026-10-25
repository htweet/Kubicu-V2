import React from 'react';
import { ClockIcon, MapPinIcon } from 'lucide-react';
import type { PageTheme, PopupSettings } from '../../types/page';
import { useCatalog } from '../../contexts/CatalogContext';
import { useNow } from '../../hooks/useNow';
import { popupStatus, popupStateLabels, sessionWhen, sessionStart, sessionEnd, sortedSessions, stallSoldOut } from '../../utils/popup';
import { cardStyle, fontsFor, mix } from '../blocks/pageStyle';

interface PopupPanelProps {
  popup: PopupSettings;
  handle: string;
  theme: PageTheme;
  /** The main page, for "Closed — visit our shop". */
  mainHref?: string;
  mode: 'live' | 'edit';
}

/**
 * Pop-up shop header (D183): Open now / Opens at / Between sessions / Closed, where it is and every
 * session. Words always carry the state; colour never does it alone.
 */
export function PopupPanel({ popup, handle, theme, mainHref, mode }: PopupPanelProps) {
  const data = useCatalog();
  const now = useNow(30_000);
  const st = popupStatus(popup, now);
  const sessions = sortedSessions(popup);
  const soldOut = st.state !== 'closed' && stallSoldOut(popup, data, handle);
  const muted = { color: theme.mutedText };
  const display = { fontFamily: fontsFor(theme).display, color: theme.text };
  const where = [popup.venue, popup.address].filter((s) => s.trim()).join(', ');
  const mapsHref = where ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}` : '';

  const headline =
  st.state === 'open' && st.current ?
  `Open now · until ${st.current.to}` :
  st.state === 'soon' && st.next ?
  `Opens ${sessionWhen(st.next).replace(/–.*/, '')}` :
  st.state === 'between' && st.next ?
  `Back ${sessionWhen(st.next).replace(/–.*/, '')}` :
  popup.closedAt ?
  'This pop-up has closed early' :
  'This pop-up has closed';
  const body =
  st.state === 'closed' ?
  'Thank you to everyone who came by. Our regular shop is still open.' :
  soldOut ?
  'Everything set aside for the stall has sold. Thank you!' :
  st.state === 'open' ?
  'Order below and collect at the stall today, or choose a later session.' :
  'Order now and collect at the stall during any session below. Pickup only.';

  return (
    <section aria-label="Pop-up shop" className="mb-4 flex flex-col gap-4 p-5" style={cardStyle(theme)}>
      <div className="flex flex-col gap-1.5">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold"
          style={{ background: st.state === 'open' ? theme.accent : mix(theme.text, 8), color: st.state === 'open' ? theme.accentText : theme.text }}>
          
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
          {soldOut ? 'Sold out at the stall' : popupStateLabels[st.state]}
        </span>
        <p role="status" className="text-[20px] font-semibold leading-tight" style={display}>
          {headline}
        </p>
        <p className="text-[14px] leading-relaxed" style={muted}>
          {body}
        </p>
      </div>

      {where &&
      <div className="flex items-start gap-2.5 text-[14px]">
          <MapPinIcon size={16} aria-hidden className="mt-0.5 shrink-0" style={{ color: theme.text }} />
          <div className="min-w-0">
            <p className="font-medium" style={{ color: theme.text }}>
              {popup.venue}
            </p>
            {popup.address && <p style={muted}>{popup.address}</p>}
            {mapsHref && mode === 'live' &&
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[44px] items-center font-semibold underline underline-offset-2" style={{ color: theme.text }}>
                Get directions
              </a>
          }
          </div>
        </div>
      }

      {sessions.length > 0 &&
      <div className="flex items-start gap-2.5 text-[14px]">
          <ClockIcon size={16} aria-hidden className="mt-0.5 shrink-0" style={{ color: theme.text }} />
          <ul className="flex min-w-0 flex-1 flex-col gap-1">
            {sessions.map((s) => {
            const past = sessionEnd(s) <= now;
            const live = sessionStart(s) <= now && now < sessionEnd(s);
            return (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-3" style={{ color: past ? theme.mutedText : theme.text }}>
                  <span className={past ? 'line-through' : live ? 'font-semibold' : undefined}>{sessionWhen(s)}</span>
                  <span className="text-[12.5px]" style={muted}>
                    {past ? 'Ended' : live ? 'Now' : ''}
                  </span>
                </li>);

          })}
          </ul>
        </div>
      }

      {st.state === 'closed' && mainHref && mode === 'live' &&
      <a href={mainHref} className="inline-flex min-h-[44px] w-fit items-center font-semibold underline underline-offset-2" style={{ color: theme.text }}>
          Visit our shop
        </a>
      }
    </section>);

}