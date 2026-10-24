import React, { forwardRef } from "react";
import { Field, fieldControlClass } from "./Field";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  prefix?: string;
  leadingIcon?: BoxIcon;
  fieldClassName?: string;
}
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({
  id,
  label,
  hint,
  error,
  optional,
  prefix,
  leadingIcon: Icon,
  fieldClassName,
  className,
  required,
  ...rest
}, ref) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  // `required` is announced to screen readers; our own messages handle validation, not the browser's bubbles (D139).
  rest = { ...rest, 'aria-required': rest['aria-required'] ?? (required || undefined) };
  return <Field id={id} label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
      <div className="relative flex items-center">
        {Icon && <Icon size={15} className="pointer-events-none absolute left-3 text-fg-subtle" aria-hidden />}
        {prefix && <span className="pointer-events-none absolute left-3 text-body text-fg-subtle" aria-hidden>
            {prefix}
          </span>}
        <input ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(fieldControlClass, 'h-10', (Icon || prefix) && 'pl-9', prefix && prefix.length > 2 && 'pl-[4.75rem]', className)} {...rest} />
      </div>
    </Field>;
});