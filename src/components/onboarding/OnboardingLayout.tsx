import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { Button } from '../ui/Button';
import { LanguagePicker } from '../ui/LanguagePicker';
import { PlatformLook } from '../marketing/PlatformLook';
import { ONBOARDING_STEPS } from '../../hooks/useOnboarding';
import { cn } from '../../utils/cn';

interface OnboardingLayoutProps {
  step: number;
  onExit: () => void;
  preview?: React.ReactNode;
  children: React.ReactNode;
}

/** Two columns on desktop: the step on the left, a live phone preview on the right. */
export function OnboardingLayout({ step, onExit, preview, children }: OnboardingLayoutProps) {
  const total = ONBOARDING_STEPS.length - 1;
  const navigate = useNavigate();
  // Back to wherever they came from (e.g. My Spaces); straight to the workspace if this was the first page.
  const goBack = () => {
    const idx = (window.history.state as {idx?: number;} | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);else
    navigate('/app');
  };
  return (
    <PlatformLook>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line px-5 md:px-8">
          <div className="flex items-center gap-3">
            {step === 0 &&
            <Button variant="tertiary" size="sm" leadingIcon={ArrowLeftIcon} onClick={goBack} className="-ml-2">
                Back
              </Button>
            }
            <Link to="/" aria-label="KUBICU home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <KubicuLogo />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <LanguagePicker variant="pill" />
            </span>
            <span className="sm:hidden">
              <LanguagePicker variant="compact" />
            </span>
            {step < total &&
            <Button variant="tertiary" onClick={onExit}>
                Save and exit
              </Button>
            }
          </div>
        </header>
        {step < total &&
        <div className="flex gap-1 px-5 pt-4 md:px-8" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-valuetext={`${ONBOARDING_STEPS[step]}, ${step + 1} of ${total}`}>
            {ONBOARDING_STEPS.slice(0, total).map((name, i) =>
          <span key={name} className={cn('h-1 flex-1 rounded-full transition-colors duration-200', i <= step ? 'nm-fill' : 'bg-sunken')} />
          )}
          </div>
        }
        <div className={cn('mx-auto grid w-full max-w-6xl flex-1 gap-12 px-5 pb-12 pt-10 md:px-8', preview && 'lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16')}>
          <main className="min-w-0">{children}</main>
          {preview &&
          <aside aria-label="Live preview of your page" className="hidden lg:block">
              <div className="sticky top-8 flex flex-col items-center gap-3">{preview}</div>
            </aside>
          }
        </div>
      </div>
    </PlatformLook>);

}

export function StepHeading({ title, description }: {title: string;description?: string;}) {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-title font-semibold text-fg md:text-[32px] md:leading-tight">{title}</h1>
      {description && <p className="mt-2 text-body text-fg-muted">{description}</p>}
    </div>);

}

interface StepNavProps {
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function StepNav({ onBack, onSkip, skipLabel = 'Skip for now', onNext, nextLabel = 'Continue', nextDisabled }: StepNavProps) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
      <div>
        {onBack &&
        <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
        }
      </div>
      <div className="flex items-center gap-2">
        {onSkip &&
        <Button variant="tertiary" onClick={onSkip}>
            {skipLabel}
          </Button>
        }
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </div>);

}

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  disabled?: boolean;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  name: string;
}

/** A radio presented as a card. */
export function ChoiceCard({ selected, onSelect, title, description, disabled, aside, children, name }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        'relative flex h-full cursor-pointer flex-col rounded-md border p-4 transition-colors duration-150',
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
        selected ? 'border-select bg-action-soft ring-1 ring-select' : 'border-line hover:border-line-strong',
        disabled && 'cursor-not-allowed border-dashed opacity-70 hover:border-line'
      )}>
      
      <input type="radio" name={name} checked={selected} disabled={disabled} onChange={onSelect} className="sr-only" />
      {children}
      <span className="flex items-start justify-between gap-2">
        <span className="text-label font-semibold text-fg">{title}</span>
        {aside}
      </span>
      {description && <span className="mt-1 text-caption text-fg-muted">{description}</span>}
    </label>);

}