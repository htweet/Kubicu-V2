import React, { useRef, useState } from 'react';
import { ImagePlusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { FormField } from '../../types/forms';
import { IMAGE_CHOICE_MAX } from '../../utils/forms/fields';
import { prepareImage, readImageFile } from '../../utils/domains/kitImages';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

interface ImageChoiceOptionsEditorProps {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

/** Options for an Image choice field: a label and a picture for each (D193). Pictures are shrunk to 480px. */
export function ImageChoiceOptionsEditor({ field, onChange }: ImageChoiceOptionsEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const images = field.options.map((_, i) => field.optionImages?.[i] ?? '');

  const set = (options: string[], optionImages: string[]) => onChange({ options, optionImages });
  const rename = (i: number, v: string) => set(field.options.map((o, j) => (j === i ? v : o)), images);
  const remove = (i: number) => set(field.options.filter((_, j) => j !== i), images.filter((_, j) => j !== i));
  const add = () => set([...field.options, `Option ${field.options.length + 1}`], [...images, '']);

  const pick = (i: number) => {
    setTarget(i);
    setError('');
    fileRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file || target === null) return;
    try {
      const im = await readImageFile(file);
      const { dataUrl } = prepareImage(im, 480, { jpeg: true });
      set(field.options, images.map((x, j) => (j === target ? dataUrl : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We couldn’t use that image.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const valid = field.options.filter((o) => o.trim()).length;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label font-medium text-fg">Options</span>
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
        {field.options.map((o, i) => (
          <li key={i} className="flex items-center gap-3 p-2.5">
            <button
              type="button"
              onClick={() => pick(i)}
              aria-label={images[i] ? `Replace picture for ${o || `option ${i + 1}`}` : `Add picture for ${o || `option ${i + 1}`}`}
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-line-strong bg-sunken text-fg-subtle transition-colors duration-150 hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {images[i] ? <img src={images[i]} alt="" className="h-full w-full object-cover" /> : <ImagePlusIcon size={18} aria-hidden />}
            </button>
            <input
              aria-label={`Option ${i + 1} label`}
              value={o}
              maxLength={40}
              onChange={(e) => rename(i, e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-field px-3 text-label text-fg outline-none focus:ring-2 focus:ring-focus"
            />
            <IconButton icon={Trash2Icon} size="sm" label={`Remove ${o || `option ${i + 1}`}`} disabled={field.options.length <= 2} onClick={() => remove(i)} />
          </li>
        ))}
      </ul>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption text-fg-subtle">
          {field.options.length} of {IMAGE_CHOICE_MAX}. Square pictures look best; each is shrunk automatically.
        </span>
        <Button size="sm" variant="secondary" leadingIcon={PlusIcon} disabled={field.options.length >= IMAGE_CHOICE_MAX} onClick={add}>
          Add option
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
      {valid < 2 && <p className="text-caption font-medium text-danger">Add at least two options.</p>}
    </div>
  );
}
