import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, CircleIcon, ClockIcon, EyeIcon, LockIcon } from 'lucide-react';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { useCourseLearner } from '../hooks/useCourseLearner';
import { usePageOps } from '../hooks/usePageOps';
import { upsertContact } from '../utils/ops/ops';
import { newSession, normalisePhone } from '../utils/members';
import { announce } from '../utils/announce';
import { CartProvider, useCart } from '../contexts/CartContext';
import { PageSurface } from '../components/blocks/PageSurface';
import { buttonStyle, fontsFor, mix } from '../components/blocks/pageStyle';
import { MediaImage } from '../components/media/MediaImage';
import { CheckoutSheet } from '../components/checkout/CheckoutSheet';
import { MemberSignInSheet } from '../components/members/MemberSignInSheet';
import { CourseOutline } from '../components/learn/CourseOutline';
import { LessonContent } from '../components/learn/LessonContent';
import { CourseCertificate } from '../components/learn/CourseCertificate';
import { CourseAccessPanel } from '../components/learn/CourseAccessPanel';
import { accessLabels, allLessons, durationLabel, findCourse, lessonCount, moduleOpensAt, totalMinutes } from '../utils/commerce/courses';
import { liveCanComplete } from '../utils/commerce/liveLessons';
import { SubscribeSheet } from '../components/subscriptions/SubscribeSheet';
import type { SubPlan } from '../types/subscriptions';
import { Unavailable } from './PublicPage';

/** A course's public page: overview and outline, the lesson player, and the certificate (D197). */
export function LearnPage() {
  const { handle = '', courseId = '' } = useParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const course = findCourse(commerce.data, courseId);
  if (!page) return <Unavailable handle={handle} />;
  if (!course || course.status !== 'published' && !page.isOwn) return <Unavailable handle={handle} title="This course isn’t available" body="It may have been unpublished. Check the link, or visit the seller’s page." />;
  return (
    <CartProvider pageKey={`${page.workspaceId ?? 'example'}:${handle}:learn`}>
      <LearnBody />
    </CartProvider>);

}

