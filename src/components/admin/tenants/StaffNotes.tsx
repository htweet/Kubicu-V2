import React, { useState } from 'react';
import type { StaffNote } from '../../../types/admin';
import { formatTimestamp } from '../../../utils/format';
import { useT } from '../../../contexts/LocaleContext';
import { Button } from '../../ui/Button';
import { TextArea } from '../../ui/TextArea';

/** Internal notes on a person or workspace (D472). Customers never see them. Notes stay as written (D489). */
export function StaffNotes({ id, notes, onAdd }: {id: string;notes: StaffNote[];onAdd: (text: string) => void;}) {
  const { t } = useT();
  const [text, setText] = useState('');
  return (
    <section aria-labelledby={`${id}-notes`}>
      <h3 id={`${id}-notes`} className="text-label font-semibold text-fg">
        {t('Staff notes')}
      </h3>
      <p className="mt-0.5 text-caption text-fg-subtle">{t('Only KUBICU staff see these.')}</p>
      <div className="mt-3 flex flex-col gap-2">
        <TextArea id={`${id}-note`} label={t('Add a note')} rows={2} value={text} placeholder={t('e.g. Called them about the failed payout — waiting on bank letter')} onChange={(e) => setText(e.target.value.slice(0, 500))} />
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            disabled={text.trim().length < 3}
            onClick={() => {
              onAdd(text.trim());
              setText('');
            }}>
            
            {t('Save note')}
          </Button>
        </div>
      </div>
      {notes.length > 0 &&
      <ul className="mt-3 divide-y divide-line border-y border-line">
          {notes.map((n) =>
        <li key={n.id} className="py-3">
              <p className="whitespace-pre-wrap text-label text-fg">{n.text}</p>
              <p className="mt-1 text-caption text-fg-subtle">
                {n.by} · {formatTimestamp(n.at)}
              </p>
            </li>
        )}
        </ul>
      }
    </section>);

}