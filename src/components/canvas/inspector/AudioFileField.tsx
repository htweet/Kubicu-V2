import React, { useRef, useState } from 'react';
import { UploadIcon, XIcon } from 'lucide-react';
import { useT } from '../../../contexts/LocaleContext';
import { TextInput } from '../../ui/TextInput';
import { Button } from '../../ui/Button';

const MAX_BYTES = 1.5 * 1024 * 1024;

interface AudioFileFieldProps {
  id: string;
  url: string;
  fileName: string;
  error?: string;
  onChange: (patch: { url: string; fileName: string }) => void;
}

/**
 * An audio source: paste a link (Google Drive direct link, Dropbox, SoundCloud file, your site),
 * or upload a short clip. Uploads are kept in this browser in the prototype, so they're capped
 * at 1.5 MB — real file storage comes with the engineering build (D124). Translated in D301.
 */
export function AudioFileField({ id, url, fileName, error, onChange }: AudioFileFieldProps) {
  const { t: tr } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const uploaded = url.startsWith('data:');

  const onFile = (file: File | undefined) => {
    setProblem(null);
    if (!file) return;
    if (!file.type.startsWith('audio/')) return setProblem('Choose an audio file (MP3, M4A, OGG or WAV).');
    if (file.size > MAX_BYTES) return setProblem('That file is over 1.5 MB. Paste a link to it instead — uploads are limited while files stay in this browser.');
    const reader = new FileReader();
    reader.onload = () => onChange({ url: String(reader.result), fileName: file.name });
    reader.onerror = () => setProblem('We couldn’t read that file. Try again or paste a link.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {uploaded ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-sunken px-3 py-2">
          <span className="min-w-0 truncate text-label text-fg">{fileName || tr('Uploaded track')}</span>
          <button type="button" onClick={() => onChange({ url: '', fileName: '' })} aria-label={tr('Remove uploaded track')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <XIcon size={15} aria-hidden />
          </button>
        </div>
      ) : (
        <TextInput
          id={id}
          label={tr('Audio link')}
          placeholder="https://…/track.mp3"
          value={url}
          error={error}
          hint={tr('A direct link to an MP3, M4A or OGG file.')}
          onChange={(e) => onChange({ url: e.target.value.trim(), fileName })}
        />
      )}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" leadingIcon={UploadIcon} onClick={() => input.current?.click()}>
          {uploaded ? tr('Replace file') : tr('Or upload (up to 1.5 MB)')}
        </Button>
        <input ref={input} type="file" accept="audio/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {problem && <p role="alert" className="text-caption font-medium text-danger">{tr(problem)}</p>}
    </div>
  );
}