function LearnBody() {
  const { handle = '', courseId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const page = useResolvedPage(handle)!;
  const commerce = usePageCommerce(page.workspaceId, page.isOwn);
  const course = findCourse(commerce.data, courseId)!;
  const ops = usePageOps(page.workspaceId, page.isOwn);
  const cart = useCart();
  const preview = page.isOwn && course.status !== 'published';
  const learner = useCourseLearner(course, commerce, page.workspaceId, preview);
  const [signInOpen, setSignInOpen] = useState(false);
  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const open = learner.access.ok || preview;

  const lessonId = params.get('lesson');
  const view: 'overview' | 'lesson' | 'certificate' = params.get('certificate') ? 'certificate' : lessonId ? 'lesson' : 'overview';
  const flat = useMemo(() => allLessons(course), [course]);
  const index = flat.findIndex((x) => x.lesson.id === lessonId);
  const current = index >= 0 ? flat[index] : undefined;
  const locked = current ? !current.lesson.preview && (!open || moduleOpensAt(course, learner.enrolment, current.moduleIndex) !== null) : false;
  const done = new Set(learner.enrolment?.completedLessonIds ?? []);

  useEffect(() => {
    if (current && !locked) learner.actions.visit(current.lesson.id);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const go = (id: string | null) => setParams(id ? { lesson: id } : {});
  const continueId = learner.enrolment?.lastLessonId && !done.has(learner.enrolment.lastLessonId) ? learner.enrolment.lastLessonId : learner.progress.nextLessonId ?? flat[0]?.lesson.id ?? null;
  const product = course.productId ? commerce.data?.products.find((p) => p.id === course.productId) : undefined;
  const onBuy = product && product.status === 'active' && cart && !preview ? () => cart.add(product.id, product.variants[0]?.id) : null;
  const planNames = course.planIds.map((id) => commerce.data?.subPlans.find((p) => p.id === id)?.name).filter(Boolean).join(' or ');
  const joinPlans = course.planIds.
  map((id) => commerce.data?.subPlans.find((p) => p.id === id)).
  filter((p): p is SubPlan => !!p && p.status === 'active');
  const [joinPlanId, setJoinPlanId] = useState<string | null>(null);
  const outcomes = course.outcomes.split('\n').map((o) => o.trim()).filter(Boolean);

  const panel =
  <CourseAccessPanel
    theme={t}
    course={course}
    access={learner.access}
    preview={preview}
    session={learner.session}
    progress={learner.progress}
    enrolment={learner.enrolment}
    planNames={planNames}
    handle={handle}
    joinPlans={joinPlans}
    onJoin={preview || page.example ? null : (id) => setJoinPlanId(id)}
    onBuy={onBuy}
    onSignIn={() => setSignInOpen(true)}
    onSignOut={learner.signOut}
    onContinue={() => go(continueId)}
    onCertificate={() => setParams({ certificate: '1' })} />;



  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t} columnClassName="max-w-[1120px] md:px-8">
        <main className="flex flex-col gap-6 py-6">
          {preview &&
          <p role="note" className="flex items-center gap-2 rounded-md px-3.5 py-2.5 text-[13px]" style={{ background: mix('#d9a400', 16, t.background), color: t.text }}>
              <EyeIcon size={14} aria-hidden /> Preview of a draft — only you can see it. Every lesson is open and progress isn’t saved.
            </p>
          }

          {view === 'overview' &&
          <>
              <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
                <ArrowLeftIcon size={15} aria-hidden /> {page.doc.title}
              </Link>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <div className="flex min-w-0 flex-col gap-6">
                  {course.coverUrl && <MediaImage src={course.coverUrl} alt={course.coverAlt} className="aspect-[16/9] w-full object-cover" style={{ borderRadius: 12 }} />}
                  <header className="flex flex-col gap-2">
                    <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.015em] md:text-[40px]" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                      {course.title}
                    </h1>
                    {course.subtitle &&
                  <p className="max-w-[60ch] text-[17px] leading-relaxed" style={muted}>
                        {course.subtitle}
                      </p>
                  }
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]" style={muted}>
                      <span>{lessonCount(course)} lessons</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon size={13} aria-hidden /> {durationLabel(totalMinutes(course))}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{accessLabels[course.access]}</span>
                      {course.instructor &&
                    <>
                          <span aria-hidden>·</span>
                          <span>Taught by {course.instructor}</span>
                        </>
                    }
                      {course.release === 'drip' &&
                    <>
                          <span aria-hidden>·</span>
                          <span>A new module every {course.dripDays} days</span>
                        </>
                    }
                    </p>
                  </header>
                  <div className="lg:hidden">{panel}</div>
                  {outcomes.length > 0 &&
                <section aria-labelledby="outcomes" className="flex flex-col gap-3">
                      <h2 id="outcomes" className="text-[20px] font-medium" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                        What you’ll be able to do
                      </h2>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {outcomes.map((o) =>
                    <li key={o} className="flex items-start gap-2 text-[15px] leading-snug" style={{ color: t.text }}>
                            <CheckCircle2Icon size={16} className="mt-0.5 shrink-0" style={{ color: t.accent }} aria-hidden /> {o}
                          </li>
                    )}
                      </ul>
                    </section>
                }
                  {course.description &&
                <section aria-labelledby="about" className="flex flex-col gap-3">
                      <h2 id="about" className="text-[20px] font-medium" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                        About the course
                      </h2>
                      {course.description.split(/\n\s*\n/).map((p, i) =>
                  <p key={i} className="max-w-[68ch] whitespace-pre-line text-[15.5px] leading-[1.7]" style={{ color: t.text }}>
                          {p}
                        </p>
                  )}
                    </section>
                }
                  <section aria-labelledby="outline" className="flex flex-col gap-4">
                    <h2 id="outline" className="text-[20px] font-medium" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                      Lessons
                    </h2>
                    <CourseOutline theme={t} course={course} enrolment={learner.enrolment} open={open} onOpen={go} />
                  </section>
                </div>
                <aside className="hidden lg:sticky lg:top-6 lg:block">{panel}</aside>
              </div>
            </>
          }

          {view === 'lesson' &&
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
              <aside className="order-2 lg:order-1 lg:sticky lg:top-6">
                <button type="button" onClick={() => go(null)} className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium" style={muted}>
                  <ArrowLeftIcon size={15} aria-hidden /> {course.title}
                </button>
                <CourseOutline theme={t} course={course} enrolment={learner.enrolment} open={open} currentLessonId={lessonId} onOpen={go} compact />
              </aside>
              <article className="order-1 flex min-w-0 flex-col gap-6 lg:order-2" aria-labelledby="lesson-title">
                {!current ?
              <p style={{ color: t.text }}>This lesson isn’t part of the course any more.</p> :

              <>
                    <header>
                      <p className="text-[13px]" style={muted}>
                        {current.module.title} · Lesson {index + 1} of {flat.length}
                      </p>
                      <h1 id="lesson-title" className="mt-1 text-[28px] font-medium leading-tight md:text-[32px]" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                        {current.lesson.title}
                      </h1>
                    </header>
                    {locked ?
                <div className="flex flex-col gap-4">
                        <p className="flex items-start gap-2 rounded-md px-4 py-4 text-[14.5px]" style={{ background: mix(t.text, 5), color: t.text }} role="status">
                          <LockIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
                          {open ? `This module opens on ${new Date(moduleOpensAt(course, learner.enrolment, current.moduleIndex) ?? Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.` : 'Enrol to open this lesson.'}
                        </p>
                        {!open && panel}
                      </div> :

                <>
                        <LessonContent
                    theme={t}
                    lesson={current.lesson}
                    passPct={course.passPct}
                    bestScore={learner.enrolment?.quizScores[current.lesson.id]}
                    onQuiz={learner.actions.quiz ? (score) => learner.actions.quiz?.(current.lesson, score) : null}
                    courseTitle={course.title} />
                  
                        {!open && current.lesson.preview &&
                  <div className="flex flex-col gap-3 pt-2" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
                            <p className="pt-4 text-[15px] font-semibold" style={{ color: t.text }}>
                              Enjoyed the preview?
                            </p>
                            {panel}
                          </div>
                  }
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
                          {learner.canSave && current.lesson.kind !== 'quiz' && (current.lesson.kind !== 'live' || liveCanComplete(current.lesson) || done.has(current.lesson.id)) ?
                    <button
                      type="button"
                      aria-pressed={done.has(current.lesson.id)}
                      onClick={() => learner.actions.toggleDone(current.lesson.id, !done.has(current.lesson.id))}
                      className="flex h-12 items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                      style={buttonStyle(t, done.has(current.lesson.id) ? 'default' : 'featured')}>
                      
                              {done.has(current.lesson.id) ? <CheckCircle2Icon size={17} aria-hidden /> : <CircleIcon size={17} aria-hidden />}
                              {done.has(current.lesson.id) ? 'Done' : 'Mark as done'}
                            </button> :

                    <span className="text-[13px]" style={muted}>
                              {current.lesson.kind === 'quiz' && learner.canSave ? `Pass with ${course.passPct}% to mark it done.` : current.lesson.kind === 'live' && learner.canSave ? 'You can mark it done once the session starts, or when the recording is added.' : ''}
                            </span>
                    }
                          <div className="flex gap-2">
                            {index > 0 &&
                      <button type="button" onClick={() => go(flat[index - 1].lesson.id)} className="flex h-12 flex-1 items-center justify-center gap-1.5 px-4 text-[14px] font-semibold sm:flex-none" style={buttonStyle(t, 'default')}>
                                <ArrowLeftIcon size={15} aria-hidden /> Previous
                              </button>
                      }
                            {index < flat.length - 1 ?
                      <button type="button" onClick={() => go(flat[index + 1].lesson.id)} className="flex h-12 flex-1 items-center justify-center gap-1.5 px-4 text-[14px] font-semibold sm:flex-none" style={buttonStyle(t, 'default')}>
                                Next <ArrowRightIcon size={15} aria-hidden />
                              </button> :
                      learner.enrolment?.completedAt && course.certificate ?
                      <button type="button" onClick={() => setParams({ certificate: '1' })} className="flex h-12 flex-1 items-center justify-center px-4 text-[14px] font-semibold sm:flex-none" style={buttonStyle(t, 'featured')}>
                                Get your certificate
                              </button> :
                      null}
                          </div>
                        </div>
                      </>
                }
                  </>
              }
              </article>
            </div>
          }

          {view === 'certificate' &&
          <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
              <button type="button" onClick={() => go(null)} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium print:hidden" style={muted}>
                <ArrowLeftIcon size={15} aria-hidden /> {course.title}
              </button>
              {learner.enrolment?.completedAt && course.certificate ?
            <CourseCertificate theme={t} course={course} enrolment={learner.enrolment} business={page.doc.title} onSaveName={learner.actions.saveName} /> :

            <p style={{ color: t.text }}>Finish every lesson to get your certificate.</p>
            }
            </div>
          }
        </main>
      </PageSurface>

      {commerce.data && <CheckoutSheet theme={t} commerce={commerce} ownerPlan={page.plan.id} handle={handle} workspaceId={page.example ? null : page.workspaceId} businessName={page.doc.title} />}
      {commerce.data &&
      <SubscribeSheet
        theme={t}
        commerce={commerce}
        planId={joinPlanId}
        handle={handle}
        ownerPlan={page.plan.id}
        returnTo={`/p/${handle}/learn/${course.id}?joined=1`}
        onClose={() => setJoinPlanId(null)}
        onSubscribed={(c, planName, consent) => {
          ops.apply((d) => upsertContact(d, c, 'order', `Subscribed to ${planName}`, { consent: consent ? 'subscribed' : 'transactional' }));
          // They just joined with this phone (or email) — sign them in with it, so the course opens
          // even if they were signed in with a different number before.
          const s = c.phone ? newSession(normalisePhone(c.phone), 'phone') : newSession(c.email.trim().toLowerCase(), 'email');
          learner.signIn(s);
          announce(`You’ve joined ${planName}. ${course.title} is now open.`);
        }} />

      }
      <MemberSignInSheet
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        theme={t}
        data={commerce.data}
        business={page.doc.title}
        onJoin={null}
        canSignIn={learner.canSignIn}
        copy={{
          title: course.access === 'free' ? 'Start the course' : 'Sign in to your course',
          intro: course.access === 'free' ? `Enter your phone or email and we’ll send a one-time code. Your progress is saved to it — no password, and ${page.doc.title} can see you enrolled.` : `Use the phone number or email you ${course.access === 'paid' ? 'bought the course' : 'subscribed'} with. We’ll send a one-time code — no password needed.`,
          notFound: course.access === 'paid' ? `We couldn’t find a purchase of ${course.title}` : `We couldn’t find a membership with ${page.doc.title}`,
          joinLabel: 'See memberships'
        }}
        onSignedIn={(s) => {
          learner.signIn(s);
          setSignInOpen(false);
        }} />
      
    </div>);

}