import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clearOnboarding, useOnboarding, writeOnboarding } from '../hooks/useOnboarding';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { buildOnboardingPage } from '../utils/onboardingDoc';
import { writePendingKit } from '../utils/kits';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { GoalStep } from '../components/onboarding/GoalStep';
import { KitStep } from '../components/onboarding/KitStep';
import { IdentityStep } from '../components/onboarding/IdentityStep';
import { ActionStep } from '../components/onboarding/ActionStep';
import { PreviewStep } from '../components/onboarding/PreviewStep';
import { ShareStep } from '../components/onboarding/ShareStep';
import { PageMiniPreview } from '../components/overview/PageMiniPreview';

/** Six short, skippable, resumable steps from goal to a published page with one real action. */
export function Onboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { create, current } = useWorkspace();
  const { state, update, go } = useOnboarding(params.get('kit'));
  const built = useMemo(() => buildOnboardingPage(state), [state]);

  const finish = (publish: boolean) => {
    try {
      // Save progress first: creating the workspace switches to it and remounts this screen.
      const next = { ...state, step: publish ? 5 : state.step, published: publish, workspaceId: 'pending' };
      writeOnboarding(next);
      const workspace = create({ name: state.name.trim() || 'My page', ownerName: state.name, doc: built.doc, publish, demoData: !!state.demoData, whatsapp: state.actionType === 'whatsapp' ? state.actionValue : undefined });
      writeOnboarding({ ...next, workspaceId: workspace.id });
      if (state.businessKitId) writePendingKit(workspace.id, state.businessKitId);
      if (!publish) {
        clearOnboarding();
        // An industry page set chosen on the Starter step opens straight away in the canvas (D137).
        if (state.useAssistant) {
          navigate('/app/assistant');
          return;
        }
        navigate(`/app/canvas/${workspace.pageId}${state.siteKitId ? `?siteKit=${state.siteKitId}` : ''}`);
        toast('Your page is ready to edit', {
          description: state.demoData ? 'Demo data is in every area, labelled “Sample”. It’s removed automatically in 7 days.' : 'Publish from the top bar when you’re happy with it.'
        });
      }
    } catch {
      writeOnboarding({ ...state, workspaceId: null });
      toast.error('Couldn’t save your page', { description: 'Your browser storage may be full. Free some space and try again.' });
    }
  };

  const exit = () => {
    toast('Progress saved', { description: 'Pick up where you left off from your workspace.' });
    navigate('/app');
  };

  const done = () => {
    clearOnboarding();
    navigate(state.useAssistant ? '/app/assistant' : state.siteKitId ? `/app/canvas/${current.pageId}?siteKit=${state.siteKitId}` : '/app');
  };

  const livePreview = state.step <= 3 ?
  <>
      <PageMiniPreview doc={built.doc} scale={0.82} height={620} />
      <p className="text-caption text-fg-subtle">Live preview</p>
    </> :
  undefined;

  const stepProps = { state, update, go };

  return (
    <OnboardingLayout step={state.step} onExit={exit} preview={livePreview}>
      {state.step === 0 && <GoalStep {...stepProps} />}
      {state.step === 1 && <KitStep {...stepProps} />}
      {state.step === 2 && <IdentityStep {...stepProps} />}
      {state.step === 3 && <ActionStep {...stepProps} />}
      {state.step === 4 && <PreviewStep state={state} update={update} built={built} go={go} onFinish={finish} />}
      {state.step === 5 && <ShareStep state={state} onDone={done} />}
    </OnboardingLayout>);

}