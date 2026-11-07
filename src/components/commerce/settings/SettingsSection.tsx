import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Card } from '../../ui/layout/Card';
import { Button } from '../../ui/Button';

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  dirty?: boolean;
  justSaved?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  /** Disable Save while the section has errors (they're shown inline). */
  saveDisabled?: boolean;
  children: React.ReactNode;
}

/** One section of Commerce settings: its own Save and Saved state (D222). */
export function SettingsSection({ id, title, description, dirty, justSaved, onSave, onReset, saveDisabled, children }: SettingsSectionProps) {
  return (
    <Card
      id={id}
      title={title}
      description={description}
      className="scroll-mt-24"
      footer={
        onSave ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p className="mr-auto text-caption text-fg-subtle" aria-live="polite">
              {dirty ? 'Unsaved changes' : justSaved ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckIcon size={13} aria-hidden /> Saved
                </span>
              ) : ''}
            </p>
            {dirty && onReset && (
              <Button variant="tertiary" size="sm" onClick={onReset}>
                Discard
              </Button>
            )}
            <Button size="sm" onClick={onSave} disabled={!dirty || saveDisabled}>
              Save
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">{children}</div>
    </Card>
  );
}
