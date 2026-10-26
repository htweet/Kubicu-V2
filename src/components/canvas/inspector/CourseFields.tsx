import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { accessLabels, coursesOf, lessonCount } from '../../../utils/commerce/courses';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { Segmented } from '../../ui/Segmented';

/** Inspector for the Course block: pick a course and how much of it to show (D197). */
export function CourseFields({ block, issues }: {block: BlockOf<'course'>;issues: ValidationIssue[];}) {
  const { actions } = useEditor();
  const { data } = useCommerce();
  const c = block.content;
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'course', patch, f);
  const courses = coursesOf(data).filter((x) => x.status !== 'archived' || x.id === c.courseId);

  if (courses.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
        <p className="text-label font-semibold text-fg">No courses yet</p>
        <p className="mt-0.5 text-caption text-fg-muted">Build one with modules and lessons, then show it here.</p>
        <Link to="/app/commerce/courses?new=1" className="mt-1.5 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
          Create a course <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      </div>);

  }

  return (
    <div className="flex flex-col gap-4">
      <SelectInput
        id={`${block.id}-course`}
        label="Course"
        value={c.courseId ?? ''}
        error={err('courseId')}
        onChange={(v) => set({ courseId: v || null }, 'courseId')}
        options={[
        { value: '', label: 'Choose a course…' },
        ...courses.map((x) => ({ value: x.id, label: `${x.title || 'Untitled course'} · ${x.access === 'paid' && x.priceNgn ? formatNgn(x.priceNgn) : accessLabels[x.access]} · ${lessonCount(x)} lessons${x.status === 'draft' ? ' (draft)' : ''}` }))]
        } />
      
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-fg">Show</span>
        <Segmented<'card' | 'outline'>
          ariaLabel="How much to show"
          fullWidth
          value={c.style}
          onChange={(style) => set({ style }, 'style')}
          options={[
          { value: 'card', label: 'Card' },
          { value: 'outline', label: 'Card + modules' }]
          } />
        
      </div>
      <TextInput id={`${block.id}-cta`} label="Button label" optional value={c.ctaLabel} placeholder="Start free / See the course" hint="Empty picks one to suit the course." onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
      <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
        <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="text-label font-semibold text-fg">Synced with Courses</p>
          <p className="text-caption text-fg-muted">Title, price and lessons update here. The button opens the course page, where people preview, buy, join or continue.</p>
          <Link to={c.courseId ? `/app/commerce/courses?edit=${c.courseId}` : '/app/commerce/courses'} className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
            Edit in Commerce <ArrowUpRightIcon size={12} aria-hidden />
          </Link>
        </div>
      </div>
    </div>);

}