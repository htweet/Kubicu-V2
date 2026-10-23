import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckIcon, ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cardRadius, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePublicPassport } from '../../hooks/usePublicPassport';
import { levelLabels, publicSignals } from '../../utils/trustPassport';

/** Trust Passport badge (D111): the level and checked signals, worked out when the page is viewed. */
export function TrustBadgeBlock({ block, theme: t, mode }: BlockProps<'trustBadge'>) {
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const catalog = useCatalog();
  const { handle } = useParams();
  const { passport, appOn } = usePublicPassport(pageOps.workspaceId ?? current.id, catalog?.orders ?? []);
  const c = block.content;

  if (!appOn) {
    return mode === 'edit' ? <BlockPlaceholder icon={ShieldCheckIcon} title="Trust Passport is off" hint="Install or resume it in Extensions to show this badge" theme={t} /> : null;
  }

  const signals = publicSignals(passport);
  const label = levelLabels[passport.level];
  const href = mode === 'live' && handle ? `/p/${handle}/trust` : null;
  const box = { background: t.surface, borderRadius: cardRadius(t), border: `1px solid ${mix(t.text, 12)}`, color: t.text };
  const Wrap = ({ children, className }: {children: React.ReactNode;className: string;}) =>
  href ?
  <Link to={href} className={className} style={box} aria-label={`KUBICU Trust Passport: ${label}${c.showScore ? `, ${passport.score} out of 100` : ''}. See the full passport.`}>
        {children}
      </Link> :

  <div className={className} style={box}>
        {children}
      </div>;


  const seal =
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: t.text, color: t.background }}>
      <ShieldCheckIcon size={19} aria-hidden />
    </span>;


  if (c.style === 'compact') {
    return (
      <Wrap className="flex items-center gap-3 px-4 py-3">
        {seal}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight">{label}</span>
          <span className="block truncate text-[12.5px]" style={{ color: t.mutedText }}>
            KUBICU Trust Passport{signals.length ? ` · ${signals.slice(0, 2).map((s) => s.title).join(' · ')}` : ''}
          </span>
        </span>
        {c.showScore &&
        <span className="shrink-0 text-[15px] font-semibold tabular-nums">
            {passport.score}
            <span className="text-[12px] font-normal" style={{ color: t.mutedText }}>
              /100
            </span>
          </span>
        }
        {href && <ChevronRightIcon size={16} aria-hidden style={{ color: t.mutedText }} />}
      </Wrap>);

  }

  return (
    <Wrap className="flex flex-col gap-4 p-5">
      <span className="flex items-center gap-3">
        {seal}
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px]" style={{ color: t.mutedText }}>
            KUBICU Trust Passport
          </span>
          <span className="block text-[19px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display }}>
            {label}
          </span>
        </span>
        {c.showScore &&
        <span className="text-[22px] font-semibold tabular-nums">
            {passport.score}
            <span className="text-[13px] font-normal" style={{ color: t.mutedText }}>
              /100
            </span>
          </span>
        }
      </span>
      {c.showScore &&
      <span className="block h-1.5 overflow-hidden rounded-full" style={{ background: mix(t.text, 10) }} aria-hidden>
          <span className="block h-full rounded-full" style={{ width: `${passport.score}%`, background: t.text }} />
        </span>
      }
      {signals.length > 0 ?
      <ul className="flex flex-col gap-2">
          {signals.map((s) =>
        <li key={s.id} className="flex items-start gap-2 text-[14px] leading-snug">
              <CheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{s.title}</span>
                <span style={{ color: t.mutedText }}> — {s.evidence}</span>
              </span>
            </li>
        )}
        </ul> :

      <span className="text-[13.5px]" style={{ color: t.mutedText }}>
          New on KUBICU — checks build up with verification, completed orders and verified reviews.
        </span>
      }
      <span className="flex items-center justify-between gap-3 text-[12.5px]" style={{ color: t.mutedText }}>
        <span>Built only from records KUBICU checks. The business can’t edit it.</span>
        {href &&
        <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold" style={{ color: t.text }}>
            Full passport <ChevronRightIcon size={14} aria-hidden />
          </span>
        }
      </span>
    </Wrap>);

}