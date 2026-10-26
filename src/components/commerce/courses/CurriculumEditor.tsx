import React, { useState } from 'react';
import { AlertCircleIcon, ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, FileTextIcon, FileIcon, ListChecksIcon, PlayCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { CourseLesson, CourseModule, LessonKind } from '../../../types/courses';
import { MAX_LESSONS_PER_MODULE, MAX_MODULES, blankLesson, blankModule, durationLabel, lessonIssue, lessonKindLabels } from '../../../utils/commerce/courses';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { Menu } from '../../ui/Menu';
import { Badge } from '../../ui/Badge';
import { LessonEditor } from './LessonEditor';
import { announce } from '../../../utils/announce';
import { cn } from '../../../utils/cn';

export const lessonIcons: Record<LessonKind, typeof PlayCircleIcon> = { video: PlayCircleIcon, text: FileTextIcon, file: FileIcon, quiz: ListChecksIcon };

interface Props {
  modules: CourseModule[];
  onChange: (modules: CourseModule[]) => void;
  showErrors: boolean;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

/** Modules and lessons, reordered with buttons rather than dragging (D197). */
export function CurriculumEditor({ modules, onChange, showErrors }: Props) {
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const setModule = (mid: string, patch: Partial<CourseModule>) => onChange(modules.map((m) => m.id === mid ? { ...m, ...patch } : m));
  const setLesson = (mid: string, lid: string, patch: Partial<CourseLesson>) =>
  onChange(modules.map((m) => m.id === mid ? { ...m, lessons: m.lessons.map((l) => l.id === lid ? { ...l, ...patch } : l) } : m));

  const addLesson = (mid: string, kind: LessonKind) => {
    const l = blankLesson(kind);
    setModule(mid, { lessons: [...(modules.find((m) => m.id === mid)?.lessons ?? []), l] });
    setOpenLesson(l.id);
  };

  return (
    <div className="flex flex-col gap-4">
      {modules.map((m, mi) => {
        const minutes = m.lessons.reduce((n, l) => n + (l.minutes || 0), 0);
        return (
          <section key={m.id} aria-labelledby={`${m.id}-label`} className="rounded-lg border border-line">
            <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <span id={`${m.id}-label`} className="sr-only">
                Module {mi + 1}
              </span>
              <span aria-hidden className="w-6 shrink-0 text-center text-caption font-semibold tabular-nums text-fg-subtle">
                {mi + 1}
              </span>
              <input
                aria-label={`Module ${mi + 1} title`}
                value={m.title}
                maxLength={80}
                onChange={(e) => setModule(m.id, { title: e.target.value })}
                placeholder="Module title"
                className={cn('h-9 min-w-0 flex-1 rounded-md border bg-transparent px-2 text-label font-semibold text-fg placeholder:text-fg-subtle focus:border-action focus:outline-none', showErrors && !m.title.trim() ? 'border-danger/60' : 'border-transparent hover:border-line')} />
              
              <span className="hidden shrink-0 text-caption text-fg-subtle sm:inline">
                {m.lessons.length} {m.lessons.length === 1 ? 'lesson' : 'lessons'}
                {minutes ? ` · ${durationLabel(minutes)}` : ''}
              </span>
              <IconButton size="sm" icon={ArrowUpIcon} label={`Move module ${mi + 1} up`} disabled={mi === 0} onClick={() => {onChange(move(modules, mi, mi - 1));announce(`Moved ${m.title || 'module'} up`);}} />
              <IconButton size="sm" icon={ArrowDownIcon} label={`Move module ${mi + 1} down`} disabled={mi === modules.length - 1} onClick={() => {onChange(move(modules, mi, mi + 1));announce(`Moved ${m.title || 'module'} down`);}} />
              <IconButton size="sm" icon={Trash2Icon} label={`Remove module ${mi + 1}`} disabled={modules.length === 1 || m.lessons.length > 0} title={m.lessons.length ? 'Remove or move its lessons first' : undefined} onClick={() => onChange(modules.filter((x) => x.id !== m.id))} />
            </header>

            {m.lessons.length === 0 ?
            <p className="px-4 py-4 text-caption text-fg-subtle">No lessons in this module yet.</p> :

            <ol className="flex flex-col">
                {m.lessons.map((l, li) => {
                const Icon = lessonIcons[l.kind];
                const issue = lessonIssue(l);
                const open = openLesson === l.id;
                return (
                  <li key={l.id} className="border-b border-line last:border-0">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenLesson(open ? null : l.id)}
                        className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-md px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        
                          <Icon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-label font-medium text-fg">{l.title || <span className="text-fg-subtle">Untitled {lessonKindLabels[l.kind].toLowerCase()}</span>}</span>
                            <span className="block truncate text-caption text-fg-subtle">
                              {lessonKindLabels[l.kind]}
                              {l.minutes ? ` · ${l.minutes} min` : ''}
                              {l.kind === 'quiz' ? ` · ${l.questions.length} ${l.questions.length === 1 ? 'question' : 'questions'}` : ''}
                            </span>
                          </span>
                          {l.preview && <Badge tone="info">Preview</Badge>}
                          {issue &&
                        <span className={cn('inline-flex shrink-0 items-center gap-1 text-caption', showErrors ? 'text-danger' : 'text-warning')}>
                              <AlertCircleIcon size={13} aria-hidden />
                              <span className="hidden md:inline">{issue}</span>
                              <span className="sr-only md:hidden">{issue}</span>
                            </span>
                        }
                          <ChevronDownIcon size={15} className={cn('shrink-0 text-fg-subtle transition-transform duration-150 ease-out', open && 'rotate-180')} aria-hidden />
                        </button>
                        <IconButton size="sm" icon={ArrowUpIcon} label={`Move ${l.title || 'lesson'} up`} disabled={li === 0 && mi === 0} onClick={() => {
                        if (li > 0) setModule(m.id, { lessons: move(m.lessons, li, li - 1) });else
                        onChange(modules.map((x, xi) => xi === mi - 1 ? { ...x, lessons: [...x.lessons, l] } : xi === mi ? { ...x, lessons: x.lessons.slice(1) } : x));
                        announce(li > 0 ? `Moved ${l.title || 'lesson'} up` : `Moved ${l.title || 'lesson'} to module ${mi}`);
                      }} />
                        <IconButton size="sm" icon={ArrowDownIcon} label={`Move ${l.title || 'lesson'} down`} disabled={li === m.lessons.length - 1 && mi === modules.length - 1} onClick={() => {
                        if (li < m.lessons.length - 1) setModule(m.id, { lessons: move(m.lessons, li, li + 1) });else
                        onChange(modules.map((x, xi) => xi === mi + 1 ? { ...x, lessons: [l, ...x.lessons] } : xi === mi ? { ...x, lessons: x.lessons.slice(0, -1) } : x));
                        announce(li < m.lessons.length - 1 ? `Moved ${l.title || 'lesson'} down` : `Moved ${l.title || 'lesson'} to module ${mi + 2}`);
                      }} />
                        <IconButton size="sm" icon={Trash2Icon} label={`Remove ${l.title || 'lesson'}`} onClick={() => setModule(m.id, { lessons: m.lessons.filter((x) => x.id !== l.id) })} />
                      </div>
                      {open &&
                    <div className="border-t border-line bg-sunken/50 px-4 py-4">
                          <LessonEditor lesson={l} showErrors={showErrors} onChange={(patch) => setLesson(m.id, l.id, patch)} />
                        </div>
                    }
                    </li>);

              })}
              </ol>
            }

            <div className="border-t border-line px-3 py-2">
              <Menu
                align="start"
                items={(['video', 'text', 'file', 'quiz'] as LessonKind[]).map((k) => ({ id: k, label: lessonKindLabels[k], icon: lessonIcons[k], disabled: m.lessons.length >= MAX_LESSONS_PER_MODULE, reason: `Up to ${MAX_LESSONS_PER_MODULE} lessons per module`, onSelect: () => addLesson(m.id, k) }))}
                trigger={(props) =>
                <Button {...props} size="sm" variant="tertiary" leadingIcon={PlusIcon}>
                    Add lesson
                  </Button>
                } />
              
            </div>
          </section>);

      })}
      <Button variant="secondary" leadingIcon={PlusIcon} className="self-start" disabled={modules.length >= MAX_MODULES} onClick={() => onChange([...modules, blankModule(modules.length + 1)])}>
        Add module
      </Button>
    </div>);

}