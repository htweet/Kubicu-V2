import React, { useState } from 'react';
import { BadgeCheckIcon, FlagIcon, HandHeartIcon, MessageCircleIcon } from 'lucide-react';
import type { FundraiserSettings, PageTheme, RenderMode } from '../../types/page';
import { useMoney } from '../../hooks/useMoney';
import { useNow } from '../../hooks/useNow';
import { readAdminStore } from '../../utils/admin/store';
import { isVerified } from '../../utils/money/store';
import { fundraiserEnd, fundraiserProgress, fundraiserTerms, supporterName, takingPayments } from '../../utils/fundraiser';
import { formatNgn } from '../../utils/format';
import { formatSchedule } from '../../utils/schedule';
import { buttonRadius, buttonStyle, cardStyle, fontsFor, mix } from '../blocks/pageStyle';
import { PageChip } from '../blocks/BlockTitle';
import { ReportPageDialog } from '../blocks/ReportPageDialog';

/** Visible keyboard focus on any theme: the outline takes the element's own text colour. */
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

interface FundraiserPanelProps {
  f: FundraiserSettings;
  handle: string;
  theme: PageTheme;
  mode: RenderMode;
  workspaceId: string | null;
}

/** The top of a Fundraiser (D179): who's raising, for what, the honest total, how to give and the fixed terms. */
export function FundraiserPanel({ f, handle, theme, mode, workspaceId }: FundraiserPanelProps) {
  const money = useMoney(workspaceId ?? '_none').data;
  const now = useNow(30_000);
  const [reporting, setReporting] = useState(false);
  const link = workspaceId ? money.links.find((l) => l.id === f.linkId) : undefined;
  const verified = !!workspaceId && isVerified(money);
  const paused = !!readAdminStore().pausedFundraisers?.[handle];
  const p = fundraiserProgress(f, link, { verified, pausedByStaff: paused }, now);
  const open = takingPayments(p.state);
  const muted = { color: theme.mutedText };
  const end = fundraiserEnd(f);
  const payHref = (amount?: number) => (link ? `/p/${handle}/pay/${link.slug}${amount ? `?amount=${amount}` : ''}` : undefined);
  const live = mode === 'live';
  const lastExtension = f.extensions[f.extensions.length - 1];

  const status =
    p.state === 'paused'
      ? 'Paused while KUBICU reviews this fundraiser. No payments can be made right now.'
      : p.state === 'unverified'
        ? 'Not taking payments right now — the organiser’s verification needs attention.'
        : p.state === 'ended'
          ? `This fundraiser has ended. Thank you to everyone who gave — ${formatNgn(p.raisedNgn)} was raised.`
          : p.state === 'goal_reached'
            ? 'Goal reached — thank you! You can still give until it closes.'
            : null;

  const give = (label: string, amount?: number, primary = false) => {
    const style = { ...buttonStyle(theme, primary ? 'featured' : 'default'), borderRadius: buttonRadius(theme) };
    const cls = `flex h-12 items-center justify-center px-3 text-[15px] font-semibold tabular-nums ${focusRing}`;
    return live && open && payHref(amount) ? (
      <a key={label} href={payHref(amount)} className={cls} style={style}>
        {label}
      </a>
    ) : (
      <span key={label} className={`${cls} ${!open ? 'opacity-50' : ''}`} style={style} aria-disabled={!open || undefined}>
        {label}
      </span>
    );
  };

  return (
    <section aria-labelledby="fund-heading" className="flex flex-col gap-4 p-5" style={{ ...cardStyle(theme), color: theme.text }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageChip theme={theme}>
          <HandHeartIcon size={12} aria-hidden className="mr-1 inline" />
          Fundraiser
        </PageChip>
        {end && p.state !== 'ended' && (
          <span className="text-[12.5px] font-medium" style={muted}>
            Closes {formatSchedule(end)}
          </span>
        )}
      </div>

      <div>
        <h2 id="fund-heading" className="text-[22px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display }}>
          {f.purpose || (mode === 'edit' ? 'Say what the money is for in Page settings' : 'Fundraiser')}
        </h2>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[14px]" style={muted}>
          Organised by <span className="font-semibold" style={{ color: theme.text }}>{f.organiser || '—'}</span>
          {verified && (
            <span className="inline-flex items-center gap-1 font-medium" style={{ color: theme.text }}>
              <BadgeCheckIcon size={14} aria-hidden /> Identity verified
            </span>
          )}
          {f.beneficiary && <span>· for {f.beneficiary}</span>}
        </p>
      </div>

      <div>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-semibold leading-none tabular-nums">{formatNgn(p.raisedNgn)}</span>
          <span className="text-[14px]" style={muted}>
            raised of {formatNgn(f.goalNgn)} goal
          </span>
        </p>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: mix(theme.text, 10) }}
          role="progressbar"
          aria-label="Raised towards the goal"
          aria-valuemin={0}
          aria-valuemax={f.goalNgn}
          aria-valuenow={Math.min(p.raisedNgn, f.goalNgn)}
          aria-valuetext={`${formatNgn(p.raisedNgn)} of ${formatNgn(f.goalNgn)}, ${p.pct}%`}
        >
          <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${p.pct}%`, background: theme.accent }} />
        </div>
        <p className="mt-1.5 text-[13px] tabular-nums" style={muted} aria-live="polite" aria-atomic="true">
          <span className="sr-only">{formatNgn(p.raisedNgn)} raised. </span>
          {p.pct}% · {p.supporters} {p.supporters === 1 ? 'supporter' : 'supporters'} · real payments only
        </p>
      </div>

      {status && (
        <p className="rounded-md px-3 py-2.5 text-[13.5px] font-medium" style={{ background: mix(theme.text, 6) }} role="status">
          {status}
        </p>
      )}

      {open && (
        <div className="flex flex-col gap-2">
          {f.amounts.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{f.amounts.slice(0, 4).map((a) => give(formatNgn(a), a))}</div>}
          {give('Give another amount', undefined, true)}
        </div>
      )}

      <p className="text-[12.5px] leading-relaxed" style={muted}>
        {fundraiserTerms(f.organiser)}
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={live ? `https://wa.me/?text=${encodeURIComponent(`${f.purpose} — ${formatNgn(p.raisedNgn)} raised of ${formatNgn(f.goalNgn)}: https://kub.icu/${handle}`)}` : undefined}
          target="_blank"
          rel="noreferrer"
          className={`flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-3 text-[14px] font-semibold ${focusRing}`}
          style={{ ...buttonStyle(theme, 'default'), borderRadius: buttonRadius(theme) }}
        >
          <MessageCircleIcon size={15} aria-hidden /> Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={() => live && setReporting(true)}
          className={`flex h-11 items-center justify-center gap-1.5 px-3 text-[13.5px] font-medium underline-offset-2 hover:underline ${focusRing}`}
          style={muted}
        >
          <FlagIcon size={14} aria-hidden /> Report this fundraiser
        </button>
      </div>

      {p.recent.length > 0 && (
        <section aria-labelledby="fund-supporters" className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: mix(theme.text, 12) }}>
          <h3 id="fund-supporters" className="text-[13px] font-semibold">
            Recent supporters
          </h3>
          <ul className="flex flex-col gap-1.5">
            {p.recent.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span>{supporterName(s)}</span>
                <span className="tabular-nums" style={muted}>
                  {formatNgn(s.amountNgn - (s.refundedNgn ?? 0))} · {formatSchedule(s.at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(f.updates.length > 0 || lastExtension) && (
        <section aria-labelledby="fund-updates" className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: mix(theme.text, 12) }}>
          <h3 id="fund-updates" className="text-[13px] font-semibold">
            Updates from {f.organiser || 'the organiser'}
          </h3>
          {lastExtension && (
            <p className="text-[13.5px] leading-snug">
              <span className="block text-[12px]" style={muted}>
                {formatSchedule(lastExtension.at)}
              </span>
              End date moved to {formatSchedule(lastExtension.to)}: {lastExtension.reason}
            </p>
          )}
          {f.updates.slice(0, 3).map((u) => (
            <p key={u.id} className="whitespace-pre-line text-[13.5px] leading-snug">
              <span className="block text-[12px]" style={muted}>
                {formatSchedule(u.at)}
              </span>
              {u.text}
            </p>
          ))}
        </section>
      )}

      {live && <ReportPageDialog open={reporting} onClose={() => setReporting(false)} handle={handle} workspaceId={workspaceId} />}
    </section>
  );
}
