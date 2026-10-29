import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { handleStatus, suggestHandles, takenHandles } from '../../utils/handles';
import { CLAIM_HOLD_MINUTES, saveHandleClaim } from '../../utils/handleClaim';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/** Hero form: type the kub.icu address you want, see if it's free, claim it and go to sign-up (D84). */
export function HandleClaim() {
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();
  const taken = useMemo(() => takenHandles(workspaces, '__new__'), [workspaces]);
  const [handle, setHandle] = useState('');
  const [tried, setTried] = useState(false);

  const status = handleStatus(handle, taken);
  const suggestions = status === 'taken' || status === 'reserved' ? suggestHandles(handle, taken) : [];

  const claim = (value: string) => {
    setTried(true);
    if (handleStatus(value, taken) !== 'available') return;
    saveHandleClaim(value);
    navigate(`/signup?handle=${encodeURIComponent(value)}`);
  };

  const message = (() => {
    switch (status) {
      case 'available':
        return { tone: 'ok' as const, text: `kub.icu/${handle} is free. Claim it before someone else does.` };
      case 'taken':
        return { tone: 'bad' as const, text: `kub.icu/${handle} is already taken.` };
      case 'reserved':
        return { tone: 'bad' as const, text: `kub.icu/${handle} is reserved by KUBICU.` };
      case 'invalid':
        return { tone: 'bad' as const, text: 'Use 3–30 lowercase letters, numbers or dashes.' };
      default:
        return tried ? { tone: 'bad' as const, text: 'Type the address you want for your page.' } : null;
    }
  })();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        claim(handle);
      }}
      className="w-full max-w-lg"
      aria-describedby="claim-status">
      
      <label htmlFor="claim-handle" className="text-label font-semibold text-fg">
        Claim your link
      </label>
      <div
        className={cn(
          'mt-2 flex flex-col gap-2 rounded-[28px] border-2 bg-raised p-1.5 shadow-2 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus sm:flex-row sm:items-center sm:rounded-full',
          message?.tone === 'bad' ? 'border-danger' : message?.tone === 'ok' ? 'border-success' : 'border-transparent'
        )}>
        
        <div className="flex min-w-0 flex-1 items-center pl-4">
          <span className="shrink-0 select-none text-[17px] font-medium text-fg-subtle" aria-hidden>
            kub.icu/
          </span>
          <input
            id="claim-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            placeholder="yourbusiness"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={30}
            aria-invalid={message?.tone === 'bad' || undefined}
            className="h-11 min-w-0 flex-1 bg-transparent text-[17px] font-medium text-fg placeholder:text-fg-subtle focus:outline-none" />
          
        </div>
        <Button type="submit" size="lg" variant="primary" trailingIcon={ArrowRightIcon} className="h-12 shrink-0 rounded-full px-6 text-[15px] font-bold">
          Claim it — free
        </Button>
      </div>

      <div id="claim-status" aria-live="polite" className="mt-2.5 min-h-[20px]">
        {message &&
        <p className={cn('flex items-center gap-1.5 text-label', message.tone === 'ok' ? 'text-success' : 'text-danger')}>
            {message.tone === 'ok' ? <CheckCircle2Icon size={15} aria-hidden /> : <XCircleIcon size={15} aria-hidden />}
            {message.text}
          </p>
        }
        {suggestions.length > 0 &&
        <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-caption text-fg-subtle">Free instead:</span>
            {suggestions.map((s) =>
          <button
            key={s}
            type="button"
            onClick={() => setHandle(s)}
            className="rounded-full border border-line-strong px-3 py-1 text-caption font-medium text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
                kub.icu/{s}
              </button>
          )}
          </div>
        }
      </div>
      <p className="mt-1 text-caption text-fg-subtle">
        We hold it for {CLAIM_HOLD_MINUTES} minutes while you create your account. No card needed.
      </p>
    </form>);

}