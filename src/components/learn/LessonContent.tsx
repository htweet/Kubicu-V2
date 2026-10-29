import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, DownloadIcon, FileIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CourseLesson } from '../../types/courses';
import { parseEmbed } from '../../utils/embeds';
import { formatBytes } from '../../utils/commerce/catalog';
import { scoreQuiz } from '../../utils/commerce/courses';
import { buttonStyle, cardStyle, mix } from '../blocks/pageStyle';
import { announce } from '../../utils/announce';
import { LiveLessonPanel } from './LiveLessonPanel';

interface Props {
  theme: PageTheme;
  lesson: CourseLesson;
  passPct: number;
  bestScore?: number;
  /** Null in preview mode — quizzes still check answers but nothing is saved. */
  onQuiz: ((score: number) => void) | null;
  /** Used in a live session's calendar file. */
  courseTitle?: string;
}

function Paragraphs({ text, theme }: {text: string;theme: PageTheme;}) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="flex max-w-[68ch] flex-col gap-4">
      {parts.map((p, i) =>
      <p key={i} className="whitespace-pre-line text-[16px] leading-[1.7]" style={{ color: theme.text }}>
          {p}
        </p>
      )}
    </div>);

}

/** One lesson's material: a safe video embed, reading, a file, or a quiz (D197). */
export function LessonContent({ theme: t, lesson: l, passPct, bestScore, onQuiz, courseTitle }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    setAnswers({});
    setResult(null);
    setDownloaded(false);
  }, [l.id]);

  const embed = l.kind === 'video' ? parseEmbed(l.videoUrl) : null;
  const muted = { color: t.mutedText };

  return (
    <div className="flex flex-col gap-6">
      {l.kind === 'video' && (
      embed?.ok && embed.kind === 'video' ?
      <div className="overflow-hidden" style={{ ...cardStyle(t), padding: 0, aspectRatio: embed.frame.type === 'ratio' ? embed.frame.ratio : '16 / 9' }}>
            <iframe title={l.title} src={embed.src} allow={embed.allow} sandbox={embed.sandbox} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" allowFullScreen />
          </div> :

      <p className="rounded-md px-4 py-6 text-center text-[14px]" style={{ background: mix(t.text, 5), color: t.text }}>
            This video can’t be shown right now. Ask the course owner to check the link.
          </p>)
      }

      {l.kind === 'live' && <LiveLessonPanel theme={t} lesson={l} courseTitle={courseTitle ?? ''} />}

      {l.kind === 'file' &&
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" style={cardStyle(t)}>
          <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md" style={{ background: mix(t.text, 6) }}>
            <FileIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold" style={{ color: t.text }}>
              {l.fileName}
            </p>
            <p className="text-[12.5px]" style={muted}>
              {formatBytes(l.fileSizeBytes)}
            </p>
          </div>
          <button type="button" onClick={() => setDownloaded(true)} className="flex h-11 items-center justify-center gap-2 px-5 text-[14px] font-semibold" style={buttonStyle(t, 'featured')}>
            <DownloadIcon size={16} aria-hidden /> Download
          </button>
        </div>
      }
      {downloaded &&
      <p role="status" className="text-[12.5px]" style={muted}>
          Prototype: files aren’t stored, so nothing downloads.
        </p>
      }

      {l.body.trim() && <Paragraphs text={l.body} theme={t} />}

      {l.kind === 'quiz' &&
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const score = scoreQuiz(l, answers);
          setResult(score);
          onQuiz?.(score);
          announce(score >= passPct ? `You scored ${score}%. Passed.` : `You scored ${score}%. You need ${passPct}% to pass.`);
        }}>
        
          {bestScore !== undefined && result === null &&
        <p className="text-[13px]" style={muted}>
              Your best score so far: {bestScore}%{bestScore >= passPct ? ' — passed' : ''}. You can take it again.
            </p>
        }
          {l.questions.map((q, qi) => {
          const chosen = answers[q.id];
          return (
            <fieldset key={q.id} className="flex flex-col gap-2">
                <legend className="mb-2 text-[15px] font-semibold" style={{ color: t.text }}>
                  {qi + 1}. {q.prompt}
                </legend>
                {q.options.map((o, oi) =>
              o.trim() ?
              <label key={oi} className="flex min-h-[48px] cursor-pointer items-center gap-3 px-3.5 py-2.5" style={{ ...cardStyle(t), border: `1px solid ${chosen === oi ? t.text : mix(t.text, 12)}` }}>
                      <input type="radio" name={q.id} className="h-4 w-4" checked={chosen === oi} disabled={result !== null} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} />
                      <span className="flex-1 text-[14.5px]" style={{ color: t.text }}>
                        {o}
                      </span>
                      {result !== null && q.correct === oi &&
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: t.text }}>
                          <CheckCircle2Icon size={14} aria-hidden /> Correct answer
                        </span>
                }
                      {result !== null && chosen === oi && q.correct !== oi &&
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: t.text }}>
                          <XCircleIcon size={14} aria-hidden /> Your answer
                        </span>
                }
                    </label> :
              null
              )}
              </fieldset>);

        })}
          {result === null ?
        <button type="submit" disabled={Object.keys(answers).length < l.questions.length} className="flex h-12 items-center justify-center text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:self-start sm:px-8" style={buttonStyle(t, 'featured')}>
              Check my answers
            </button> :

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" style={cardStyle(t)} role="status">
              <p className="text-[15px] font-semibold" style={{ color: t.text }}>
                {result >= passPct ? `Passed — ${result}%` : `${result}% — you need ${passPct}% to pass`}
                {!onQuiz && <span className="block text-[12.5px] font-normal" style={muted}>Preview: scores aren’t saved.</span>}
              </p>
              <button type="button" onClick={() => {setAnswers({});setResult(null);}} className="flex h-11 items-center justify-center gap-2 px-5 text-[14px] font-semibold" style={buttonStyle(t, 'default')}>
                <RotateCcwIcon size={15} aria-hidden /> Try again
              </button>
            </div>
        }
        </form>
      }
    </div>);

}