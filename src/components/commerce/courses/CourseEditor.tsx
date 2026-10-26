import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpRightIcon } from 'lucide-react';
import type { Course } from '../../../types/courses';
import { useCommerce } from '../../../contexts/CommerceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { planAtLeast } from '../../../data/plans';
import { COURSE_PLAN, PAID_COURSE_PLAN, blankCourse, findCourse, lessonCount, publishIssues, totalMinutes, durationLabel, upsertCourse } from '../../../utils/commerce/courses';
import { priceLine } from '../../../utils/commerce/subscriptions';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { Segmented } from '../../ui/Segmented';
import { Switch } from '../../ui/Switch';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { MediaPicker } from '../../media/MediaPicker';
import { CurriculumEditor } from './CurriculumEditor';

interface Props {
  /** Course id, 'new', or null when closed. */
  target: string | 'new' | null;
  onClose: () => void;
}

function Group({ title, description, children }: {title: string;description?: string;children: React.ReactNode;}) {
  return (
    <section className="flex flex-col gap-4 border-b border-line px-5 py-6 last:border-0">
      <div>
        <h3 className="text-label font-semibold text-fg">{title}</h3>
        {description && <p className="mt-0.5 text-caption text-fg-subtle">{description}</p>}
      </div>
      {children}
    </section>);

}

