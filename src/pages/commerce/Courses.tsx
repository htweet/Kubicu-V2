import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArchiveIcon, BookOpenIcon, CopyIcon, EyeIcon, EyeOffIcon, GraduationCapIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import type { Course } from '../../types/courses';
import { useCommerce } from '../../contexts/CommerceContext';
import { useEditor } from '../../contexts/EditorContext';
import { usePlan } from '../../contexts/PlanContext';
import { accessLabels, courseStats, coursesOf, deleteCourse, durationLabel, enrolmentsFor, learnUrl, lessonCount, publishIssues, totalMinutes, upsertCourse } from '../../utils/commerce/courses';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { EmptyState } from '../../components/ui/EmptyState';
import { Segmented } from '../../components/ui/Segmented';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Card } from '../../components/ui/layout/Card';
import { List } from '../../components/ui/layout/ListRow';
import { MediaImage } from '../../components/media/MediaImage';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { CourseEditor } from '../../components/commerce/courses/CourseEditor';
import { CourseLearners } from '../../components/commerce/courses/CourseLearners';
import { useT } from '../../contexts/LocaleContext';

type Tab = 'published' | 'draft' | 'archived';
const statusTone: Record<Course['status'], BadgeTone> = { published: 'success', draft: 'neutral', archived: 'neutral' };
const statusLabel: Record<Course['status'], string> = { published: 'Live', draft: 'Draft', archived: 'Archived' };

