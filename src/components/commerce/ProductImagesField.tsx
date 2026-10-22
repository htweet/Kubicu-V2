import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from 'lucide-react';
import type { ProductImage } from '../../types/commerce';
import { MediaPicker } from '../media/MediaPicker';
import { MediaImage } from '../media/MediaImage';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { uid } from '../../utils/id';

const MAX = 6;

/** Ordered product photos. The first one is the cover on your page. */
export function ProductImagesField({ images, onChange }: {images: ProductImage[];onChange: (images: ProductImage[]) => void;}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const [img] = next.splice(i, 1);
    next.splice(i + dir, 0, img);
    onChange(next);
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">
        Photos <span className="font-normal text-fg-subtle">· {images.length} of {MAX} · the first is the cover</span>
      </legend>
      {images.length > 0 &&
      <ol className="flex flex-col gap-2">
          {images.map((img, i) =>
        <li key={img.id} className="flex items-start gap-3 rounded-md border border-line p-2.5">
              <MediaImage src={img.url} alt="" className="h-16 w-14 shrink-0 rounded-sm object-cover" />
              <div className="min-w-0 flex-1">
                <TextInput
              id={`img-alt-${img.id}`}
              label={i === 0 ? 'Cover description' : `Photo ${i + 1} description`}
              value={img.alt}
              placeholder="What’s in the photo"
              hint={img.alt.trim() ? undefined : 'Needed for screen readers.'}
              onChange={(e) => onChange(images.map((x) => x.id === img.id ? { ...x, alt: e.target.value } : x))} />
            
              </div>
              <div className="flex shrink-0 flex-col">
                <IconButton icon={ArrowUpIcon} size="sm" label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton icon={ArrowDownIcon} size="sm" label="Move later" disabled={i === images.length - 1} onClick={() => move(i, 1)} />
                <IconButton icon={Trash2Icon} size="sm" label="Remove photo" onClick={() => onChange(images.filter((x) => x.id !== img.id))} />
              </div>
            </li>
        )}
        </ol>
      }
      {images.length < MAX &&
      <MediaPicker
        id="product-add-photo"
        label={images.length ? 'Add another photo' : 'Add a photo'}
        aspect="4:5"
        value=""
        onChange={(url, meta) => url && onChange([...images, { id: uid('img'), url, alt: meta?.alt ?? '' }])}
        hint="Choose from your library or upload. Crop a portrait 4:5 copy for the best fit." />

      }
    </fieldset>);

}