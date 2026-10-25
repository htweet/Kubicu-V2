import React, { useState } from 'react';
import { AlertTriangleIcon, BikeIcon, CheckIcon, ExternalLinkIcon, KeyRoundIcon, MapPinIcon, PhoneIcon, TruckIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { translatorFor } from '../../contexts/LocaleContext';
import type { Msg, TrackingView } from '../../utils/commerce/tracking';
import { dayLabel, promiseLabel } from '../../utils/commerce/tracking';
import { cardStyle, mix } from '../blocks/pageStyle';
import { formatRelative } from '../../utils/format';
import { trackingStageIcons } from '../commerce/trackingStageIcons';

type Tx = ReturnType<typeof translatorFor>;

const FEED_PREVIEW = 4;

/** Buyer tracking, paid → delivered (D144). Lives on the order page at #tracking. */
export function OrderTrackingCard({ theme: t, view, tx }: {theme: PageTheme;view: TrackingView;tx: Tx;}) {
  const [allUpdates, setAllUpdates] = useState(false);
  const m = (msg: Msg | null) => msg ? tx(msg.t, msg.v) : '';
  const muted = { color: t.mutedText };
  const line = mix(t.text, 12);
  const d = view.delivery;
  const riderVisible = !!d?.rider && (d.status === 'assigned' || d.status === 'picked_up');
  const codeVisible = !!d && d.status === 'picked_up';
  const alert = view.health === 'late' || view.health === 'problem';
  const feed = allUpdates ? view.feed : view.feed.slice(0, FEED_PREVIEW);
  const showEta = view.promisedBy && view.health !== 'done' && view.health !== 'cancelled' && view.health !== 'waiting';

  return (
    <section id="tracking" aria-labelledby="trk-title" className="flex scroll-mt-6 flex-col gap-5 p-5" style={cardStyle(t)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium" style={muted}>
            {tx('Tracking')}
          </p>
          <h2 id="trk-title" className="mt-0.5 text-[19px] font-semibold leading-snug">
            {m(view.headline)}
          </h2>
          {view.detail &&
          <p className="mt-1 flex items-start gap-1.5 text-[14px] leading-snug" style={alert ? undefined : muted}>
              {alert && <AlertTriangleIcon size={15} className="mt-0.5 shrink-0" aria-hidden />}
              <span>{m(view.detail)}</span>
            </p>
          }
        </div>
        {showEta &&
        <div className="shrink-0 rounded-md px-3.5 py-2.5 text-right" style={{ background: mix(t.text, 6) }}>
            <p className="text-[12px]" style={muted}>
              {tx(view.health === 'late' ? 'Was due' : 'Expected by')}
            </p>
            <p className="text-[15px] font-semibold tabular-nums">{promiseLabel(view.promisedBy!)}</p>
            {view.promiseSource === 'estimate' &&
          <p className="text-[11.5px]" style={muted}>
                {tx('estimate')}
              </p>
          }
          </div>
        }
      </div>

      {view.health !== 'cancelled' &&
      // Phones: vertical with times; wider: a bar with labels and times underneath.
      <ol className="relative flex flex-col gap-3.5 sm:grid sm:gap-2" style={{ gridTemplateColumns: `repeat(${view.stages.length}, minmax(0, 1fr))` }} aria-label={tx('Delivery progress')}>
          <span aria-hidden className="absolute bottom-4 left-[15px] top-4 w-px sm:hidden" style={{ background: line }} />
          {view.stages.map((s, i) => {
          const done = s.state === 'done';
          const current = s.state === 'current' || s.state === 'problem';
          const problem = s.state === 'problem';
          const Icon = trackingStageIcons[s.key];
          const next = view.stages[i + 1];
          return (
            <li key={s.key} className="relative flex items-start gap-3 sm:block" aria-current={current ? 'step' : undefined}>
                {next && <span aria-hidden className="absolute left-9 right-1 top-[15px] hidden h-0.5 rounded-full sm:block" style={{ background: next.state === 'done' ? t.accent : line }} />}
                <span
                aria-hidden
                className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: done ? t.accent : problem ? '#C2410C' : t.background,
                  color: done ? t.accentText : problem ? '#FFFFFF' : current ? t.accent : t.mutedText,
                  border: done || problem ? 'none' : `${current ? 2 : 1}px solid ${current ? t.accent : mix(t.text, 22)}`,
                  boxShadow: `0 0 0 3px ${t.background}`
                }}>
                
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                <span className="block min-w-0 pt-1.5 sm:mt-2 sm:pt-0">
                  <span className="sr-only">{tx(done ? 'Done:' : current ? 'Now:' : 'Next:')} </span>
                  <span className="block text-[14px] leading-tight sm:text-[13px]" style={{ fontWeight: done || current ? 600 : 400, color: done || current ? t.text : t.mutedText }}>
                    {tx(s.label)}
                  </span>
                  {s.at &&
                <span className="block text-[12px] tabular-nums" style={muted}>
                      {dayLabel(s.at)} · {new Date(s.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </span>
                }
                </span>
              </li>);

        })}
        </ol>
      }

      {(riderVisible || view.carrier) &&
      <div className="grid gap-3 border-t pt-4 sm:grid-cols-2" style={{ borderColor: line }}>
          {riderVisible && d?.rider &&
        <div className="flex items-center gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: mix(t.text, 7) }}>
                <BikeIcon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{d.rider.name}</p>
                <p className="truncate text-[12.5px]" style={muted}>
                  {d.rider.vehicle} · {d.partnerName}
                </p>
              </div>
              <a href={`tel:${d.rider.phone.replace(/\s/g, '')}`} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: t.accent, color: t.accentText }} aria-label={`${tx('Call')} ${d.rider.name}`}>
                <PhoneIcon size={14} aria-hidden /> {tx('Call')}
              </a>
            </div>
        }
          {view.carrier &&
        <div className="flex items-center gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: mix(t.text, 7) }}>
                <TruckIcon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{view.carrier.name}</p>
                {view.carrier.trackingNumber &&
            <p className="truncate font-mono text-[12.5px]" style={muted}>
                    {view.carrier.trackingNumber}
                  </p>
            }
              </div>
              {view.carrier.url &&
          <a href={view.carrier.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ border: `1px solid ${mix(t.text, 20)}` }}>
                  {tx('Track')} <ExternalLinkIcon size={13} aria-hidden />
                </a>
          }
            </div>
        }
        </div>
      }

      {codeVisible && d &&
      <div className="flex items-center gap-3 rounded-md px-4 py-3" style={{ background: mix(t.accent, 12) }}>
          <KeyRoundIcon size={18} className="shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 text-[13.5px] leading-snug">
            {tx('Your delivery code')}: <span className="font-mono text-[17px] font-bold tracking-[0.2em]">{d.code}</span>
            <span className="block text-[12.5px]" style={muted}>
              {tx('Give it to the rider only once you have your order and it looks right.')}
            </span>
          </p>
        </div>
      }

      {view.feed.length > 0 &&
      <div className="border-t pt-4" style={{ borderColor: line }}>
          <h3 className="text-[14px] font-semibold">{tx('Updates')}</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {feed.map((f) =>
          <li key={f.id} className="flex gap-3 text-[13.5px]">
                <span className="w-[86px] shrink-0 tabular-nums" style={muted}>
                  {formatRelative(f.at)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-snug">{f.text ? m(f.text) : f.raw}</span>
                  {f.location &&
              <span className="mt-0.5 flex items-center gap-1 text-[12.5px]" style={muted}>
                      <MapPinIcon size={12} aria-hidden /> {f.location}
                    </span>
              }
                  {f.source === 'seller' &&
              <span className="text-[12px]" style={muted}>
                      {tx('From the seller')}
                    </span>
              }
                </span>
              </li>
          )}
          </ul>
          {view.feed.length > FEED_PREVIEW &&
        <button type="button" aria-expanded={allUpdates} onClick={() => setAllUpdates((v) => !v)} className="mt-2 inline-flex min-h-[44px] items-center text-[13.5px] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2">
              {allUpdates ? tx('Show fewer') : tx('Show all {n} updates', { n: view.feed.length })}
            </button>
        }
        </div>
      }

      <p className="text-[12px]" style={muted}>
        {tx('Last update {when}. This page updates by itself.', { when: formatRelative(view.lastUpdateAt) })}
      </p>
    </section>);

}