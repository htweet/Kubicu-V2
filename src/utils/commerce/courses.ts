import type { CommerceData, Order, Product } from '../../types/commerce';
import type { Course, CourseLesson, CourseModule, Enrolment, EnrolmentSource, LessonKind, QuizQuestion } from '../../types/courses';
import type { WorkspacePlan } from '../../types/plan';
import { uid } from '../id';
import { checkAccess, normalisePhone, type MemberSession } from '../members';
import { planAtLeast } from '../../data/plans';

/**
 * Courses (D197). A course is modules of lessons. Free courses enrol on sign-in; paid courses are sold
 * through a hidden companion product so the usual checkout, orders and refunds apply; membership
 * courses open for active subscribers of chosen plans. Access is worked out again on every view.
 * Prototype: lessons are only hidden in the browser, and sign-in codes are shown on screen.
 */

export const MAX_MODULES = 20;
export const MAX_LESSONS_PER_MODULE = 30;
export const MAX_QUESTIONS = 10;
/** Free courses need Creator; paid ones go through checkout, so Pro. */
export const COURSE_PLAN: WorkspacePlan = 'creator';
export const PAID_COURSE_PLAN: WorkspacePlan = 'pro';
const DAY = 86_400_000;

export const lessonKindLabels: Record<LessonKind, string> = { video: 'Video', text: 'Reading', file: 'File', quiz: 'Quiz' };
export const accessLabels: Record<Course['access'], string> = { free: 'Free', paid: 'Paid', membership: 'With a membership' };
export const enrolSourceLabels: Record<EnrolmentSource, string> = { free: 'Signed up free', order: 'Bought', membership: 'Membership', manual: 'Added by you' };

export function coursesOf(data: CommerceData | null | undefined): Course[] {
  return data?.courses ?? [];
}

export function findCourse(data: CommerceData | null | undefined, id: string | undefined): Course | undefined {
  return id ? coursesOf(data).find((c) => c.id === id) : undefined;
}

export function enrolmentsFor(data: CommerceData | null | undefined, courseId: string): Enrolment[] {
  return (data?.enrolments ?? []).filter((e) => e.courseId === courseId && !e.removedAt);
}

// ——— Building ———

export function blankLesson(kind: LessonKind = 'video'): CourseLesson {
  return { id: uid('les'), title: '', kind, videoUrl: '', body: '', fileName: '', fileSizeBytes: 0, questions: kind === 'quiz' ? [blankQuestion()] : [], minutes: kind === 'quiz' ? 5 : 10, preview: false };
}

export function blankQuestion(): QuizQuestion {
  return { id: uid('q'), prompt: '', options: ['', ''], correct: 0 };
}

export function blankModule(n: number): CourseModule {
  return { id: uid('mod'), title: `Module ${n}`, lessons: [] };
}

export function blankCourse(): Course {
  const at = new Date().toISOString();
  return {
    id: uid('course'),
    title: '',
    subtitle: '',
    description: '',
    outcomes: '',
    coverUrl: '',
    coverAlt: '',
    status: 'draft',
    access: 'free',
    priceNgn: null,
    planIds: [],
    release: 'all',
    dripDays: 7,
    passPct: 70,
    certificate: true,
    instructor: '',
    modules: [blankModule(1)],
    createdAt: at,
    updatedAt: at
  };
}

