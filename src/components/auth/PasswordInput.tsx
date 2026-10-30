import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { Field, fieldControlClass } from '../ui/Field';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Right of the label, e.g. "Forgot password?". */
  trailing?: React.ReactNode;
}

/** Password field with a show/hide button, so people on small keyboards can check what they typed. */
export function PasswordInput({ id, label, hint, error, trailing, className, ...rest }: PasswordInputProps) {
  const { t } = useT();
  const [shown, setShown] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <Field id={id} label={label} hint={hint} error={error} trailing={trailing}>
      <div className="relative flex items-center">
        <LockIcon size={15} className="pointer-events-none absolute left-3.5 text-fg-subtle" aria-hidden />
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldControlClass, 'h-12 rounded-xl pl-10 pr-12', className)}
          {...rest} />
        
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-label={shown ? t('Hide password') : t('Show password')}
          className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          {shown ? <EyeOffIcon size={17} aria-hidden /> : <EyeIcon size={17} aria-hidden />}
        </button>
      </div>
    </Field>);

}