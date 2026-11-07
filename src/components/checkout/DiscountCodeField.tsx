import React, { useId, useState } from 'react';
import { TagIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { DiscountResolution } from '../../utils/commerce/discounts';
import { normaliseCode } from '../../utils/commerce/discounts';
import { buttonStyle, inputStyle, mix } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';

interface DiscountCodeFieldProps {
  theme: PageTheme;
  code: string;
  onApply: (code: string) => void;
  resolution: DiscountResolution;
}

/** “Add discount code” in checkout. Explains plainly why a code didn’t apply. */
export function DiscountCodeField({ theme, code, onApply, resolution }: DiscountCodeFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(!!code);
  const [draft, setDraft] = useState(code);
  const muted = { color: theme.mutedText };
  const appliedCode = resolution.applied?.discount.code;
  const typedWorks = !!code && !resolution.codeError && !resolution.codeBeaten;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 self-start text-[13.5px] font-semibold underline underline-offset-4">
        <TagIcon size={14} aria-hidden /> Add discount code
      </button>
    );
  }

  if (typedWorks && appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-[13.5px]" style={{ background: mix(theme.text, 6) }}>
        <span className="flex items-center gap-2 font-semibold">
          <TagIcon size={14} aria-hidden /> {appliedCode} applied
        </span>
        <button
          type="button"
          aria-label={`Remove code ${appliedCode}`}
          onClick={() => {
            setDraft('');
            onApply('');
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full"
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
        onApply(normaliseCode(draft));
      }}
    >
      <label htmlFor={id} className="text-[13px] font-medium">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. EID20"
          aria-invalid={resolution.codeError ? true : undefined}
          aria-describedby={`${id}-msg`}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          className="h-11 min-w-0 flex-1 px-3.5 font-mono text-[15px] uppercase outline-none focus:ring-2"
          style={inputStyle(theme)}
        />
        <button type="submit" disabled={!draft.trim()} className="h-11 shrink-0 px-4 text-[14px] font-semibold disabled:opacity-50" style={buttonStyle(theme, 'default')}>
          Apply
        </button>
      </div>
      <p id={`${id}-msg`} className="text-[12.5px] font-medium" role={resolution.codeError || resolution.codeBeaten ? 'status' : undefined} style={resolution.codeError ? undefined : muted}>
        {resolution.codeError
          ? resolution.codeError
          : resolution.codeBeaten
            ? `${resolution.codeBeaten.code} would save ${formatNgn(resolution.codeBeaten.amountNgn)}, but “${resolution.applied?.discount.title}” saves more, so we applied that. One discount per order.`
            : 'One discount per order. If an automatic offer saves you more, we’ll use that.'}
      </p>
    </form>
  );
}
