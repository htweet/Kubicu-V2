import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClockIcon, GraduationCapIcon, LockIcon, PlayCircleIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { buttonStyle, cardRadius, cardStyle, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { MediaImage } from '../media/MediaImage';
import { durationLabel, findCourse, learnUrl, lessonCount, totalMinutes } from '../../utils/commerce/courses';
import { formatNgn } from '../../utils/format';

/** A course card that leads to its course page, where people preview, buy, join or continue (D197). */
export function CourseBlock({ block, theme: t, mode }: BlockProps<'course'>) {
  const c = block.content;
  const catalog = useCatalog();
  const { handle = '' } = useParams();
  const course = findCourse(catalog, c.courseId ?? undefined);

  if (!course || course.status !== 'published' && mode === 'live') {
    return mode === 'edit' ? <BlockPlaceholder icon={GraduationCapIcon} title={course ? 'Publish this course to show it' : 'Choose a course'} hint="Build it in Commerce → Courses" theme={t} tall /> : null;
  }

  const lessons = lessonCount(course);
  const price = course.access === 'paid' && course.priceNgn ? formatNgn(course.priceNgn) : course.access === 'free' ? 'Free' : 'With membership';
  const label = c.ctaLabel.trim() || (course.access === 'paid' ? 'See the course' : course.access === 'free' ? 'Start free' : 'Open the course');
  const href = learnUrl(handle, course.id);
  const btnClass = 'flex h-11 w-full items-center justify-center gap-2 text-[14.5px] font-semibold sm:w-auto sm:px-6';
  const button =
  mode === 'live' && handle ?
  <Link to={href} className={btnClass} style={buttonStyle(t, 'featured')}>
        {label}
      </Link> :

  <span className={btnClass} style={buttonStyle(t, 'featured')}>
        {label}
      </span>;

  const meta =
  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]" style={{ color: t.mutedText }}>
      <span>{lessons} {lessons === 1 ? 'lesson' : 'lessons'}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <ClockIcon size={12} aria-hidden /> {durationLabel(totalMinutes(course))}
      </span>
      {course.instructor &&
    <>
          <span aria-hidden>·</span>
          <span>{course.instructor}</span>
        </>
    }
    </p>;


  return (
    <section className="overflow-hidden" style={{ ...cardStyle(t), borderRadius: cardRadius(t), padding: 0 }} aria-label={course.title}>
      {course.coverUrl && <MediaImage src={course.coverUrl} alt={course.coverAlt} className="aspect-[16/9] w-full object-cover" />}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[20px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
            {course.title}
          </h3>
          <PageChip theme={t} tone="strong">
            {price}
          </PageChip>
        </div>
        {course.subtitle &&
        <p className="text-[14px] leading-relaxed" style={{ color: t.mutedText }}>
            {course.subtitle}
          </p>
        }
        {meta}
        {c.style === 'outline' &&
        <ol className="mt-1 flex flex-col" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
            {course.modules.slice(0, 6).map((m, i) =>
          <li key={m.id} className="flex items-center gap-3 py-2.5 text-[14px]" style={{ borderBottom: `1px solid ${mix(t.text, 8)}`, color: t.text }}>
                <span className="w-5 shrink-0 text-[12.5px] tabular-nums" style={{ color: t.mutedText }}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{m.title}</span>
                <span className="shrink-0 text-[12px]" style={{ color: t.mutedText }}>
                  {m.lessons.some((l) => l.preview) ?
              <span className="inline-flex items-center gap-1">
                      <PlayCircleIcon size={12} aria-hidden /> Preview
                    </span> :

              <span className="inline-flex items-center gap-1">
                      <LockIcon size={11} aria-hidden /> {m.lessons.length}
                    </span>
              }
                </span>
              </li>
          )}
            {course.modules.length > 6 &&
          <li className="py-2.5 text-[13px]" style={{ color: t.mutedText }}>
                + {course.modules.length - 6} more modules
              </li>
          }
          </ol>
        }
        <div className="mt-1">{button}</div>
      </div>
    </section>);

}