/** Commerce → Courses: build, sell and follow learners (D197). */
export function Courses() {
  const { data, apply } = useCommerce();
  const { state } = useEditor();
  const plan = usePlan();
  const { t: tr } = useT();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('published');
  const handle = state.published?.handle ?? state.draft.handle;

  const courses = coursesOf(data);
  const counts: Record<Tab, number> = { published: 0, draft: 0, archived: 0 };
  courses.forEach((c) => counts[c.status]++);
  const shown = courses.filter((c) => c.status === tab);
  const allStats = courses.map((c) => courseStats(data, c));
  const learners = allStats.reduce((s, x) => s + x.learners, 0);
  const finished = allStats.reduce((s, x) => s + x.completed, 0);
  const revenue = allStats.reduce((s, x) => s + x.revenueNgn, 0);

  const target = params.get('new') ? 'new' : params.get('edit');
  const learnersFor = params.get('learners');

  const setStatus = (c: Course, status: Course['status']) => {
    if (status === 'published') {
      const issues = publishIssues(data, c, plan.id);
      if (issues.length) {
        toast.error('Not ready to publish yet', { description: issues[0] });
        setParams({ edit: c.id });
        return;
      }
    }
    if (apply((d) => upsertCourse(d, { ...c, status }))) toast.success(status === 'published' ? `${c.title} is live` : status === 'archived' ? `${c.title} archived` : `${c.title} is now a draft`);
  };

  const newButton = (
    <Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>
      New course
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Courses"
        description="Lessons people work through at their own pace — free, paid at checkout, or included in a membership. Learners sign in with a one-time code and pick up where they left off."
        actions={newButton}
      />

      {courses.length === 0 ? (
        <EmptyState
          framed
          className="mt-8"
          icon={GraduationCapIcon}
          title="No courses yet"
          description="Turn what you teach into modules of video, reading, files and short quizzes. Add a Course block to any page to sell it."
          action={newButton}
        />
      ) : (
        <>
          <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
            <Stat primary label="Learners" value={learners} hint={tr('{n} finished a course', { n: finished })} />
            <Stat label="Course sales, all time" value={formatNgn(revenue)} />
            <Stat label="Live courses" value={counts.published} />
          </StatGroup>

          <div className="mt-8 max-w-full overflow-x-auto overflow-y-hidden">
            <Segmented<Tab>
              ariaLabel="Show courses"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'published', label: `${tr('Live')} · ${counts.published}` },
                { value: 'draft', label: `${tr('Drafts')} · ${counts.draft}` },
                { value: 'archived', label: `${tr('Archived')} · ${counts.archived}` },
              ]}
            />
          </div>

          {shown.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-line-strong px-5 py-8 text-center text-label text-fg-muted">{tr('Nothing here right now.')}</p>
          ) : (
            <Card as="div" body="flush" className="mt-4">
              <List label={tr('Courses')}>
                {shown.map((c) => {
                  const s = courseStats(data, c);
                  const enrolled = enrolmentsFor(data, c.id).length;
                  const url = learnUrl(handle, c.id);
                  return (
                    <li key={c.id} className="flex items-center gap-4 px-5 py-4 md:px-6">
                      <span aria-hidden className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-sunken">
                        {c.coverUrl ? <MediaImage src={c.coverUrl} alt="" className="h-full w-full object-cover" /> : <BookOpenIcon size={18} className="text-fg-subtle" />}
                      </span>
                      <button type="button" onClick={() => setParams({ edit: c.id })} className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label font-semibold text-fg">{c.title || tr('Untitled course')}</span>
                          {c.sample && <SampleTag />}
                          <Badge tone="neutral">{c.access === 'paid' && c.priceNgn ? formatNgn(c.priceNgn) : tr(accessLabels[c.access])}</Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-subtle">
                          {tr(lessonCount(c) === 1 ? '{n} lesson' : '{n} lessons', { n: lessonCount(c) })} · {durationLabel(totalMinutes(c))}
                          {c.release === 'drip' ? ` · ${tr('a module every {n} days', { n: c.dripDays })}` : ''}
                        </span>
                      </button>
                      <div className="hidden w-40 shrink-0 md:block">
                        <p className="text-caption tabular-nums text-fg">
                          <span className="font-semibold">{s.learners}</span> <span className="text-fg-subtle">{tr('learners')}</span>
                          {s.learners > 0 && <span className="text-fg-subtle"> · {tr('{n}% avg', { n: s.avgPct })}</span>}
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.avgPct} aria-label={tr('Average progress {n}%', { n: s.avgPct })}>
                          <div className="h-full rounded-full bg-action" style={{ width: `${s.avgPct}%` }} />
                        </div>
                      </div>
                      <Badge tone={statusTone[c.status]} dot className="hidden shrink-0 sm:inline-flex">
                        {tr(statusLabel[c.status])}
                      </Badge>
                      <Menu
                        align="end"
                        items={[
                          { id: 'edit', label: 'Edit course', icon: PencilIcon, onSelect: () => setParams({ edit: c.id }) },
                          { id: 'learners', label: `Learners (${enrolled})`, icon: UsersIcon, onSelect: () => setParams({ learners: c.id }) },
                          { id: 'view', label: c.status === 'published' ? 'Open course page' : 'Preview course page', icon: EyeIcon, onSelect: () => window.open(url, '_blank', 'noopener') },
                          { id: 'copy', label: 'Copy course link', icon: CopyIcon, disabled: c.status !== 'published', reason: 'Publish it first.', onSelect: () => { navigator.clipboard?.writeText(`${window.location.origin}${url}`); toast.success('Course link copied'); } },
                          ...(c.status === 'published' ? [{ id: 'unpublish', label: 'Unpublish', icon: EyeOffIcon, onSelect: () => setStatus(c, 'draft') }] : [{ id: 'publish', label: 'Publish', icon: EyeIcon, onSelect: () => setStatus(c, 'published') }]),
                          ...(c.status !== 'archived' ? [{ id: 'archive', label: 'Archive', icon: ArchiveIcon, onSelect: () => setStatus(c, 'archived') }] : []),
                          {
                            id: 'delete',
                            label: 'Delete',
                            icon: Trash2Icon,
                            destructive: true,
                            disabled: enrolled > 0,
                            reason: 'People are enrolled — archive it instead.',
                            onSelect: () => {
                              if (apply((d) => deleteCourse(d, c.id))) toast.success(`${c.title || 'Course'} deleted`);
                            },
                          },
                        ]}
                        trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={tr('More actions for {name}', { name: c.title || tr('course') })} />}
                      />
                    </li>
                  );
                })}
              </List>
            </Card>
          )}
        </>
      )}

      <CourseEditor target={target} onClose={() => setParams({})} />
      <CourseLearners courseId={learnersFor} onClose={() => setParams({})} />
    </>
  );
}
