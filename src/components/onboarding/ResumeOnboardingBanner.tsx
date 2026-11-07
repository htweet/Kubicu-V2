import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useT } from '../../contexts/LocaleContext';
import { ONBOARDING_STEPS, clearOnboarding, hasUnfinishedOnboarding, readOnboarding } from '../../hooks/useOnboarding';

/** Shown on Overview when someone left setup halfway. */
export function ResumeOnboardingBanner() {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const [saved] = useState(() => readOnboarding());
  const [visible, setVisible] = useState(() => hasUnfinishedOnboarding());

  useEffect(() => {
    // A finished run has nothing to resume.
    if (saved?.workspaceId) clearOnboarding();
  }, [saved]);

  if (!visible || !saved) return null;

  return (
    <section aria-label={tr('Unfinished setup')} className="mt-8 flex flex-col gap-4 rounded-md border border-line bg-raised p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-label font-semibold text-fg">
          {saved.name.trim() ? tr('Finish setting up “{name}”', { name: saved.name.trim() }) : tr('Finish setting up your new page')}
        </h2>
        <p className="mt-1 text-label text-fg-muted">{tr('You stopped at: {step}. Everything you entered is saved.', { step: tr(ONBOARDING_STEPS[saved.step]) })}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="tertiary"
          onClick={() => {
            clearOnboarding();
            setVisible(false);
          }}
        >
          {tr('Discard')}
        </Button>
        <Button trailingIcon={ArrowRightIcon} onClick={() => navigate('/start')}>
          {tr('Continue setup')}
        </Button>
      </div>
    </section>
  );
}