/** Create or edit a course: details, who can take it, lessons, and release (D197). */
export function CourseEditor({ target, onClose }: Props) {
  const { data, apply } = useCommerce();
  const plan = usePlan();
  const existing = target && target !== 'new' ? findCourse(data, target) : undefined;
  const [draft, setDraft] = useState<Course>(() => existing ?? blankCourse());
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!target) return;
    setDraft(existing ?? blankCourse());
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const set = (patch: Partial<Course>) => setDraft((d) => ({ ...d, ...patch }));
  const issues = publishIssues(data, draft, plan.id);
  const livePlans = data.subPlans.filter((p) => p.status === 'active' && p.kind === 'membership');
  const lessons = lessonCount(draft);

  const save = (status: Course['status']) => {
    if (status === 'published' && issues.length) {
      setTried(true);
      toast.error('Not ready to publish yet', { description: issues[0] });
      return;
    }
    if (status === 'draft' && !draft.title.trim()) {
      setTried(true);
      toast.error('Add a course title first');
      return;
    }
    if (apply((d) => upsertCourse(d, { ...draft, status }))) {
      toast.success(status === 'published' ? `${draft.title} is live` : 'Saved as a draft');
      onClose();
    }
  };

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      side="right"
      size="lg"
      title={existing ? `Edit ${existing.title || 'course'}` : 'New course'}
      description={lessons ? `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} · ${durationLabel(totalMinutes(draft))}` : 'Modules and lessons learners work through at their own pace.'}
      bodyClassName="p-0"
      footer={
      <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-caption text-fg-subtle">{draft.status === 'published' ? 'Live — changes apply when you save.' : 'Draft — only you can see it.'}</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => save(draft.status === 'published' ? 'draft' : draft.status === 'archived' ? 'archived' : 'draft')}>
              {draft.status === 'published' ? 'Unpublish' : 'Save draft'}
            </Button>
            <Button onClick={() => save('published')}>{draft.status === 'published' ? 'Save' : 'Publish'}</Button>
          </div>
        </div>
      }>
      
      {!planAtLeast(plan.id, COURSE_PLAN) &&
      <div className="px-5 pt-5">
          <InlineAlert tone="info" title="Courses are on Creator" action={<UpgradeButton plan={COURSE_PLAN} feature="Courses" />}>
            Build it now; it can be published once you upgrade.
          </InlineAlert>
        </div>
      }
      {tried && issues.length > 0 &&
      <div className="px-5 pt-5">
          <InlineAlert tone="warning" title="Before this can go live">
            <ul className="list-disc pl-4">
              {issues.map((i) =>
            <li key={i}>{i}</li>
            )}
            </ul>
          </InlineAlert>
        </div>
      }

      <Group title="Details">
        <TextInput id="crs-title" label="Course title" value={draft.title} maxLength={90} error={tried && !draft.title.trim() ? 'Add a course title' : undefined} placeholder="e.g. Sew your first wrap dress" onChange={(e) => set({ title: e.target.value })} />
        <TextInput id="crs-sub" label="One-line summary" optional value={draft.subtitle} maxLength={120} placeholder="Who it’s for and what they’ll make" onChange={(e) => set({ subtitle: e.target.value })} />
        <TextArea id="crs-desc" label="About the course" optional rows={4} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
        <TextArea id="crs-outcomes" label="What learners will be able to do" optional rows={3} value={draft.outcomes} hint="One per line. Describe skills, not promises of income or results." onChange={(e) => set({ outcomes: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="crs-instructor" label="Taught by" optional value={draft.instructor} placeholder="Your name" onChange={(e) => set({ instructor: e.target.value })} />
        </div>
        <MediaPicker id="crs-cover" label="Cover image" optional aspect="16:9" value={draft.coverUrl} onChange={(coverUrl, meta) => set({ coverUrl, coverAlt: meta?.alt && !draft.coverAlt ? meta.alt : draft.coverAlt })} />
        {draft.coverUrl && <TextInput id="crs-cover-alt" label="Describe the cover" optional value={draft.coverAlt} placeholder="e.g. Hands pinning a pattern to ankara fabric" onChange={(e) => set({ coverAlt: e.target.value })} />}
      </Group>

      <Group title="Who can take it">
        <Segmented<Course['access']>
          ariaLabel="Course access"
          fullWidth
          value={draft.access}
          onChange={(access) => set({ access })}
          options={[
          { value: 'free', label: 'Free' },
          { value: 'paid', label: 'Paid' },
          { value: 'membership', label: 'Members' }]
          } />
        
        {draft.access === 'free' && <p className="text-caption text-fg-subtle">Learners sign in with a one-time code to save their progress. You’ll see them under Learners.</p>}
        {draft.access === 'paid' &&
        <>
            {!planAtLeast(plan.id, PAID_COURSE_PLAN) &&
          <InlineAlert tone="info" title="Paid courses are on Pro" action={<UpgradeButton plan={PAID_COURSE_PLAN} feature="Selling courses at checkout" />}>
                They’re sold through checkout. Free and members courses work on Creator.
              </InlineAlert>
          }
            <CurrencyInput id="crs-price" label="Price" value={draft.priceNgn} error={tried && (!draft.priceNgn || draft.priceNgn < 100) ? 'Set a price of at least ₦100' : undefined} hint="Sold through your checkout. Orders, refunds and discount codes work as usual; a full refund ends access." onChange={(priceNgn) => set({ priceNgn })} />
          </>
        }
        {draft.access === 'membership' &&
        <fieldset>
            <legend className="mb-2 text-label font-medium text-fg">Included in these memberships</legend>
            {livePlans.length === 0 ?
          <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
                <p className="text-label font-semibold text-fg">No live membership plans</p>
                <Link to="/app/commerce/subscriptions" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
                  Create one in Subscriptions <ArrowUpRightIcon size={12} aria-hidden />
                </Link>
              </div> :

          <ul className="flex flex-col rounded-md border border-line">
                {livePlans.map((p) => {
              const on = draft.planIds.includes(p.id);
              return (
                <li key={p.id} className="border-b border-line last:border-0">
                      <label className="flex min-h-[48px] cursor-pointer items-center gap-3 px-3 py-2 text-label hover:bg-sunken">
                        <input type="checkbox" className="h-4 w-4" checked={on} onChange={() => set({ planIds: on ? draft.planIds.filter((x) => x !== p.id) : [...draft.planIds, p.id] })} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-fg">{p.name}</span>
                          <span className="block truncate text-caption text-fg-subtle">{priceLine(p)}</span>
                        </span>
                      </label>
                    </li>);

            })}
              </ul>
          }
            <p className="mt-1.5 text-caption text-fg-subtle">Active and trial subscribers get in. Access stops when a membership is paused or ends; progress is kept if they come back.</p>
          </fieldset>
        }
      </Group>

      <Group title="Lessons" description={`Up to 20 modules of 30 lessons. Videos play from YouTube, Vimeo or Loom; KUBICU doesn’t host video.`}>
        <CurriculumEditor modules={draft.modules} showErrors={tried} onChange={(modules) => set({ modules })} />
      </Group>

      <Group title="Release and completion">
        <Segmented<Course['release']>
          ariaLabel="When lessons open"
          fullWidth
          value={draft.release}
          onChange={(release) => set({ release })}
          options={[
          { value: 'all', label: 'All at once' },
          { value: 'drip', label: 'A module at a time' }]
          } />
        
        {draft.release === 'drip' &&
        <TextInput
          id="crs-drip"
          label="Days between modules"
          inputMode="numeric"
          value={String(draft.dripDays || '')}
          hint={`Module 2 opens ${draft.dripDays || 1} days after someone enrols, module 3 ${2 * (draft.dripDays || 1)} days after, and so on. Free previews are always open.`}
          onChange={(e) => set({ dripDays: Math.max(1, Math.min(60, Number(e.target.value.replace(/\D/g, '')) || 1)) })} />

        }
        <TextInput id="crs-pass" label="Quiz pass mark (%)" inputMode="numeric" value={String(draft.passPct)} hint="Learners can retake quizzes. A pass marks the quiz done." onChange={(e) => set({ passPct: Math.max(0, Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0)) })} />
        <Switch id="crs-cert" label="Certificate of completion" description="A printable certificate once every lesson is done. It always says it isn’t an accredited qualification." checked={draft.certificate} onChange={(certificate) => set({ certificate })} />
      </Group>
    </Sheet>);

}