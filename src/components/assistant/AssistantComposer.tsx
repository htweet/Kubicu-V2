import React, { useLayoutEffect, useRef, useState } from 'react';
import { ImagePlusIcon, Loader2Icon, SendIcon, UploadIcon } from 'lucide-react';
import type { AssistantQuestion } from '../../types/assistant';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/image';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../utils/cn';

interface AssistantComposerProps {
  question: AssistantQuestion | null;
  disabled: boolean;
  uploading: boolean;
  placeholder: string;
  onText: (text: string) => void;
  onChoice: (value: string, label: string) => void;
  onSkip: () => void;
  onFiles: (files: File[], as: 'logo' | 'photos') => void;
  /** Suggested requests when there's no question (after the build). Tapping one sends it. */
  suggestions?: { value: string; label: string }[];
}

/** Quick replies for the current question, plus a message box with photo upload (D211). */
export function AssistantComposer({ question, disabled, uploading, placeholder, onText, onChoice, onSkip, onFiles, suggestions = [] }: AssistantComposerProps) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the text (up to the max height), back to one line when empty.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (text) el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);
  const imageQuestion = question?.input === 'image' || question?.input === 'images';
  const uploadAs: 'logo' | 'photos' = question?.input === 'image' ? 'logo' : 'photos';

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    onText(t);
    setText('');
  };

  return (
    <div className="shrink-0 border-t border-line bg-raised px-4 pb-4 pt-3">
      {!question && suggestions.length > 0 && (
        <div role="group" aria-label="Suggested changes" className="mb-3 flex flex-wrap gap-1.5">
          {suggestions.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={disabled}
              onClick={() => onText(c.label)}
              className="inline-flex min-h-9 items-center rounded-full border border-dashed border-line-strong bg-canvas px-3 text-label font-medium text-fg transition-colors duration-150 hover:border-action hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {question && question.chips.length > 0 && (
        <div role="group" aria-label="Quick replies" className="mb-3 flex flex-wrap gap-1.5">
          {question.chips.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={disabled}
              onClick={() => onChoice(c.value, c.label)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-canvas px-3 text-label font-medium text-fg transition-colors duration-150 hover:border-action hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            >
              {c.swatch && (
                <span className="flex h-5 w-8 shrink-0 overflow-hidden rounded-sm border border-line" aria-hidden style={{ background: c.swatch.background }}>
                  <span className="m-auto h-2.5 w-4 rounded-[3px]" style={{ background: c.swatch.accent }} />
                </span>
              )}
              {c.label}
            </button>
          ))}
        </div>
      )}

      {imageQuestion && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="secondary" leadingIcon={uploading ? Loader2Icon : UploadIcon} disabled={disabled || uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? 'Saving to Media…' : uploadAs === 'logo' ? 'Upload logo or photo' : 'Choose photos'}
          </Button>
          <span className="text-caption text-fg-subtle">JPG, PNG or WebP · {uploadAs === 'logo' ? 'saved to Brand assets' : 'saved to Media'}</span>
        </div>
      )}

      {question?.skippable && (
        <button type="button" disabled={disabled} onClick={onSkip} className="mb-2 text-caption font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">
          {imageQuestion ? 'Skip — use placeholders' : 'Skip for now'}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple={uploadAs === 'photos'}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files, uploadAs);
          e.target.value = '';
        }}
      />

      <form onSubmit={submit} className="flex items-end gap-2">
        <IconButton icon={ImagePlusIcon} label="Add photos" variant="outline" size="lg" disabled={disabled || uploading} onClick={() => fileRef.current?.click()} />
        <label htmlFor="assistant-input" className="sr-only">
          Message the assistant
        </label>
        <textarea
          id="assistant-input"
          rows={1}
          ref={inputRef}
          value={text}
          disabled={disabled || (question !== null && !question.allowText)}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={question && !question.allowText ? 'Pick an option above' : question?.placeholder ?? placeholder}
          inputMode={question?.input === 'tel' ? 'tel' : undefined}
          className={cn(
            'max-h-40 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto rounded-md placeholder:truncate border border-line-strong bg-canvas px-3 py-2.5 text-body text-fg placeholder:text-fg-subtle focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60',
          )}
        />
        <IconButton icon={SendIcon} label="Send" variant="solid" size="lg" type="submit" disabled={disabled || !text.trim()} />
      </form>
    </div>
  );
}
