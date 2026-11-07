/** Courses (D197): modules of lessons, sold at checkout, free, or included in a membership. */

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseAccess = 'free' | 'paid' | 'membership';
export type CourseRelease = 'all' | 'drip';
import type { BookingMeeting, MeetingApp } from './ops';

export type LessonKind = 'video' | 'text' | 'file' | 'quiz' | 'live';

/** A scheduled live session inside a course (D229). Its recording, once added, goes in `videoUrl`. */
export interface LessonLive {
  /** ISO start time. Empty until scheduled. */
  startsAt: string;
  /** A connected meeting app from Bookings, or the owner's own link. */
  app: MeetingApp | 'own';
  /** Made when a connected app is chosen — what the provider's API would return. */
  meeting?: BookingMeeting;
  /** "own": the owner's meeting link (https). */
  ownUrl: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into options. */
  correct: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  kind: LessonKind;
  /** Video lessons: a link from a safe embed site (YouTube, Vimeo, Loom…). */
  videoUrl: string;
  /** Text lessons, and notes under any lesson. Plain text with blank lines between paragraphs. */
  body: string;
  /** File lessons (simulated storage, like digital products). */
  fileName: string;
  fileSizeBytes: number;
  questions: QuizQuestion[];
  /** Live lessons only (D229). */
  live?: LessonLive;
  /** Rough length shown in the outline. Live lessons: the session length. */
  minutes: number;
  /** Anyone can open it before enrolling. */
  preview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  /** One line under the title. */
  subtitle: string;
  description: string;
  /** What learners will be able to do, one per line. */
  outcomes: string;
  coverUrl: string;
  coverAlt: string;
  status: CourseStatus;
  access: CourseAccess;
  priceNgn: number | null;
  /** Membership access: subscription plans that include the course. */
  planIds: string[];
  /** Paid courses are sold through a hidden companion product so checkout, orders and refunds work as usual. */
  productId?: string;
  release: CourseRelease;
  /** Drip: module n opens n × this many days after enrolling. */
  dripDays: number;
  /** Quizzes count as done at this score or above (0–100). */
  passPct: number;
  certificate: boolean;
  instructor: string;
  modules: CourseModule[];
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EnrolmentSource = 'free' | 'order' | 'membership' | 'manual';

export interface Enrolment {
  id: string;
  courseId: string;
  /** Normalised 0803… phone, if known. */
  phone: string;
  /** Lower-cased email, if known. */
  email: string;
  name: string;
  source: EnrolmentSource;
  orderId?: string;
  enrolledAt: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  lastLessonId?: string;
  lastAt?: string;
  completedAt?: string;
  certificateNo?: string;
  /** Removed by the seller. */
  removedAt?: string;
  sample?: boolean;
}
