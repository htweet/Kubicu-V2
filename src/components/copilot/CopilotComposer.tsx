import React, { useRef, useState } from 'react';
import { ArrowUpIcon, ImagePlusIcon } from 'lucide-react';
import type { CopilotQuestion, CopilotStage } from '../../types/copilot';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface Props {
  question: CopilotQuestion | null;
  stage: CopilotStage;
  onText: (text: string) => void;
  onSkip: () => void;
  onPhotos: (files: File[]) => Promise<string | null>;
}

/** Typing always works; photos and Skip appear only when the question takes them (D262). Translated in D339. */
export function CopilotComposer({ question, stage, onText, onSkip, onPhotos }: Props) {
  const { t: tr } = useT();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const locked = stage === 'generating';
  const wantsPhotos = question?.input === 'images';
  const placeholder = locked
    ? tr('Making your draft…')
    : question?.placeholder
      ? tr(question.placeholder)
      : tr(stage === 'ready' || stage === 'brief' ? 'Ask for a change, e.g. “make it warmer”' : 'Type a message…');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || locked) return;
    onText(t);
    setText('');
    setError(null);
  };

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const problem = await onPhotos(Array.from(files));
    setBusy(false);
    setError(problem ? tr(problem) : null);
    if (file.current) file.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {(wantsPhotos || question?.skippable) && !locked && (
        <div className="flex flex-wrap items-center gap-2">
          {wantsPhotos && (
            <>
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple={(question?.maxImages ?? 6) > 1} className="sr-only" id="copilot-photos" onChange={(e) => pick(e.target.files)} />
              <label
                htmlFor="copilot-photos"
                className="inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-action px-4 text-label font-semibold text-action-fg transition-transform duration-150 ease-out active:scale-[0.97] focus-within:ring-2 focus-within:ring-focus"
              >
                <ImagePlusIcon size={16} aria-hidden /> {busy ? tr('Adding…') : question?.topic === 'logo' ? tr('Choose my logo') : tr('Choose photos (up to {n})', { n: question?.maxImages ?? 5 })}
              </label>
            </>
          )}
          {question?.skippable && (
            <button type="button" onClick={onSkip} className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              {tr('Skip for now')}
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="flex items-end gap-2 rounded-[26px] border border-line-strong bg-raised p-1.5 pl-4 focus-within:ring-2 focus-within:ring-focus">
        <label htmlFor="copilot-input" className="sr-only">
          {tr('Message Copilot')}
        </label>
        <textarea
          id="copilot-input"
          rows={1}
          value={text}
          disabled={locked}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && question?.topic !== 'items') {
              e.preventDefault();
              submit(e);
            }
          }}
          inputMode={question?.input === 'tel' ? 'tel' : 'text'}
          placeholder={placeholder}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-body text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label={tr('Send')}
          disabled={locked || !text.trim()}
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action text-action-fg transition-[opacity,transform] duration-150 ease-out active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40')}
        >
          <ArrowUpIcon size={18} aria-hidden />
        </button>
      </form>
    </div>
  );
}
