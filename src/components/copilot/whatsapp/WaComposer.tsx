import React, { useRef, useState } from 'react';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import type { CopilotQuestion, CopilotStage } from '../../../types/copilot';
import { wa } from './waStyle';

interface Props {
  question: CopilotQuestion | null;
  stage: CopilotStage;
  onText: (text: string) => void;
  onPhotos: (files: File[]) => Promise<string | null>;
}

/** WhatsApp's message bar (D263): attach photos, type, send. Typing always works, as in the real app. */
export function WaComposer({ question, stage, onText, onPhotos }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const locked = stage === 'generating';

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
    setError(await onPhotos(Array.from(files)));
    if (file.current) file.current.value = '';
  };

  return (
    <div className="shrink-0 px-2 pb-2 pt-1.5" style={{ background: wa.bar }}>
      {error &&
      <p role="alert" className="px-2 pb-1 text-[12px] text-[rgb(185_28_28)]">
          {error}
        </p>
      }
      <form onSubmit={submit} className="flex items-end gap-2">
        <div className="flex min-h-[44px] flex-1 items-end rounded-[22px] bg-white pl-1">
          <input ref={file} id="wa-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple={question?.topic !== 'logo'} className="sr-only" onChange={(e) => pick(e.target.files)} disabled={locked} />
          <label
            htmlFor="wa-photos"
            aria-label={question?.topic === 'logo' ? 'Attach your logo' : 'Attach photos'}
            className="flex h-11 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full focus-within:ring-2"
            style={{ color: question?.input === 'images' ? wa.send : wa.meta }}>
            
            <PaperclipIcon size={20} aria-hidden />
          </label>
          <label htmlFor="wa-input" className="sr-only">
            Message
          </label>
          <textarea
            id="wa-input"
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
            placeholder={locked ? 'Copilot is making your draft…' : question?.placeholder ?? 'Message'}
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent py-[11px] pr-3 text-[15px] outline-none disabled:opacity-60"
            style={{ color: wa.text }} />
          
        </div>
        <button
          type="submit"
          aria-label="Send"
          disabled={locked || !text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-[opacity,transform] duration-150 ease-out active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50"
          style={{ background: wa.send }}>
          
          <SendIcon size={18} aria-hidden />
        </button>
      </form>
    </div>);

}