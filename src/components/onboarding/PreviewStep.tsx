import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon, EyeOffIcon, InfoIcon, PenToolIcon, SendIcon } from 'lucide-react';
import type { OnboardingState } from '../../hooks/useOnboarding';
import type { BuiltOnboardingPage } from '../../utils/onboardingDoc';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { takenHandles } from '../../utils/handles';
import { validateDocument } from '../../utils/validation';
import { publicUrl } from '../../utils/format';
import { PageMiniPreview } from '../overview/PageMiniPreview';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { StepHeading } from './OnboardingLayout';
import { DemoDataChoice } from './DemoDataChoice';

interface PreviewStepProps {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  built: BuiltOnboardingPage;
  go: (step: number) => void;
  onFinish: (publish: boolean) => void;
}

export function PreviewStep({ state, update, built, go, onFinish }: PreviewStepProps) {
  const { workspaces } = useWorkspace();
  const [busy, setBusy] = useState<'publish' | 'edit' | null>(null);
  const issues = useMemo(() => validateDocument(built.doc, takenHandles(workspaces, '__new__')), [built.doc, workspaces]);
  const errors = issues.filter((i) => i.severity === 'error');

  const finish = (publish: boolean) => {
    setBusy(publish ? 'publish' : 'edit');
    onFinish(publish);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
      <div className="flex justify-center">
        <PageMiniPreview doc={built.doc} scale={0.82} height={640} />
      </div>
      <div className="min-w-0">
        <StepHeading title="Here’s your page" description={`It will live at ${publicUrl(state.handle)}. Check it the way a visitor on a phone would.`} />

        <ul className="mt-8 flex flex-col divide-y divide-line border-y border-line">
          {!state.actionType && (
            <Gap icon={AlertTriangleIcon} tone="warning" title="No main action yet">
              Visitors won’t have an obvious next step. <button type="button" className="font-semibold text-action underline underline-offset-2" onClick={() => go(3)}>Add one</button>
            </Gap>
          )}
          {built.unpricedCount > 0 && (
            <Gap icon={InfoIcon} tone="info" title={`${built.unpricedCount} item${built.unpricedCount === 1 ? '' : 's'} without a price`}>
              They’ll show “Price on request”. Add prices in the canvas when you’re ready.
            </Gap>
          )}
          {built.hidden.length > 0 && (
            <Gap icon={EyeOffIcon} tone="info" title={`${built.hidden.length} block${built.hidden.length === 1 ? '' : 's'} hidden until you add details`}>
              {built.hidden.map((h) => h.name).join(', ')}. They’re on your page in the canvas, just not visible to visitors yet.
            </Gap>
          )}
          {!state.avatarUrl && (
            <Gap icon={InfoIcon} tone="info" title="No photo or logo">
              Pages with a face or logo feel more trustworthy. <button type="button" className="font-semibold text-action underline underline-offset-2" onClick={() => go(2)}>Add one</button>
            </Gap>
          )}
        </ul>

        {errors.length > 0 && (
          <InlineAlert tone="danger" title="Fix these before publishing" className="mt-6">
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={e.id}>{e.message}</li>
              ))}
            </ul>
            You can still open the canvas and fix them there.
          </InlineAlert>
        )}

        <DemoDataChoice on={!!state.demoData} onChange={(on) => update({ demoData: on })} />

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" leadingIcon={SendIcon} disabled={errors.length > 0 || !!busy} loading={busy === 'publish'} onClick={() => finish(true)}>
            Publish my page
          </Button>
          <Button size="lg" variant="secondary" leadingIcon={PenToolIcon} disabled={!!busy} loading={busy === 'edit'} onClick={() => finish(false)}>
            Edit in canvas first
          </Button>
        </div>
        <Button variant="tertiary" className="mt-3" onClick={() => go(3)}>
          Back
        </Button>
      </div>
    </div>
  );
}

function Gap({ icon: Icon, tone, title, children }: { icon: typeof InfoIcon; tone: 'warning' | 'info'; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 py-4">
      <Icon size={17} className={tone === 'warning' ? 'mt-0.5 shrink-0 text-warning' : 'mt-0.5 shrink-0 text-fg-subtle'} aria-hidden />
      <div>
        <p className="text-label font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-label text-fg-muted">{children}</p>
      </div>
    </li>
  );
}
