import React, { useState } from 'react';
import { ListMusicIcon, MusicIcon, Volume2Icon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle } from './BlockTitle';
import { MediaImage } from '../media/MediaImage';
import { AudioPlayer } from './AudioPlayer';
import { CheckoutButton } from './CheckoutButton';
import { buttonRadius, cardStyle, mix } from './pageStyle';
import { useDataSaver } from '../../contexts/DataSaverContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { canSell, findProduct } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';

/** Several tracks with a now-playing player and track list (D124). Any track can be sold. */
export function PlaylistBlock({ block, theme: t, mode }: BlockProps<'playlist'>) {
  const c = block.content;
  const { on } = useDataSaver();
  const catalog = useCatalog();
  const tracks = c.tracks.filter((tr) => tr.url);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);

  if (tracks.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={ListMusicIcon} title="No tracks yet" hint="Add tracks with a title and an audio link" theme={t} tall /> : null;
  }
  const current = tracks[Math.min(index, tracks.length - 1)];
  const pick = (i: number) => {
    setIndex(i);
    setAuto(true);
  };

  return (
    <section>
      {c.title && <BlockTitle theme={t} aside={<span className="text-[13px]" style={{ color: t.mutedText }}>{tracks.length} tracks</span>}>{c.title}</BlockTitle>}
      <div className="flex flex-col overflow-hidden" style={cardStyle(t)}>
        <div className="flex flex-col gap-3 p-4" style={{ borderBottom: `1px solid ${mix(t.text, 10)}` }}>
          <div className="flex items-center gap-3">
            {c.coverUrl ? (
              <MediaImage src={c.coverUrl} alt={c.coverAlt} loading="lazy" className="h-14 w-14 shrink-0 rounded-md object-cover" />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md" style={{ background: mix(t.text, 6), color: t.mutedText }}>
                <MusicIcon size={20} aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium" style={{ color: t.mutedText }}>Now playing · {index + 1} of {tracks.length}</p>
              <p className="truncate text-[15px] font-semibold" style={{ color: t.text }}>{current.title || 'Untitled track'}</p>
              {(current.artist || c.artist) && <p className="truncate text-[13px]" style={{ color: t.mutedText }}>{current.artist || c.artist}</p>}
            </div>
          </div>
          <AudioPlayer
            src={current.url}
            title={current.title}
            theme={t}
            deferLoad={on && !auto}
            allowDownload={c.allowDownload && !current.productId}
            fileName={current.fileName}
            autoPlay={auto}
            inert={mode === 'edit'}
            onEnded={() => index < tracks.length - 1 && pick(index + 1)}
          />
        </div>
        <ol aria-label="Tracks">
          {tracks.map((tr, i) => {
            const product = tr.productId ? findProduct(catalog, tr.productId) : undefined;
            const sellable = product && product.kind === 'digital' && canSell(product);
            const active = i === index;
            return (
              <li key={tr.id} className="flex items-center gap-2 px-2" style={{ borderTop: i ? `1px solid ${mix(t.text, 8)}` : undefined }}>
                <button
                  type="button"
                  onClick={() => mode !== 'edit' && pick(i)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Play ${tr.title || `track ${i + 1}`}`}
                  className="flex min-h-[48px] min-w-0 flex-1 items-center gap-3 px-2 text-left focus-visible:outline-none focus-visible:ring-2"
                >
                  <span className="w-5 shrink-0 text-center text-[12.5px] tabular-nums" style={{ color: active ? t.text : t.mutedText }}>
                    {active ? <Volume2Icon size={14} aria-hidden className="mx-auto" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px]" style={{ color: t.text, fontWeight: active ? 600 : 500 }}>{tr.title || `Track ${i + 1}`}</span>
                    {tr.artist && <span className="block truncate text-[12px]" style={{ color: t.mutedText }}>{tr.artist}</span>}
                  </span>
                  {tr.duration && <span className="shrink-0 text-[12px] tabular-nums" style={{ color: t.mutedText }}>{tr.duration}</span>}
                </button>
                {sellable && (
                  <CheckoutButton
                    mode={mode}
                    showIcon={false}
                    ariaLabel={`Buy ${tr.title} for ${product.priceNgn !== null ? formatNgn(product.priceNgn) : 'the listed price'}`}
                    onAdd={(cart) => cart.add(product.id, product.variants[0]?.id)}
                    className="flex h-8 shrink-0 items-center px-3 text-[12px] font-semibold"
                    style={{ background: t.accent, color: t.accentText, borderRadius: buttonRadius(t) }}
                  >
                    {product.priceNgn !== null ? formatNgn(product.priceNgn) : 'Buy'}
                  </CheckoutButton>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
