import { useEffect, useMemo, useState } from 'react';
import type { Course, CourseLesson } from '../types/courses';
import type { PageCommerce } from './usePageCommerce';
import { courseAccess, enrolmentOf, ensureEnrolment, markLesson, progressOf, recordQuiz, setLearnerName, visitLesson } from '../utils/commerce/courses';
import { membershipsFor, readSession, writeSession, type MemberSession } from '../utils/members';
import { announce } from '../utils/announce';

/**
 * The learner's side of a course (D197): their sign-in on this device (shared with members-only
 * content on the same workspace), live access, enrolment and progress actions.
 */
export function useCourseLearner(course: Course | undefined, commerce: PageCommerce, workspaceId: string | null, preview: boolean) {
  const [session, setSession] = useState<MemberSession | null>(() => workspaceId ? readSession(workspaceId) : null);
  useEffect(() => setSession(workspaceId ? readSession(workspaceId) : null), [workspaceId]);

  const data = commerce.data;
  const access = useMemo(() => course ? courseAccess(data, course, session) : { ok: false as const }, [data, course, session]);
  const enrolment = course ? enrolmentOf(data, course.id, session) : undefined;
  const progress = course ? progressOf(course, enrolment) : { done: 0, total: 0, pct: 0, nextLessonId: null };

  // Free sign-ups and members get an enrolment the first time they open the course, so progress can be saved.
  useEffect(() => {
    if (!course || preview || !session || !access.ok || enrolment) return;
    if (course.access === 'free' || course.access === 'membership') commerce.apply((d) => ensureEnrolment(d, course.id, session, course.access === 'free' ? 'free' : 'membership'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, session?.contact, access.ok, enrolment?.id, preview]);

  const signIn = (s: MemberSession) => {
    if (workspaceId) writeSession(workspaceId, s);
    setSession(s);
  };
  const signOut = () => {
    if (workspaceId) writeSession(workspaceId, null);
    setSession(null);
    announce('Signed out');
  };

  /** Who may ask for a code: free courses anyone; paid, people with a purchase; membership, subscribers. */
  const canSignIn = (contact: string, channel: 'phone' | 'email') => {
    if (!course) return false;
    if (course.access === 'free') return true;
    const s = { contact, channel, signedInAt: '', expiresAt: '' };
    if (enrolmentOf(data, course.id, s)) return true;
    return course.access === 'membership' && membershipsFor(data, contact, channel).length > 0;
  };

  const canSave = !preview && !!enrolment && access.ok;
  const actions = {
    visit: (lessonId: string) => {
      if (canSave && course && enrolment && enrolment.lastLessonId !== lessonId) commerce.apply((d) => visitLesson(d, enrolment.id, lessonId));
    },
    toggleDone: (lessonId: string, done: boolean) => {
      if (canSave && course && enrolment) commerce.apply((d) => markLesson(d, course, enrolment.id, lessonId, done));
    },
    quiz: canSave && course && enrolment ? (lesson: CourseLesson, score: number) => commerce.apply((d) => recordQuiz(d, course, enrolment.id, lesson, score)) : null,
    saveName: (name: string) => {
      if (enrolment) commerce.apply((d) => setLearnerName(d, enrolment.id, name));
    }
  };

  return { session, access, enrolment, progress, signIn, signOut, canSignIn, canSave, actions };
}