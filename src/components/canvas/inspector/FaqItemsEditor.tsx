import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { FaqItem } from '../../../types/page';
import { useT } from '../../../contexts/LocaleContext';
import { uid } from '../../../utils/id';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { fieldControlClass } from '../../ui/Field';
import { cn } from '../../../utils/cn';

interface FaqItemsEditorProps {
  blockId: string;
  items: FaqItem[];
  onChange: (items: FaqItem[], field: string) => void;
}

export function FaqItemsEditor({ blockId, items, onChange }: FaqItemsEditorProps) {
  const { t: tr } = useT();
  const update = (id: string, patch: Partial<FaqItem>, field: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)), `${id}:${field}`);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next, 'order');
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-label font-medium text-fg">{tr('Questions')}</legend>
      {items.map((item, i) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-md border border-line p-3">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-fg-subtle">{tr('Question {n}', { n: i + 1 })}</span>
            <div className="flex">
              <IconButton icon={ArrowUpIcon} label={tr('Move question up')} size="sm" disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon={ArrowDownIcon} label={tr('Move question down')} size="sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} />
              <IconButton
                icon={Trash2Icon}
                label={tr('Remove question')}
                size="sm"
                onClick={() => onChange(items.filter((x) => x.id !== item.id), 'remove')}
              />
            </div>
          </div>
          <label htmlFor={`${blockId}-${item.id}-q`} className="sr-only">
            {tr('Question {n}', { n: i + 1 })}
          </label>
          <input
            id={`${blockId}-${item.id}-q`}
            value={item.question}
            placeholder={tr('e.g. Do you deliver outside Lagos?')}
            onChange={(e) => update(item.id, { question: e.target.value }, 'q')}
            className={cn(fieldControlClass, 'h-9 text-label')}
          />
          <label htmlFor={`${blockId}-${item.id}-a`} className="sr-only">
            {tr('Answer {n}', { n: i + 1 })}
          </label>
          <textarea
            id={`${blockId}-${item.id}-a`}
            rows={3}
            value={item.answer}
            placeholder={tr('Your answer')}
            onChange={(e) => update(item.id, { answer: e.target.value }, 'a')}
            className={cn(fieldControlClass, 'resize-y py-2 text-label')}
          />
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={PlusIcon}
        className="self-start"
        onClick={() => onChange([...items, { id: uid('faq'), question: '', answer: '' }], 'add')}
      >
        {tr('Add question')}
      </Button>
    </fieldset>
  );
}
