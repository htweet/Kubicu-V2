import React from 'react';
import { CheckCircle2Icon, CircleIcon, LockIcon, PlayCircleIcon, FileTextIcon, FileIcon, ListChecksIcon, VideoIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Course, Enrolment, LessonKind } from '../../types/courses';
import { durationLabel, lessonKindLabels, moduleOpensAt } from '../../utils/commerce/courses';
import { fontsFor, mix } from '../blocks/pageStyle';

const icons: Record<LessonKind, typeof PlayCircleIcon> = { video: PlayCircleIcon, text: FileTextIcon, file: FileIcon, quiz: ListChecksIcon, live: VideoIcon };

interface Props {
  theme: PageTheme;
  course: Course;
  enrolment?: Enrolment;
  /** Signed in with access (or owner preview): every lesson in an open module can be opened. */
  open: boolean;
  currentLessonId?: string | null;
  onOpen: (lessonId: string) => void;
  compact?: boolean;
}

function openDate(at: number): string {
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Modules and lessons with done, preview and locked states — never colour alone (D197). */
export function CourseOutline({ theme: t, course, enrolment, open, currentLessonId, onOpen, compact }: Props) {
  const done = new Set(enrolment?.completedLessonIds ?? []);
  const muted = { color: t.mutedText };
  return (
    <nav aria-label="Course outline" className="flex flex-col gap-5">
      {course.modules.map((m, mi) => {
        const opensAt = open ? moduleOpensAt(course, enrolment, mi) : null;
        const minutes = m.lessons.reduce((n, l) => n + (l.minutes || 0), 0);
        return (
          <section key={m.id} aria-labelledby={`out-${m.id}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 id={`out-${m.id}`} className={compact ? 'text-[13px] font-semibold' : 'text-[16px] font-medium'} style={{ color: t.text, fontFamily: compact ? undefined : fontsFor(t).display }}>
                <span style={muted}>{mi + 1}.</span> {m.title}
              </h3>
              <span className="shrink-0 text-[12px]" style={muted}>
                {opensAt ? `Opens ${openDate(opensAt)}` : minutes ? durationLabel(minutes) : ''}
              </span>
            </div>
            <ol className="flex flex-col" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
              {m.lessons.map((l) => {
                const canOpen = l.preview || open && !opensAt;
                const isDone = done.has(l.id);
                const current = currentLessonId === l.id;
                const Kind = icons[l.kind];
                const status = isDone ? 'Done' : canOpen ? l.preview && !open ? 'Free preview' : 'Not started' : opensAt ? `Opens ${openDate(opensAt)}` : 'Locked';
                const inner =
                <>
                    <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isDone ? <CheckCircle2Icon size={17} style={{ color: t.accent }} /> : canOpen ? <CircleIcon size={15} style={muted} /> : <LockIcon size={14} style={muted} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium" style={{ color: canOpen ? t.text : t.mutedText }}>
                        {l.title}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px]" style={muted}>
                        <Kind size={12} aria-hidden />
                        {lessonKindLabels[l.kind]}
                        {l.minutes ? ` · ${l.minutes} min` : ''}
                        {l.preview && !open ? ' · Free preview' : ''}
                      </span>
                    </span>
                    <span className="sr-only">, {status}</span>
                  </>;

                return (
                  <li key={l.id} style={{ borderBottom: `1px solid ${mix(t.text, 8)}` }}>
                    {canOpen ?
                    <button
                      type="button"
                      onClick={() => onOpen(l.id)}
                      aria-current={current ? 'step' : undefined}
                      className="flex min-h-[52px] w-full items-center gap-3 px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2"
                      style={{ background: current ? mix(t.text, 6) : undefined, borderRadius: 8 }}>
                      
                        {inner}
                      </button> :

                    <div className="flex min-h-[52px] items-center gap-3 px-2 py-2" aria-disabled>
                        {inner}
                      </div>
                    }
                  </li>);

              })}
            </ol>
          </section>);

      })}
    </nav>);

}