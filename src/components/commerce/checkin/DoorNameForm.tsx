import React, { useState } from 'react';
import { DoorOpenIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { cn } from '../../../utils/cn';

const SUGGESTIONS = ['Main gate', 'Side gate', 'VIP entrance', 'Back door'];

/** Each phone names its door, so every check-in says where it happened (D143). */
export function DoorNameForm({ initial, onSave, onCancel }: { initial: string; onSave: (name: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState('');
  const save = () => {
    if (!name.trim()) return setError('Give this door a name, like “Main gate”.');
    onSave(name);
  };
  return (
    <section aria-labelledby="ci-door-name" className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted" aria-hidden>
          <DoorOpenIcon size={18} />
        </span>
        <div>
          <h2 id="ci-door-name" className="text-label font-semibold text-fg">
            Which door is this phone at?
          </h2>
          <p className="mt-0.5 text-caption text-fg-subtle">Every check-in records the door, so if a ticket is scanned twice you’ll see where it was used first.</p>
        </div>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <TextInput id="ci-door" label="Door name" value={name} error={error} maxLength={30} onChange={(e) => (setName(e.target.value), setError(''))} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => (setName(s), setError(''))}
              aria-pressed={name === s}
              className={cn(
                'min-h-[44px] rounded-full border px-4 text-label transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                name === s ? 'border-action bg-action text-action-fg' : 'border-line text-fg hover:bg-sunken',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Start checking in</Button>
        </div>
      </form>
    </section>
  );
}
