import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { SocialItem, SocialPlatform } from '../../../types/page';
import { socialPlatformLabels, socialPlatforms } from '../../../data/socialPlatforms';
import type { ValidationIssue } from '../../../utils/validation';
import { useT } from '../../../contexts/LocaleContext';
import { uid } from '../../../utils/id';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { fieldControlClass } from '../../ui/Field';
import { cn } from '../../../utils/cn';

interface SocialItemsEditorProps {
  blockId: string;
  items: SocialItem[];
  issues: ValidationIssue[];
  onChange: (items: SocialItem[], field: string) => void;
}

/** Platform names are brands and stay as they are. */
export function SocialItemsEditor({ blockId, items, issues, onChange }: SocialItemsEditorProps) {
  const { t: tr } = useT();
  const unused = socialPlatforms.filter((p) => !items.some((i) => i.platform === p));
  const update = (id: string, patch: Partial<SocialItem>, field: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)), `${id}:${field}`);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-label font-medium text-fg">{tr('Profiles')}</legend>
      {items.length === 0 && <p className="text-caption text-fg-subtle">{tr('Add the profiles where your customers already follow you.')}</p>}
      {items.map((item) => {
        const error = issues.find((i) => i.field === `item:${item.id}`)?.message;
        const platform = socialPlatformLabels[item.platform];
        return (
          <div key={item.id} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label htmlFor={`${blockId}-${item.id}-platform`} className="sr-only">
                {tr('Platform')}
              </label>
              <select
                id={`${blockId}-${item.id}-platform`}
                value={item.platform}
                onChange={(e) => update(item.id, { platform: e.target.value as SocialPlatform }, 'platform')}
                className={cn(fieldControlClass, 'h-9 w-[118px] shrink-0 text-label')}
              >
                {socialPlatforms
                  .filter((p) => p === item.platform || unused.includes(p))
                  .map((p) => (
                    <option key={p} value={p}>
                      {socialPlatformLabels[p]}
                    </option>
                  ))}
              </select>
              <label htmlFor={`${blockId}-${item.id}-url`} className="sr-only">
                {tr('{platform} link', { platform })}
              </label>
              <input
                id={`${blockId}-${item.id}-url`}
                type="url"
                inputMode="url"
                value={item.url}
                placeholder="https://"
                aria-invalid={error ? true : undefined}
                onChange={(e) => update(item.id, { url: e.target.value }, 'url')}
                className={cn(fieldControlClass, 'h-9 min-w-0 flex-1 text-label')}
              />
              <IconButton
                icon={Trash2Icon}
                label={tr('Remove {platform}', { platform })}
                size="sm"
                onClick={() => onChange(items.filter((i) => i.id !== item.id), 'remove')}
              />
            </div>
            {error && <p className="text-caption text-danger">{tr(error)}</p>}
          </div>
        );
      })}
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={PlusIcon}
        className="self-start"
        disabled={unused.length === 0}
        onClick={() => onChange([...items, { id: uid('soc'), platform: unused[0], url: '' }], 'add')}
      >
        {tr('Add profile')}
      </Button>
    </fieldset>
  );
}