export function allLessons(course: Course): {lesson: CourseLesson;module: CourseModule;moduleIndex: number;}[] {
  return course.modules.flatMap((module, moduleIndex) => module.lessons.map((lesson) => ({ lesson, module, moduleIndex })));
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function totalMinutes(course: Course): number {
  return allLessons(course).reduce((n, { lesson }) => n + Math.max(0, lesson.minutes || 0), 0);
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Why a lesson isn't ready to publish, or null. */
export function lessonIssue(l: CourseLesson): string | null {
  if (!l.title.trim()) return 'Add a lesson title';
  if (l.kind === 'video' && !l.videoUrl.trim()) return 'Add a video link';
  if (l.kind === 'text' && !l.body.trim()) return 'Write the lesson';
  if (l.kind === 'file' && !l.fileName) return 'Upload a file';
  if (l.kind === 'quiz') {
    if (l.questions.length === 0) return 'Add a question';
    if (l.questions.some((q) => !q.prompt.trim() || q.options.filter((o) => o.trim()).length < 2 || !q.options[q.correct]?.trim())) return 'Each question needs a prompt, two answers and a correct answer';
  }
  return null;
}

/** Everything stopping a course going live. */
export function publishIssues(data: CommerceData, course: Course, plan: WorkspacePlan): string[] {
  const out: string[] = [];
  if (!course.title.trim()) out.push('Add a course title');
  if (lessonCount(course) === 0) out.push('Add at least one lesson');
  if (course.modules.some((m) => !m.title.trim())) out.push('Give every module a title');
  const bad = allLessons(course).filter(({ lesson }) => lessonIssue(lesson)).length;
  if (bad) out.push(bad === 1 ? '1 lesson isn’t finished' : `${bad} lessons aren’t finished`);
  if (!planAtLeast(plan, COURSE_PLAN)) out.push('Courses need the Creator plan');
  if (course.access === 'paid') {
    if (!course.priceNgn || course.priceNgn < 100) out.push('Set a price of at least ₦100');
    if (!planAtLeast(plan, PAID_COURSE_PLAN)) out.push('Paid courses go through checkout, which needs Pro');
  }
  if (course.access === 'membership') {
    const live = course.planIds.filter((id) => data.subPlans.some((p) => p.id === id && p.status === 'active'));
    if (live.length === 0) out.push('Choose at least one live membership plan');
  }
  return out;
}

/** Keeps the hidden companion product in step with a paid course (name, price, status). */
function syncProduct(data: CommerceData, course: Course): {products: Product[];productId?: string;} {
  const existing = course.productId ? data.products.find((p) => p.id === course.productId) : undefined;
  const wantsProduct = course.access === 'paid';
  if (!wantsProduct && !existing) return { products: data.products, productId: course.productId };
  const status: Product['status'] = wantsProduct && course.status === 'published' ? 'active' : course.status === 'archived' ? 'archived' : 'draft';
  const at = new Date().toISOString();
  const base: Product = existing ?? {
    id: uid('prd'),
    name: '',
    description: '',
    status: 'draft',
    kind: 'course',
    priceNgn: null,
    compareAtNgn: null,
    images: [],
    options: [],
    variants: [{ id: uid('var'), sku: 'COURSE', options: {}, priceNgn: null, stock: 0 }],
    collectionIds: [],
    trackStock: false,
    lowStockAt: 0,
    weightKg: null,
    courseId: course.id,
    sample: course.sample,
    createdAt: at,
    updatedAt: at
  };
  const next: Product = {
    ...base,
    name: course.title || 'Untitled course',
    description: [course.subtitle, course.description].filter(Boolean).join('\n\n'),
    priceNgn: course.priceNgn,
    images: course.coverUrl ? [{ id: base.images[0]?.id ?? uid('img'), url: course.coverUrl, alt: course.coverAlt }] : [],
    status: wantsProduct ? status : 'draft',
    updatedAt: at
  };
  return { products: existing ? data.products.map((p) => p.id === next.id ? next : p) : [...data.products, next], productId: next.id };
}

export function upsertCourse(data: CommerceData, course: Course): CommerceData {
  const { products, productId } = syncProduct(data, course);
  const saved: Course = { ...course, productId, updatedAt: new Date().toISOString() };
  const list = coursesOf(data);
  const courses = list.some((c) => c.id === saved.id) ? list.map((c) => c.id === saved.id ? saved : c) : [saved, ...list];
  return { ...data, products, courses };
}

/** Only courses nobody has enrolled in can be deleted; others are archived. */
export function deleteCourse(data: CommerceData, id: string): CommerceData {
  const course = findCourse(data, id);
  if (!course) return data;
  return {
    ...data,
    courses: coursesOf(data).filter((c) => c.id !== id),
    products: course.productId ? data.products.filter((p) => p.id !== course.productId || data.orders.some((o) => o.items.some((i) => i.productId === p.id))) : data.products
  };
}

// ——— Enrolling ———

function matches(e: Enrolment, session: Pick<MemberSession, 'contact' | 'channel'>): boolean {
  return session.channel === 'phone' ? !!e.phone && e.phone === session.contact : !!e.email && e.email === session.contact;
}

export function enrolmentOf(data: CommerceData | null | undefined, courseId: string, session: Pick<MemberSession, 'contact' | 'channel'> | null): Enrolment | undefined {
  if (!session) return undefined;
  return enrolmentsFor(data, courseId).find((e) => matches(e, session));
}

function newEnrolment(courseId: string, who: {phone?: string;email?: string;name?: string;}, source: EnrolmentSource, orderId?: string): Enrolment {
  return {
    id: uid('enr'),
    courseId,
    phone: who.phone ? normalisePhone(who.phone) : '',
    email: (who.email ?? '').trim().toLowerCase(),
    name: (who.name ?? '').trim(),
    source,
    orderId,
    enrolledAt: new Date().toISOString(),
    completedLessonIds: [],
    quizScores: {}
  };
}

/** Creates the learner's enrolment if they don't have one (free sign-up, or first visit with a membership). */
export function ensureEnrolment(data: CommerceData, courseId: string, session: MemberSession, source: EnrolmentSource): CommerceData {
  if (enrolmentOf(data, courseId, session)) return data;
  const who = session.channel === 'phone' ? { phone: session.contact } : { email: session.contact };
  return { ...data, enrolments: [...(data.enrolments ?? []), newEnrolment(courseId, who, source)] };
}

/** The seller adds someone by hand (e.g. paid by transfer). */
export function addLearner(data: CommerceData, courseId: string, who: {name: string;phone: string;email: string;}): CommerceData {
  return { ...data, enrolments: [...(data.enrolments ?? []), newEnrolment(courseId, who, 'manual')] };
}

export function removeLearner(data: CommerceData, enrolmentId: string): CommerceData {
  return { ...data, enrolments: (data.enrolments ?? []).map((e) => e.id === enrolmentId ? { ...e, removedAt: new Date().toISOString() } : e) };
}

/** Called when an order is placed: one enrolment per course bought, matched by phone and email. */
export function enrolFromOrder(data: CommerceData, order: Order): CommerceData {
  const courseIds = order.items.
  filter((i) => i.kind === 'course').
  map((i) => data.products.find((p) => p.id === i.productId)?.courseId).
  filter((id): id is string => !!id);
  if (!courseIds.length) return data;
  const phone = order.customer.phone ? normalisePhone(order.customer.phone) : '';
  const email = order.customer.email.trim().toLowerCase();
  let enrolments = [...(data.enrolments ?? [])];
  courseIds.forEach((courseId) => {
    const found = enrolments.find((e) => e.courseId === courseId && !e.removedAt && (phone && e.phone === phone || email && e.email === email));
    if (found) enrolments = enrolments.map((e) => e.id === found.id ? { ...e, source: 'order', orderId: order.id, phone: e.phone || phone, email: e.email || email, name: e.name || order.customer.name } : e);else
    enrolments.push(newEnrolment(courseId, { phone, email, name: order.customer.name }, 'order', order.id));
  });
  return { ...data, enrolments };
}

// ——— Access ———

export type CourseAccessReason = 'unpublished' | 'signed_out' | 'not_bought' | 'payment_pending' | 'refunded' | 'no_membership' | 'membership_lapsed' | 'removed';

export interface CourseAccessResult {
  ok: boolean;
  reason?: CourseAccessReason;
  enrolment?: Enrolment;
}

export function courseAccess(data: CommerceData | null, course: Course, session: MemberSession | null, now = Date.now()): CourseAccessResult {
  if (course.status !== 'published') return { ok: false, reason: 'unpublished' };
  if (!session) return { ok: false, reason: 'signed_out' };
  const enrolment = enrolmentOf(data, course.id, session);
  const removed = (data?.enrolments ?? []).some((e) => e.courseId === course.id && e.removedAt && matches(e, session)) && !enrolment;
  if (removed) return { ok: false, reason: 'removed' };
  if (enrolment?.source === 'manual') return { ok: true, enrolment };
  if (course.access === 'free') return { ok: true, enrolment };
  if (course.access === 'membership') {
    const r = checkAccess(data, session, { access: 'plans', planIds: course.planIds }, now);
    if (r.ok) return { ok: true, enrolment };
    return { ok: false, reason: r.reason === 'no_membership' || r.reason === 'other_plan' ? 'no_membership' : 'membership_lapsed', enrolment };
  }
  // Paid: the order behind the enrolment must still be paid.
  if (!enrolment?.orderId) return { ok: false, reason: 'not_bought' };
  const order = data?.orders.find((o) => o.id === enrolment.orderId);
  if (!order || order.status === 'cancelled' || order.status === 'refunded' || order.paymentStatus === 'refunded' || order.paymentStatus === 'cancelled') return { ok: false, reason: 'refunded', enrolment };
  if (order.paymentStatus === 'pending') return { ok: false, reason: 'payment_pending', enrolment };
  return { ok: true, enrolment };
}

/** When a module opens for this learner (drip release), or null if it's open now. */
export function moduleOpensAt(course: Course, enrolment: Enrolment | undefined, moduleIndex: number, now = Date.now()): number | null {
  if (course.release !== 'drip' || moduleIndex === 0 || !enrolment) return null;
  const at = Date.parse(enrolment.enrolledAt) + moduleIndex * Math.max(1, course.dripDays) * DAY;
  return at > now ? at : null;
}

export interface CourseProgress {
  done: number;
  total: number;
  pct: number;
  /** The lesson to pick up from. */
  nextLessonId: string | null;
}

export function progressOf(course: Course, enrolment: Enrolment | undefined): CourseProgress {
  const lessons = allLessons(course);
  const doneIds = new Set(enrolment?.completedLessonIds ?? []);
  const done = lessons.filter(({ lesson }) => doneIds.has(lesson.id)).length;
  const total = lessons.length;
  const next = lessons.find(({ lesson }) => !doneIds.has(lesson.id))?.lesson.id ?? null;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0, nextLessonId: next };
}

function patchEnrolment(data: CommerceData, enrolmentId: string, fn: (e: Enrolment) => Enrolment): CommerceData {
  return { ...data, enrolments: (data.enrolments ?? []).map((e) => e.id === enrolmentId ? fn(e) : e) };
}

function withCompletion(course: Course, e: Enrolment): Enrolment {
  const p = progressOf(course, e);
  if (p.total > 0 && p.done === p.total && !e.completedAt) {
    return { ...e, completedAt: new Date().toISOString(), certificateNo: course.certificate ? `KUB-${course.id.slice(-4).toUpperCase()}-${uid('c').slice(-6).toUpperCase()}` : undefined };
  }
  return e;
}

export function markLesson(data: CommerceData, course: Course, enrolmentId: string, lessonId: string, done: boolean): CommerceData {
  return patchEnrolment(data, enrolmentId, (e) => {
    const ids = new Set(e.completedLessonIds);
    if (done) ids.add(lessonId);else
    ids.delete(lessonId);
    return withCompletion(course, { ...e, completedLessonIds: [...ids], lastLessonId: lessonId, lastAt: new Date().toISOString() });
  });
}

export function visitLesson(data: CommerceData, enrolmentId: string, lessonId: string): CommerceData {
  return patchEnrolment(data, enrolmentId, (e) => ({ ...e, lastLessonId: lessonId, lastAt: new Date().toISOString() }));
}

/** Records a quiz attempt; a pass counts the lesson as done. Returns the score. */
export function scoreQuiz(lesson: CourseLesson, answers: Record<string, number>): number {
  if (!lesson.questions.length) return 0;
  const right = lesson.questions.filter((q) => answers[q.id] === q.correct).length;
  return Math.round(right / lesson.questions.length * 100);
}

export function recordQuiz(data: CommerceData, course: Course, enrolmentId: string, lesson: CourseLesson, score: number): CommerceData {
  return patchEnrolment(data, enrolmentId, (e) => {
    const best = Math.max(score, e.quizScores[lesson.id] ?? 0);
    const ids = new Set(e.completedLessonIds);
    if (score >= course.passPct) ids.add(lesson.id);
    return withCompletion(course, { ...e, quizScores: { ...e.quizScores, [lesson.id]: best }, completedLessonIds: [...ids], lastLessonId: lesson.id, lastAt: new Date().toISOString() });
  });
}

export function setLearnerName(data: CommerceData, enrolmentId: string, name: string): CommerceData {
  return patchEnrolment(data, enrolmentId, (e) => ({ ...e, name: name.trim().slice(0, 80) }));
}

export function learnUrl(handle: string, courseId: string, lessonId?: string): string {
  return `/p/${handle}/learn/${courseId}${lessonId ? `?lesson=${lessonId}` : ''}`;
}

/** Seller-facing summary of learners for one course. */
export function courseStats(data: CommerceData, course: Course): {learners: number;completed: number;avgPct: number;revenueNgn: number;} {
  const list = enrolmentsFor(data, course.id);
  const pcts = list.map((e) => progressOf(course, e).pct);
  const revenueNgn = course.productId ?
  data.orders.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded').reduce((s, o) => s + o.items.filter((i) => i.productId === course.productId).reduce((t, i) => t + i.unitPriceNgn * i.qty, 0), 0) :
  0;
  return { learners: list.length, completed: list.filter((e) => e.completedAt).length, avgPct: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0, revenueNgn };
}