import React, { forwardRef } from 'react';
import { Field, fieldControlClass } from './Field';
import { cn } from '../../utils/cn';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { id, label, hint, error, optional, className, rows = 3, required, ...rest },
  ref,
) {
  rest = { ...rest, 'aria-required': rest['aria-required'] ?? (required || undefined) };
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldControlClass, 'resize-y py-2.5 leading-relaxed', className)}
        {...rest}
      />
    </Field>
  );
});
