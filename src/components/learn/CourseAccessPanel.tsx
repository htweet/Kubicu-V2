import React from 'react';
import { Link } from 'react-router-dom';
import { AwardIcon, LockIcon, PlayIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Course, Enrolment } from '../../types/courses';
import type { SubPlan } from '../../types/subscriptions';
import { intervalWord } from '../../utils/commerce/subscriptions';
import type { CourseAccessResult, CourseProgress } from '../../utils/commerce/courses';
import { buttonStyle, cardStyle, mix } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';
import { maskContact, type MemberSession } from '../../utils/members';

interface Props {
  theme: PageTheme;
  course: Course;
  access: CourseAccessResult;
  preview: boolean;
  session: MemberSession | null;
  progress: CourseProgress;
  enrolment?: Enrolment;
  planNames: string;
  handle: string;
  /** Membership plans that unlock this course and are open to join. */
  joinPlans: SubPlan[];
  /** Null when joining isn't available here (e.g. drafts). */
  onJoin: ((planId: string) => void) | null;
  /** Null when checkout isn't available here (e.g. drafts). */
  onBuy: (() => void) | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onContinue: () => void;
  onCertificate: () => void;
}

const blocked: Record<string, string> = {
  payment_pending: 'Your payment hasn’t been confirmed yet. Lessons open as soon as it is.',
  refunded: 'Access ended because this order was refunded or cancelled.',
  removed: 'The course owner removed your access. Message them if you think this is a mistake.',
  membership_lapsed: 'Your membership is paused or has ended. Lessons open again when it’s active — your progress is kept.',
  no_membership: 'This course comes with a membership you don’t have yet.',
};

/** What the visitor can do next: start, continue, buy, join or sign in (D197). */
export function CourseAccessPanel({ theme: t, course, access, preview, session, progress, enrolment, planNames, handle, joinPlans, onJoin, onBuy, onSignIn, onSignOut, onContinue, onCertificate }: Props) {
  const muted = { color: t.mutedText };
  const btn = 'flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold';
  const ok = access.ok || preview;
  const started = progress.done > 0;

  return (
    <div className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
      {ok ? (
        <>
          {!preview && (
            <div>
              <div className="flex items-baseline justify-between text-[13.5px]" style={{ color: t.text }}>
                <span className="font-semibold">{progress.pct}% done</span>
                <span style={muted}>
                  {progress.done} of {progress.total} lessons
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: mix(t.text, 10) }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.pct} aria-label="Course progress">
                <div className="h-full rounded-full" style={{ width: `${progress.pct}%`, background: t.accent }} />
              </div>
            </div>
          )}
          {enrolment?.completedAt && course.certificate ? (
            <button type="button" onClick={onCertificate} className={btn} style={buttonStyle(t, 'featured')}>
              <AwardIcon size={17} aria-hidden /> View your certificate
            </button>
          ) : (
            <button type="button" onClick={onContinue} className={btn} style={buttonStyle(t, 'featured')}>
              <PlayIcon size={16} aria-hidden /> {preview ? 'Open the first lesson' : started ? 'Continue where you left off' : 'Start the course'}
            </button>
          )}
          {enrolment?.completedAt && progress.nextLessonId === null && course.certificate && (
            <button type="button" onClick={onContinue} className="text-[13.5px] font-semibold underline underline-offset-2" style={{ color: t.text }}>
              Revisit the lessons
            </button>
          )}
        </>
      ) : course.access === 'free' ? (
        <>
          <p className="text-[22px] font-semibold" style={{ color: t.text }}>
            Free
          </p>
          <button type="button" onClick={onSignIn} className={btn} style={buttonStyle(t, 'featured')}>
            Start free
          </button>
          <p className="text-[12.5px]" style={muted}>
            Sign in with your phone or email so your progress is saved. No password.
          </p>
        </>
      ) : course.access === 'paid' && (access.reason === 'signed_out' || access.reason === 'not_bought') ? (
        <>
          <p className="text-[24px] font-semibold tabular-nums" style={{ color: t.text }}>
            {course.priceNgn ? formatNgn(course.priceNgn) : ''}
            <span className="ml-1.5 text-[13px] font-normal" style={muted}>
              one-off · keep access
            </span>
          </p>
          {onBuy ? (
            <button type="button" onClick={onBuy} className={btn} style={buttonStyle(t, 'featured')}>
              Buy the course
            </button>
          ) : (
            <span className={btn} style={{ ...buttonStyle(t, 'featured'), opacity: 0.55 }} aria-disabled>
              Buy the course
            </span>
          )}
          {!session && (
            <button type="button" onClick={onSignIn} className="text-[13.5px] font-semibold underline underline-offset-2" style={{ color: t.text }}>
              Already bought it? Sign in
            </button>
          )}
          {access.reason === 'not_bought' && (
            <p className="text-[12.5px]" style={muted}>
              We couldn’t find a purchase for this sign-in. Use the phone or email from your receipt.
            </p>
          )}
        </>
      ) : course.access === 'membership' && access.reason === 'signed_out' ? (
        <>
          <p className="text-[15px] font-semibold" style={{ color: t.text }}>
            Included with {planNames || 'a membership'}
          </p>
          <button type="button" onClick={onSignIn} className={btn} style={buttonStyle(t, 'featured')}>
            Members: sign in
          </button>
          <JoinOptions theme={t} plans={joinPlans} onJoin={onJoin} handle={handle} heading="Not a member yet?" />
        </>
      ) : (
        <>
          <p className="flex items-start gap-2 text-[14px]" style={{ color: t.text }} role="status">
            <LockIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
            {access.reason ? blocked[access.reason] ?? 'You don’t have access to this course.' : 'You don’t have access to this course.'}
          </p>
          {course.access === 'membership' && access.reason === 'no_membership' && <JoinOptions theme={t} plans={joinPlans} onJoin={onJoin} handle={handle} heading="Join to unlock it" />}
        </>
      )}
      {session && !preview && (
        <p className="text-[12.5px]" style={muted}>
          Signed in as {maskContact(session.contact, session.channel)} ·{' '}
          <button type="button" onClick={onSignOut} className="font-semibold underline underline-offset-2" style={{ color: t.text }}>
            Sign out
          </button>
        </p>
      )}
    </div>
  );
}

/** The membership plans that unlock the course, each opening sign-up right here. */
function JoinOptions({ theme: t, plans, onJoin, handle, heading }: { theme: PageTheme; plans: SubPlan[]; onJoin: ((planId: string) => void) | null; handle: string; heading: string }) {
  if (!plans.length || !onJoin)
    return (
      <p className="text-[12.5px]" style={{ color: t.mutedText }}>
        {!onJoin ? 'Joining is turned off in this preview.' : 'No membership is open to join right now. '}
        {onJoin && (
          <Link to={`/p/${handle}`} className="font-semibold underline underline-offset-2" style={{ color: t.text }}>
            Visit the page
          </Link>
        )}
      </p>
    );
  return (
    <div className="flex flex-col gap-2 pt-1" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
      <p className="pt-3 text-[13px] font-semibold" style={{ color: t.text }}>
        {heading}
      </p>
      {plans.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onJoin(p.id)}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
          style={buttonStyle(t, 'default')}
        >
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold">Join {p.name}</span>
            {p.trialDays > 0 && <span className="block text-[12px] opacity-75">{p.trialDays}-day free trial</span>}
          </span>
          <span className="shrink-0 text-[13.5px] tabular-nums">
            {formatNgn(p.priceNgn)}/{intervalWord[p.interval]}
          </span>
        </button>
      ))}
    </div>
  );
}
