import React, { useState } from 'react';
import { CheckIcon, CopyIcon, MessageCircleIcon, ShoppingBagIcon, UsersIcon } from 'lucide-react';
import type { DealRoomSettings, PageTheme, RenderMode } from '../../types/page';
import { MediaImage } from '../media/MediaImage';
import { buttonRadius, buttonStyle, cardStyle, fontsFor, mix } from '../blocks/pageStyle';
import { PageChip } from '../blocks/BlockTitle';
import { useCatalog } from '../../contexts/CatalogContext';
import { useCart } from '../../contexts/CartContext';
import { useNow } from '../../hooks/useNow';
import { useSearchParams } from 'react-router-dom';
import { canJoin, referrerName, roomProgress, roomStateLabel, roomTerms, roomTypeLabel } from '../../utils/dealRoom';
import { remainingUntil } from '../../utils/eventTime';
import { formatSchedule } from '../../utils/schedule';
import { formatNgn } from '../../utils/format';

interface DealRoomPanelProps {
  room: DealRoomSettings;
  handle: string;
  theme: PageTheme;
  mode: RenderMode;
}

/** The top of a DealRoom: the offer, honest progress, the deadline, plain terms and one way to join (D54). */
export function DealRoomPanel({ room, handle, theme, mode }: DealRoomPanelProps) {
  const data = useCatalog();
  const cart = useCart();
  const now = useNow(1000);
  const [copied, setCopied] = useState(false);
  const [params] = useSearchParams();
  const invitedBy = mode === 'live' ? referrerName(data, handle, params.get('ref')) : null;
  const p = roomProgress(room, handle, data, now);
  const product = p.product;
  const join = canJoin(p);
  const pct = Math.min(100, Math.round((p.count / p.target) * 100));
  const left = p.deadline ? remainingUntil(p.deadline, now) : null;
  const url = `https://kub.icu/${handle}`;
  const muted = { color: theme.mutedText };

  const status =
    p.state === 'scheduled'
      ? `Opens ${room.opensAt ? formatSchedule(room.opensAt) : 'soon'}`
      : p.state === 'ended_missed'
        ? `The goal of ${p.target} wasn’t reached. Everyone who joined has been refunded in full.`
        : p.state === 'ended_success'
          ? room.type === 'goal'
            ? `Goal reached — ${p.count} people joined. Orders are on their way.`
            : 'This drop has ended. Thank you!'
          : p.state === 'sold_out'
            ? 'All gone — this drop sold out.'
            : p.state === 'goal_reached'
              ? `Goal reached! You can still join until ${p.deadline ? formatSchedule(p.deadline) : 'the deadline'}.`
              : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const joinRoom = () => {
    if (!cart || !product || !join) return;
    cart.add(product.id, product.variants.length === 1 ? product.variants[0].id : undefined, product.variants.length > 1);
  };

  return (
    <section aria-labelledby="room-heading" className="flex flex-col gap-4 p-4" style={cardStyle(theme)}>
      <div className="flex items-center justify-between gap-2">
        <PageChip theme={theme}>
          <UsersIcon size={12} aria-hidden className="mr-1 inline" />
          {roomTypeLabel[room.type]}
        </PageChip>
        <span className="text-[12.5px] font-semibold" style={muted}>
          {roomStateLabel[p.state]}
        </span>
      </div>

      {product ? (
        <div className="flex gap-4">
          {product.images[0] ? (
            <MediaImage src={product.images[0].url} alt={product.images[0].alt} className="h-28 w-24 shrink-0 rounded-md object-cover" />
          ) : (
            <span aria-hidden className="flex h-28 w-24 shrink-0 items-center justify-center rounded-md" style={{ background: mix(theme.text, 6) }}>
              <ShoppingBagIcon size={20} />
            </span>
          )}
          <div className="min-w-0">
            <h2 id="room-heading" className="text-[19px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display }}>
              {product.name}
            </h2>
            <p className="mt-1 flex flex-wrap items-baseline gap-2 text-[18px] font-semibold tabular-nums">
              {p.unitPriceNgn !== null ? formatNgn(p.unitPriceNgn) : 'Price on request'}
              {p.normalPriceNgn !== null && p.unitPriceNgn !== null && p.unitPriceNgn < p.normalPriceNgn && (
                <s className="text-[13.5px] font-medium" style={muted}>
                  {formatNgn(p.normalPriceNgn)}
                </s>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[14px]" style={muted}>
          {mode === 'edit' ? 'Choose the product for this room in Page settings.' : 'This room isn’t ready yet.'}
        </p>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-3 text-[14px]">
          <span className="font-semibold tabular-nums">
            {room.type === 'goal' ? `${p.count} of ${p.target} joined` : `${p.remaining} of ${p.target} left`}
          </span>
          {left && p.state !== 'ended_missed' && p.state !== 'ended_success' && p.state !== 'scheduled' && (
            <span className="tabular-nums" style={muted}>
              {left.days > 0 ? `${left.days}d ` : ''}
              {String(left.hours).padStart(2, '0')}:{String(left.minutes).padStart(2, '0')}:{String(left.seconds).padStart(2, '0')} left
            </span>
          )}
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full"
          style={{ background: mix(theme.text, 10) }}
          role="progressbar"
          aria-label={room.type === 'goal' ? 'Buyers joined towards the goal' : 'Units sold'}
          aria-valuemin={0}
          aria-valuemax={p.target}
          aria-valuenow={room.type === 'goal' ? p.count : p.target - p.remaining}
        >
          <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${room.type === 'goal' ? pct : Math.round(((p.target - p.remaining) / p.target) * 100)}%`, background: theme.accent }} />
        </div>
        {room.type === 'goal' && p.remaining > 0 && join && (
          <p className="mt-1.5 text-[12.5px]" style={muted}>
            {p.remaining} more {p.remaining === 1 ? 'person' : 'people'} needed by {p.deadline ? formatSchedule(p.deadline) : 'the deadline'}.
          </p>
        )}
      </div>

      {invitedBy && join && (
        <p className="text-[13.5px] font-medium">
          {invitedBy} invited you — joining through their link counts towards their tally.
        </p>
      )}

      {status && (
        <p className="rounded-md px-3 py-2.5 text-[13.5px] font-medium" style={{ background: mix(theme.text, 6) }} role="status">
          {status}
        </p>
      )}

      <ul className="flex flex-col gap-1.5 text-[13.5px] leading-snug">
        {roomTerms(room, p).map((t) => (
          <li key={t} className="flex gap-2">
            <CheckIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      {mode === 'edit' || !cart ? (
        <span className="flex h-12 w-full items-center justify-center text-[15px] font-semibold" style={{ ...buttonStyle(theme, 'featured'), borderRadius: buttonRadius(theme) }}>
          {room.type === 'goal' ? 'Join the group buy' : 'Buy now'}
        </span>
      ) : (
        <button
          type="button"
          onClick={joinRoom}
          disabled={!join || !product}
          className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ ...buttonStyle(theme, 'featured'), borderRadius: buttonRadius(theme) }}
        >
          <ShoppingBagIcon size={16} aria-hidden />
          {!join ? roomStateLabel[p.state] : room.type === 'goal' ? 'Join the group buy' : 'Buy now'}
        </button>
      )}

      <div className="flex gap-2">
        <a
          href={mode === 'live' ? `https://wa.me/?text=${encodeURIComponent(`${product?.name ?? 'This deal'} — ${room.type === 'goal' ? `we need ${p.remaining} more to unlock it` : `only ${p.remaining} left`}: ${url}`)}` : undefined}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 text-[14px] font-semibold"
          style={{ ...buttonStyle(theme, 'default'), borderRadius: buttonRadius(theme) }}
        >
          <MessageCircleIcon size={15} aria-hidden /> Share on WhatsApp
        </a>
        <button type="button" onClick={copy} aria-label="Copy room link" className="flex h-11 w-11 shrink-0 items-center justify-center" style={{ ...buttonStyle(theme, 'default'), borderRadius: buttonRadius(theme) }}>
          {copied ? <CheckIcon size={15} aria-hidden /> : <CopyIcon size={15} aria-hidden />}
        </button>
      </div>

      {room.updates.length > 0 && (
        <section aria-label="Updates from the seller" className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: mix(theme.text, 12) }}>
          <h3 className="text-[13px] font-semibold">Updates</h3>
          {room.updates.slice(0, 3).map((u) => (
            <p key={u.id} className="text-[13.5px] leading-snug">
              <span className="block text-[12px]" style={muted}>
                {formatSchedule(u.at)}
              </span>
              {u.text}
            </p>
          ))}
        </section>
      )}
    </section>
  );
}
