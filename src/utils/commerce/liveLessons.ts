import type { CourseLesson, LessonLive } from '../../types/courses';
import type { MeetingApp } from '../../types/ops';
import { makeMeeting, meetingApps } from '../ops/meetings';

/** Live course sessions (D229). The Join button opens this many minutes before the start. */
export const JOIN_EARLY_MIN = 10;

export type LiveState = 'unscheduled' | 'upcoming' | 'open' | 'ended';

export function blankLive(): LessonLive {
  return { startsAt: '', app: 'own', ownUrl: '' };
}

export function liveState(l: CourseLesson, now = Date.now()): LiveState {
  const at = l.live?.startsAt ? Date.parse(l.live.startsAt) : NaN;
  if (Number.isNaN(at)) return 'unscheduled';
  const end = at + Math.max(15, l.minutes || 60) * 60_000;
  if (now < at - JOIN_EARLY_MIN * 60_000) return 'upcoming';
  if (now <= end) return 'open';
  return 'ended';
}

/** The link students join with, or null. */
export function joinUrl(live: LessonLive | undefined): string | null {
  if (!live) return null;
  if (live.app === 'own') return /^https:\/\/\S+\.\S+/i.test(live.ownUrl.trim()) ? live.ownUrl.trim() : null;
  return live.meeting?.url ?? null;
}

export function appName(live: LessonLive): string {
  return live.app === 'own' ? 'the meeting link' : meetingApps[live.app].name;
}

/** Choosing a connected app makes the lesson its own link straight away (simulated, D225). */
export function withApp(lessonId: string, live: LessonLive, app: MeetingApp | 'own'): LessonLive {
  if (app === 'own') return { ...live, app, meeting: undefined };
  const keep = live.meeting && live.meeting.app === app ? live.meeting : makeMeeting(app, `${lessonId}:${app}`);
  return { ...live, app, meeting: keep };
}

export function renewLiveMeeting(lessonId: string, live: LessonLive): LessonLive {
  if (live.app === 'own') return live;
  return { ...live, meeting: makeMeeting(live.app, `${lessonId}:${live.app}:${Date.now()}`) };
}

export function liveIssue(l: CourseLesson): string | null {
  const live = l.live;
  if (!live?.startsAt || Number.isNaN(Date.parse(live.startsAt))) return 'Set the date and time';
  if (live.app === 'own' && !joinUrl(live)) return 'Add the meeting link (starting https://)';
  if (live.app !== 'own' && !live.meeting) return 'Choose a meeting app';
  return null;
}

/** Attending (session has started) or a recording lets the student mark it done. */
export function liveCanComplete(l: CourseLesson, now = Date.now()): boolean {
  const s = liveState(l, now);
  return s === 'ended' || s === 'open' || !!l.videoUrl.trim();
}

export function formatLiveWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** datetime-local value ↔ ISO, in the device's time zone. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromLocalInput(v: string): string {
  const d = new Date(v);
  return v && !Number.isNaN(d.getTime()) ? d.toISOString() : '';
}

/** A calendar file so students get their own reminder. Includes the link only for people with access. */
export function liveIcs(l: CourseLesson, courseTitle: string): string | null {
  const start = l.live?.startsAt ? new Date(l.live.startsAt) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + Math.max(15, l.minutes || 60) * 60_000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const url = joinUrl(l.live) ?? '';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KUBICU//Courses//EN',
    'BEGIN:VEVENT',
    `UID:${l.id}@kubicu`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${esc(`${l.title} — ${courseTitle}`)}`,
    url ? `URL:${url}` : '',
    `DESCRIPTION:${esc(url ? `Join: ${url}` : 'Open the course to join.')}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Live session in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}
