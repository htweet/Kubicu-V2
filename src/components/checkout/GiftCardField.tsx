import React, { useId, useState } from 'react';
import { GiftIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { normaliseGiftCode, type GiftCardResolution } from '../../utils/commerce/sellModes';
import { buttonStyle, inputStyle, mix } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';

interface GiftCardFieldProps {
  theme: PageTheme;
  code: string;
  onApply: (code: string) => void;
  resolution: GiftCardResolution;
}

/** “Use a gift card” in checkout (D202). Shows what it covers and what's left on it. */
export function GiftCardField({ theme, code, onApply, resolution }: GiftCardFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(!!code);
  const [draft, setDraft] = useState(code);
  const muted = { color: theme.mutedText };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 self-start text-[13.5px] font-semibold underline underline-offset-4">
        <GiftIcon size={14} aria-hidden /> Use a gift card
      </button>
    );
  }

  if (resolution?.ok) {
    const left = resolution.card.balanceNgn - resolution.amountNgn;
    return (
      <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-[13.5px]" style={{ background: mix(theme.text, 6) }}>
        <span className="flex min-w-0 flex-col" role="status" aria-live="polite">
          <span className="flex items-center gap-2 font-semibold">
            <GiftIcon size={14} aria-hidden /> <span className="truncate font-mono">{resolution.card.code}</span>
          </span>
          <span className="text-[12.5px]" style={muted}>
            Pays {formatNgn(resolution.amountNgn)} · {formatNgn(left)} left on it after this order
          </span>
        </span>
        <button
          type="button"
          aria-label="Remove gift card"
          onClick={() => {
            setDraft('');
            onApply('');
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2"
          style={{ background: mix(theme.text, 8) }}
        >
          <XIcon size={14} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(normaliseGiftCode(draft));
      }}
    >
      <label htmlFor={id} className="text-[13px] font-medium">
        Gift card code
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="GIFT-XXXX-XXXX"
          aria-invalid={resolution && !resolution.ok ? true : undefined}
          aria-describedby={`${id}-msg`}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          className="h-11 min-w-0 flex-1 px-3.5 font-mono text-[15px] uppercase outline-none focus:ring-2"
          style={inputStyle(theme)}
        />
        <button type="submit" disabled={!draft.trim()} className="h-11 shrink-0 px-4 text-[14px] font-semibold disabled:opacity-50" style={buttonStyle(theme, 'default')}>
          Apply
        </button>
      </div>
      <p id={`${id}-msg`} className="text-[12.5px] font-medium" role={resolution && !resolution.ok ? 'status' : undefined} style={resolution && !resolution.ok ? undefined : muted}>
        {resolution && !resolution.ok ? resolution.message : 'Used after any discount. Whatever it doesn’t cover is paid as normal.'}
      </p>
    </form>
  );
}
