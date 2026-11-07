import React, { useRef } from 'react';
import { CheckCircle2Icon, FileIcon, PlusIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import type { CourseLesson, QuizQuestion } from '../../../types/courses';
import { MAX_QUESTIONS, blankQuestion } from '../../../utils/commerce/courses';
import { parseEmbed } from '../../../utils/embeds';
import { formatBytes } from '../../../utils/commerce/catalog';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Switch } from '../../ui/Switch';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { cn } from '../../../utils/cn';
import { LiveLessonFields } from './LiveLessonFields';

const MAX_FILE_BYTES = 200 * 1024 * 1024;

interface Props {
  lesson: CourseLesson;
  onChange: (patch: Partial<CourseLesson>) => void;
  showErrors: boolean;
}

/** The fields for one lesson, by kind (D197). */
export function LessonEditor({ lesson: l, onChange, showErrors }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const id = (f: string) => `${l.id}-${f}`;
  const embed = l.kind === 'video' && l.videoUrl.trim() ? parseEmbed(l.videoUrl) : null;
  const videoError = embed && !embed.ok ? embed.reason : embed && embed.ok && embed.kind !== 'video' ? 'That link isn’t a video. Use YouTube, Vimeo, Loom, TikTok, Instagram or Facebook video.' : showErrors && l.kind === 'video' && !l.videoUrl.trim() ? 'Add a video link' : undefined;

  const recordingEmbed = l.kind === 'live' && l.videoUrl.trim() ? parseEmbed(l.videoUrl) : null;
  const recordingError = recordingEmbed && !recordingEmbed.ok ? recordingEmbed.reason : recordingEmbed && recordingEmbed.ok && recordingEmbed.kind !== 'video' ? 'That link isn’t a video.' : undefined;

  const setQuestion = (qid: string, patch: Partial<QuizQuestion>) => onChange({ questions: l.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) });

  return (
    <div className="flex flex-col gap-4">
      <TextInput id={id('title')} label="Lesson title" value={l.title} maxLength={90} error={showErrors && !l.title.trim() ? 'Add a lesson title' : undefined} placeholder="e.g. Choosing your first fabric" onChange={(e) => onChange({ title: e.target.value })} />

      {l.kind === 'video' && (
        <TextInput
          id={id('video')}
          label="Video link"
          value={l.videoUrl}
          placeholder="youtube.com/watch?v=… or loom.com/share/…"
          error={videoError}
          hint={embed?.ok && embed.kind === 'video' ? `${embed.name} video — learners watch it inside the lesson. Set it to Unlisted so it can’t be found outside the course.` : 'YouTube, Vimeo, Loom, TikTok, Instagram or Facebook. Upload there first; KUBICU doesn’t host video.'}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
        />
      )}

      {l.kind === 'live' && (
        <>
          <LiveLessonFields lesson={l} onChange={onChange} showErrors={showErrors} />
          <TextInput
            id={id('recording')}
            label="Recording"
            optional
            value={l.videoUrl}
            placeholder="Add after the session"
            error={recordingError}
            hint={recordingEmbed?.ok && recordingEmbed.kind === 'video' ? `${recordingEmbed.name} video — once the session ends, students watch it here instead.` : 'After the session, paste the recording link (YouTube, Vimeo, Loom…). Set it to Unlisted.'}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
          />
        </>
      )}

      {l.kind === 'file' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-label font-medium text-fg">File</span>
          {l.fileName ? (
            <div className="flex items-center gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
              <FileIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-medium text-fg">{l.fileName}</span>
                <span className="block text-caption text-fg-subtle">{formatBytes(l.fileSizeBytes)}</span>
              </span>
              <Button size="sm" variant="tertiary" onClick={() => fileRef.current?.click()}>
                Replace
              </Button>
            </div>
          ) : (
            <Button variant="secondary" leadingIcon={UploadIcon} onClick={() => fileRef.current?.click()} className="self-start">
              Upload a file
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              if (f.size > MAX_FILE_BYTES) return;
              onChange({ fileName: f.name, fileSizeBytes: f.size });
            }}
          />
          <span className={cn('text-caption', showErrors && !l.fileName ? 'text-danger' : 'text-fg-subtle')}>
            {showErrors && !l.fileName ? 'Upload a file' : 'Worksheets, templates or slides, up to 200 MB. Prototype: the file isn’t stored, only its name.'}
          </span>
        </div>
      )}

      {(l.kind === 'text' || l.kind === 'video' || l.kind === 'file' || l.kind === 'live') && (
        <TextArea
          id={id('body')}
          label={l.kind === 'text' ? 'Lesson' : 'Notes under the lesson'}
          optional={l.kind !== 'text'}
          rows={l.kind === 'text' ? 8 : 3}
          value={l.body}
          error={showErrors && l.kind === 'text' && !l.body.trim() ? 'Write the lesson' : undefined}
          hint={l.kind === 'text' ? 'Leave a blank line between paragraphs.' : undefined}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      )}

      {l.kind === 'quiz' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-label font-medium text-fg">Questions</legend>
          {l.questions.map((q, qi) => {
            const filled = q.options.filter((o) => o.trim()).length;
            const bad = showErrors && (!q.prompt.trim() || filled < 2 || !q.options[q.correct]?.trim());
            return (
              <div key={q.id} className={cn('flex flex-col gap-3 rounded-md border p-3', bad ? 'border-danger/50' : 'border-line')}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <TextInput id={id(`q-${q.id}`)} label={`Question ${qi + 1}`} value={q.prompt} onChange={(e) => setQuestion(q.id, { prompt: e.target.value })} />
                  </div>
                  <IconButton className="mt-6" size="sm" icon={Trash2Icon} label={`Remove question ${qi + 1}`} disabled={l.questions.length === 1} onClick={() => onChange({ questions: l.questions.filter((x) => x.id !== q.id) })} />
                </div>
                <div role="radiogroup" aria-label={`Answers to question ${qi + 1} — pick the correct one`} className="flex flex-col gap-2">
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={q.correct === oi}
                        aria-label={`Answer ${oi + 1} is correct`}
                        onClick={() => setQuestion(q.id, { correct: oi })}
                        className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', q.correct === oi ? 'border-success bg-success-soft text-success' : 'border-line-strong text-fg-subtle hover:bg-sunken')}
                      >
                        <CheckCircle2Icon size={16} aria-hidden />
                      </button>
                      <input
                        aria-label={`Answer ${oi + 1}`}
                        value={o}
                        placeholder={`Answer ${oi + 1}`}
                        onChange={(e) => setQuestion(q.id, { options: q.options.map((x, i) => (i === oi ? e.target.value : x)) })}
                        className="h-9 min-w-0 flex-1 rounded-md border border-line-strong bg-raised px-3 text-label text-fg placeholder:text-fg-subtle focus:border-action focus:outline-none"
                      />
                      <IconButton
                        size="sm"
                        icon={Trash2Icon}
                        label={`Remove answer ${oi + 1}`}
                        disabled={q.options.length <= 2}
                        onClick={() => setQuestion(q.id, { options: q.options.filter((_, i) => i !== oi), correct: q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct })}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {q.options.length < 5 ? (
                    <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={() => setQuestion(q.id, { options: [...q.options, ''] })}>
                      Add answer
                    </Button>
                  ) : (
                    <span />
                  )}
                  <span className={cn('text-caption', bad ? 'text-danger' : 'text-fg-subtle')}>{bad ? 'Needs a question, two answers and a correct answer' : 'Tick marks the correct answer'}</span>
                </div>
              </div>
            );
          })}
          {l.questions.length < MAX_QUESTIONS && (
            <Button variant="secondary" size="sm" leadingIcon={PlusIcon} className="self-start" onClick={() => onChange({ questions: [...l.questions, blankQuestion()] })}>
              Add question
            </Button>
          )}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <TextInput id={id('minutes')} label={l.kind === 'live' ? 'Session length (minutes)' : 'Length (minutes)'} inputMode="numeric" value={String(l.minutes || '')} onChange={(e) => onChange({ minutes: Math.min(600, Number(e.target.value.replace(/\D/g, '')) || 0) })} />
        {l.kind === 'live' ? (
          <p className="text-caption text-fg-subtle sm:pt-7">Live sessions can’t be free previews, so the link stays with students who have access.</p>
        ) : (
          <div className="pt-1 sm:pt-7">
            <Switch id={id('preview')} label="Free preview" description="Anyone can open it before enrolling." checked={l.preview} onChange={(preview) => onChange({ preview })} />
          </div>
        )}
      </div>
    </div>
  );
}
