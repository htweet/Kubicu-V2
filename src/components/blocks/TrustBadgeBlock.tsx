import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheckIcon, CheckIcon, ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
import { useVerifiedTick } from '../../hooks/useVerifiedTick';
import { contrastRatio } from '../../utils/contrast';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cardRadius, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePublicPassport } from '../../hooks/usePublicPassport';
import { MIN_DAYS, levelLabels, publicSignals } from '../../utils/trustPassport';
import { useT } from '../../contexts/LocaleContext';

/**
 * Trust Passport badge (D111): the level and checked signals, worked out when the page is viewed.
 * Follows the visitor's language (D506); signal lines with figures translate where a draft exists.
 */
export function TrustBadgeBlock({ block, theme: t, mode }: BlockProps<'trustBadge'>) {
  const { t: tr } = useT();
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const catalog = useCatalog();
  const { handle } = useParams();
  const wid = pageOps.workspaceId ?? current.id;
  const { passport, appOn } = usePublicPassport(wid, catalog?.orders ?? []);
  const tick = useVerifiedTick(wid);
  const c = block.content;

  if (!appOn) {
    return mode === 'edit' ? <BlockPlaceholder icon={ShieldCheckIcon} title="Trust Passport is off" hint="Install or resume it in Extensions to show this badge" theme={t} /> : null;
  }

  const signals = publicSignals(passport);
  const label = tr(levelLabels[passport.level]);
  // "Business verified by KUBICU · <registered name>": translate the phrase, keep the name as registered.
  const trTick = (s: string) => s.split(' · ').map((part, i) => (i === 0 ? tr(part) : part)).join(' · ');
  const tickLabel = trTick(tick.label);
  // The tenure title carries a number, so it has its own phrase.
  const signalTitle = (s: { id: string; title: string }) => (s.id === 'tenure' ? tr('Selling for {n} days', { n: MIN_DAYS }) : tr(s.title));
  const href = mode === 'live' && handle ? `/p/${handle}/trust` : null;
  const box = { background: t.surface, borderRadius: cardRadius(t), border: `1px solid ${mix(t.text, 12)}`, color: t.text };
  const tickColor = contrastRatio(t.accent, t.surface) >= 3 ? t.accent : t.text;

  // D254: "Verified" style — only KUBICU's verification seal.
  if (c.style === 'verified') {
    if (!tick.shown) {
      if (mode !== 'edit') return null;
      return (
        <BlockPlaceholder
          icon={BadgeCheckIcon}
          title={tick.hiddenByKubicu ? 'The verified seal is hidden by KUBICU' : 'Appears once you’re verified'}
          hint={tick.hiddenByKubicu ? 'Your verification still counts. Contact support if you think this is a mistake.' : 'Visitors see nothing until KUBICU approves your verification'}
          theme={t}
        />
      );
    }
    const inner = (
      <>
        <BadgeCheckIcon size={22} strokeWidth={2.2} style={{ color: tickColor }} aria-hidden className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight">{tr('Verified by KUBICU')}</span>
          <span className="block truncate text-[12.5px]" style={{ color: t.mutedText }}>
            {trTick(tick.label.replace(' by KUBICU', ''))}
          </span>
        </span>
        {href && <ChevronRightIcon size={16} aria-hidden style={{ color: t.mutedText }} />}
      </>
    );
    return href ? (
      <Link to={href} className="inline-flex max-w-full items-center gap-3 px-4 py-3" style={box} aria-label={`${tickLabel}. ${tr('See the Trust Passport.')}`}>
        {inner}
      </Link>
    ) : (
      <div className="inline-flex max-w-full items-center gap-3 px-4 py-3" style={box}>
        {inner}
      </div>
    );
  }

  // D254: hide from visitors while "Just starting" — a weak badge can put buyers off an honest new seller.
  if (c.hideBelow && passport.level === 'starting') {
    return mode === 'edit' ? <BlockPlaceholder icon={ShieldCheckIcon} title="Hidden until “Building trust”" hint="Visitors don’t see this badge yet. Verification is the quickest way up" theme={t} /> : null;
  }
  const Wrap = ({ children, className }: { children: React.ReactNode; className: string }) =>
    href ? (
      <Link to={href} className={className} style={box} aria-label={`${tr('KUBICU Trust Passport')}: ${label}${c.showScore ? `, ${tr('{n} out of 100', { n: passport.score })}` : ''}. ${tr('See the full passport.')}`}>
        {children}
      </Link>
    ) : (
      <div className={className} style={box}>
        {children}
      </div>
    );

  const seal = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: t.text, color: t.background }}>
      <ShieldCheckIcon size={19} aria-hidden />
    </span>
  );

  if (c.style === 'compact') {
    return (
      <Wrap className="flex items-center gap-3 px-4 py-3">
        {seal}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight">
            {label}
            {tick.shown && <BadgeCheckIcon size={15} strokeWidth={2.4} style={{ color: tickColor }} aria-label={tickLabel} />}
          </span>
          <span className="block truncate text-[12.5px]" style={{ color: t.mutedText }}>
            {tr('KUBICU Trust Passport')}
            {signals.length ? ` · ${signals.slice(0, 2).map((s) => signalTitle(s)).join(' · ')}` : ''}
          </span>
        </span>
        {c.showScore && (
          <span className="shrink-0 text-[15px] font-semibold tabular-nums">
            {passport.score}
            <span className="text-[12px] font-normal" style={{ color: t.mutedText }}>
              /100
            </span>
          </span>
        )}
        {href && <ChevronRightIcon size={16} aria-hidden style={{ color: t.mutedText }} />}
      </Wrap>
    );
  }

  return (
    <Wrap className="flex flex-col gap-4 p-5">
      <span className="flex items-center gap-3">
        {seal}
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px]" style={{ color: t.mutedText }}>
            {tr('KUBICU Trust Passport')}
          </span>
          <span className="flex items-center gap-2 text-[19px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display }}>
            {label}
            {tick.shown && <BadgeCheckIcon size={18} strokeWidth={2.4} style={{ color: tickColor }} aria-label={tickLabel} />}
          </span>
        </span>
        {c.showScore && (
          <span className="text-[22px] font-semibold tabular-nums">
            {passport.score}
            <span className="text-[13px] font-normal" style={{ color: t.mutedText }}>
              /100
            </span>
          </span>
        )}
      </span>
      {c.showScore && (
        <span className="block h-1.5 overflow-hidden rounded-full" style={{ background: mix(t.text, 10) }} aria-hidden>
          <span className="block h-full rounded-full" style={{ width: `${passport.score}%`, background: t.text }} />
        </span>
      )}
      {signals.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {signals.map((s) => (
            <li key={s.id} className="flex items-start gap-2 text-[14px] leading-snug">
              <CheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{signalTitle(s)}</span>
                <span style={{ color: t.mutedText }}>
                  {' '}
                  — {tr(s.evidencePhrase.t, s.evidencePhrase.v)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[13.5px]" style={{ color: t.mutedText }}>
          {tr('New on KUBICU — checks build up with verification, completed orders and verified reviews.')}
        </span>
      )}
      <span className="flex items-center justify-between gap-3 text-[12.5px]" style={{ color: t.mutedText }}>
        <span>{tr('Built only from records KUBICU checks. The business can’t edit it.')}</span>
        {href && (
          <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold" style={{ color: t.text }}>
            {tr('Full passport')} <ChevronRightIcon size={14} aria-hidden />
          </span>
        )}
      </span>
    </Wrap>
  );
}
