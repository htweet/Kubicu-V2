import React, { useMemo } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { handleStatus, slugifyHandle, suggestHandles, takenHandles } from '../../utils/handles';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { MediaPicker } from '../media/MediaPicker';
import { StepHeading, StepNav } from './OnboardingLayout';

interface StepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  go: (step: number) => void;
}

const BIO_MAX = 160;

const statusCopy = {
  empty: 'Choose the link people will visit.',
  invalid: 'Use 3–30 lowercase letters, numbers or hyphens.',
  reserved: 'That address is reserved by KUBICU.',
  taken: 'Someone already has that link.',
  available: 'Available'
} as const;

export function IdentityStep({ state, update, go }: StepProps) {
  const { workspaces } = useWorkspace();
  const taken = useMemo(() => takenHandles(workspaces, '__new__'), [workspaces]);
  const status = handleStatus(state.handle, taken);
  const suggestions = status === 'available' ? [] : suggestHandles(state.name || state.handle, taken, state.city);

  const onName = (name: string) => update({ name, ...(state.handleEdited ? {} : { handle: slugifyHandle(name) }) });

  const nextOk = state.name.trim().length > 0 && status === 'available';

  const skip = () => {
    const name = state.name.trim() || 'My page';
    const handle = status === 'available' ? state.handle : suggestHandles(name, taken)[0] ?? `page${Date.now().toString().slice(-6)}`;
    update({ name, handle, step: 3 });
  };

  return (
    <>
      <StepHeading title="Tell visitors who you are" description="This is the top of your page. Keep it short — you can change it any time." />
      <div className="mt-8 flex max-w-lg flex-col gap-5">
        <TextInput id="ob-name" label="Name on your page" autoComplete="organization" placeholder="e.g. Funke’s Kitchen" value={state.name} onChange={(e) => onName(e.target.value)} />
        <div>
          <TextInput
            id="ob-handle"
            label="Your link"
            prefix="kub.icu/"
            autoCapitalize="off"
            spellCheck={false}
            value={state.handle}
            onChange={(e) => update({ handle: e.target.value.toLowerCase().replace(/\s+/g, ''), handleEdited: true })}
            error={status === 'invalid' || status === 'reserved' || status === 'taken' ? statusCopy[status] : undefined} />
          
          {(status === 'available' || status === 'empty') &&
          <p className="mt-1.5 flex items-center gap-1.5 text-caption" aria-live="polite">
              {status === 'available' ?
            <>
                  <CheckCircle2Icon size={13} className="text-success" aria-hidden />
                  <span className="font-medium text-success">kub.icu/{state.handle} is available</span>
                </> :

            <span className="text-fg-subtle">{statusCopy.empty}</span>
            }
            </p>
          }
          {suggestions.length > 0 && state.handle &&
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-caption text-fg-subtle">Try:</span>
              {suggestions.map((s) =>
            <button
              key={s}
              type="button"
              onClick={() => update({ handle: s, handleEdited: true })}
              className="h-7 rounded-full border border-line px-2.5 font-mono text-caption text-fg hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                  {s}
                </button>
            )}
            </div>
          }
        </div>
        <MediaPicker id="ob-avatar" label="Photo or logo" optional round aspect="1:1" value={state.avatarUrl} onChange={(avatarUrl) => update({ avatarUrl })} />
        <TextArea
          id="ob-bio"
          label="Short description"
          optional
          rows={3}
          maxLength={BIO_MAX}
          placeholder="What you do and who it’s for"
          hint={`${state.bio.length}/${BIO_MAX}`}
          value={state.bio}
          onChange={(e) => update({ bio: e.target.value })} />
        
        <TextInput id="ob-city" label="City or area" optional placeholder="e.g. Surulere, Lagos" value={state.city} onChange={(e) => update({ city: e.target.value })} />
      </div>
      <StepNav onBack={() => go(1)} onSkip={skip} onNext={() => go(3)} nextDisabled={!nextOk} />
    </>);

}