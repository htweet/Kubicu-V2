import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyholeIcon, LogOutIcon, UserRoundCheckIcon } from 'lucide-react';
import type { MemberRule, PageTheme } from '../../types/page';
import { useMembers } from '../../contexts/MembersContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { useTrack } from '../../contexts/TrackContext';
import { useT } from '../../contexts/LocaleContext';
import { buttonStyle, cardRadius, fontsFor, mix } from '../blocks/pageStyle';
import { maskContact, ruleLabel, type AccessResult } from '../../utils/members';
import { subDate } from '../../utils/commerce/subscriptions';
import { formatMoney } from '../../utils/currency';

interface GateProps {
  theme: PageTheme;
  rule: MemberRule;
  title: string;
  teaser: string;
  joinLabel: string;
  /** Blocks hidden behind this gate (sections) — pages pass 0. */
  hiddenCount: number;
  kind: 'section' | 'page';
  id: string;
}

/**
 * What someone without access sees in place of members-only content (D110).
 * Follows the visitor's language (D502). The seller's own title, teaser, join label and plan names stay as written.
 */
export function MembersLocked({ theme: t, rule, title, teaser, joinLabel, hiddenCount, kind, id, access }: GateProps & {access: AccessResult;}) {
  const { t: tr } = useT();
  const members = useMembers();
  const catalog = useCatalog();
  const track = useTrack();
  useEffect(() => {
    track('member_gate', { label: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const eligible = (catalog?.subPlans ?? []).filter((p) => p.status === 'active' && (rule.access === 'any' || rule.planIds.includes(p.id)));
  const join = () => {
    const block = document.querySelector('[data-block-type="subscription"]');
    if (eligible.length !== 1 && block) {
      block.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    if (eligible[0]) members?.join?.(eligible[0].id);
  };
  const canJoin = !!members?.join && eligible.length > 0;
  const sub = access.sub;
  const portal = sub && members ? `/p/${sub.sourceHandle ?? members.handle}/subscription/${sub.token}` : null;
  const planName = sub ? catalog?.subPlans.find((p) => p.id === sub.planId)?.name ?? tr('Your plan') : '';
  const muted = { color: t.mutedText };
  const Heading = kind === 'page' ? 'h1' : 'h2';

  const message = (() => {
    switch (access.reason) {
      case 'paused':
        return {
          text: sub?.pausedUntil ? tr('Your membership is paused until {date}. Resume it to see this again.', { date: subDate(sub.pausedUntil) }) : tr('Your membership is paused. Resume it to see this again.'),
          link: tr('Resume my membership')
        };
      case 'ended':
        return { text: sub?.endedAt ? tr('Your membership ended on {date}. Join again to see this.', { date: subDate(sub.endedAt) }) : tr('Your membership ended. Join again to see this.'), link: null };
      case 'other_plan':
        return { text: tr('{plan} doesn’t include this — it’s for {who}. You can change plan from your membership page.', { plan: planName, who: ruleLabel(catalog, rule) }), link: tr('Change my plan') };
      case 'no_membership':
        return { text: tr('We can’t find a live membership for you any more. If you think that’s wrong, message the business.'), link: null };
      default:
        return null;
    }
  })();

  const perInterval = (price: string, interval: string) => interval === 'year' ? tr('{price} a year', { price }) : interval === 'month' ? tr('{price} a month', { price }) : `${price} / ${tr(interval)}`;

  return (
    <section aria-labelledby={`mo-${id}`} className="flex flex-col items-center gap-3 px-5 py-7 text-center" style={{ background: t.surface, borderRadius: cardRadius(t), border: `1px dashed ${mix(t.text, 28)}` }}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: mix(t.text, 8), color: t.text }}>
        <LockKeyholeIcon size={19} aria-hidden />
      </span>
      <p className="text-[12.5px] font-semibold" style={muted}>
        {tr('Members only')}
        {rule.access === 'plans' ? ` · ${ruleLabel(catalog, rule)}` : ''}
      </p>
      <Heading id={`mo-${id}`} className="text-[20px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
        {title || (kind === 'page' ? tr('This page is for members') : tr('For members'))}
      </Heading>
      {teaser &&
      <p className="max-w-sm text-[14.5px] leading-relaxed" style={muted}>
          {teaser}
        </p>
      }
      {hiddenCount > 1 &&
      <p className="text-[12.5px]" style={muted}>
          {tr('Sections for members: {n}', { n: hiddenCount })}
        </p>
      }
      {message &&
      <p role="status" className="max-w-sm rounded-[12px] px-3.5 py-2.5 text-[13.5px] leading-relaxed" style={{ background: mix(t.text, 6), color: t.text }}>
          {message.text}
          {message.link && portal &&
        <>
              {' '}
              <Link to={portal} className="font-semibold underline underline-offset-2">
                {message.link}
              </Link>
            </>
        }
        </p>
      }
      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        {canJoin && access.reason !== 'paused' && access.reason !== 'other_plan' && (
        kind === 'page' && eligible.length > 1 ?
        // A whole locked page has no Subscription block to scroll to, so offer each plan here.
        <div role="group" aria-label={joinLabel || tr('Become a member')} className="flex flex-col gap-2">
              {eligible.map((p, i) =>
          // Plan name and price sit on two deliberate lines so long names never wrap mid-label.
          <button key={p.id} type="button" onClick={() => members?.join?.(p.id)} className="flex min-h-[52px] w-full flex-col items-center justify-center px-4 py-1.5" style={buttonStyle(t, i === 0 ? 'featured' : 'default')}>
                  <span className="max-w-full truncate text-[15px] font-semibold">{tr('Join {plan}', { plan: p.name })}</span>
                  <span className="text-[12.5px] font-medium">{perInterval(formatMoney(p.priceNgn), p.interval)}</span>
                </button>
          )}
            </div> :

        <button type="button" onClick={join} className="flex h-12 w-full items-center justify-center text-[15px] font-semibold" style={buttonStyle(t, 'featured')}>
              {joinLabel || tr('Become a member')}
            </button>)
        }
        {access.reason === 'signed_out' ?
        <p className="text-[13.5px]" style={muted}>
            {tr('Already a member?')}{' '}
            <button type="button" onClick={() => members?.openSignIn()} className="font-semibold underline underline-offset-2" style={{ color: t.text }} disabled={!members}>
              {tr('Sign in')}
            </button>
          </p> :

        members?.session &&
        <p className="text-[12.5px]" style={muted}>
              {tr('Signed in as {who}', { who: maskContact(members.session.contact, members.session.channel) })} ·{' '}
              <button type="button" onClick={() => members.signOut()} className="font-semibold underline underline-offset-2" style={{ color: t.text }}>
                {tr('Sign out')}
              </button>
            </p>

        }
      </div>
    </section>);

}

/** Slim strip above members-only content for someone who has access. Follows the visitor's language (D502). */
export function MembersOpenBar({ theme: t, title, id, access }: {theme: PageTheme;title: string;id: string;access: AccessResult;}) {
  const { t: tr } = useT();
  const members = useMembers();
  const catalog = useCatalog();
  const track = useTrack();
  useEffect(() => {
    track('member_view', { label: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const sub = access.sub;
  const planName = sub ? catalog?.subPlans.find((p) => p.id === sub.planId)?.name : null;
  const portal = sub && members ? `/p/${sub.sourceHandle ?? members.handle}/subscription/${sub.token}` : null;
  const linkStyle = { color: t.text };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 text-[13px]" style={{ background: mix(t.text, 6), borderRadius: cardRadius(t), color: t.text }}>
      <UserRoundCheckIcon size={16} aria-hidden className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{title || tr('Members area')}</span>
        <span style={{ color: t.mutedText }}>
          {' '}
          · {members?.preview === 'member' ? tr('Previewing as a member') : planName ? tr('Member: {plan}', { plan: planName }) : tr('Member')}
        </span>
      </span>
      {members?.preview !== 'member' &&
      <span className="flex items-center gap-3">
          {portal &&
        <Link to={portal} className="font-semibold underline underline-offset-2" style={linkStyle}>
              {tr('My membership')}
            </Link>
        }
          {members?.session &&
        <button type="button" onClick={() => members.signOut()} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2" style={linkStyle}>
              <LogOutIcon size={13} aria-hidden /> {tr('Sign out')}
            </button>
        }
        </span>
      }
    </div>);

}