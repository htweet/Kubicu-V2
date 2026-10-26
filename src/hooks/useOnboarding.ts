import { useCallback, useEffect, useState } from 'react';
import type { ExampleGoal } from '../data/examples';
import { clearHandleClaim, readHandleClaim } from '../utils/handleClaim';

/** A handle claimed on the website fills the Identity step unless the owner already chose one (D84). */
function withClaim(state: OnboardingState): OnboardingState {
  if (state.handleEdited || state.workspaceId) return state;
  const claim = readHandleClaim();
  return claim ? { ...state, handle: claim.handle, handleEdited: true } : state;
}

export const ONBOARDING_KEY = 'kubicu.onboarding.v1';

export type OnboardingGoal = ExampleGoal | 'other';
export type FirstActionType = 'whatsapp' | 'booking' | 'link' | 'form';

export interface OnboardingState {
  step: number;
  goal: OnboardingGoal | null;
  businessType: string;
  kitId: string | null;
  /** A Business kit picked on the Starter step; its products, services and policies are offered after setup (D126). */
  businessKitId?: string | null;
  /** An industry page set to add after setup (D137). */
  siteKitId?: string | null;
  name: string;
  handle: string;
  /** True once the owner edits the handle, so we stop auto-suggesting it. */
  handleEdited: boolean;
  bio: string;
  avatarUrl: string;
  city: string;
  actionType: FirstActionType | null;
  actionValue: string;
  actionLabel: string;
  /** Set when the workspace has been created (publish or edit). */
  workspaceId: string | null;
  published: boolean;
  /** Start the workspace with labelled sample data in every module, removed after 7 days (D200). Only offered here. */
  demoData?: boolean;
  /** Open the AI page assistant straight after setup (D211). */
  useAssistant?: boolean;
}

export const ONBOARDING_STEPS = ['Goal', 'Starter', 'Identity', 'First action', 'Preview', 'Share'] as const;

export const initialOnboarding: OnboardingState = {
  step: 0,
  goal: null,
  businessType: '',
  kitId: null,
  name: '',
  handle: '',
  handleEdited: false,
  bio: '',
  avatarUrl: '',
  city: '',
  actionType: null,
  actionValue: '',
  actionLabel: '',
  workspaceId: null,
  published: false
};

export function readOnboarding(): OnboardingState | null {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    return raw ? { ...initialOnboarding, ...(JSON.parse(raw) as Partial<OnboardingState>) } : null;
  } catch {
    return null;
  }
}

/** Written synchronously so progress survives the remount that happens when a workspace is created. */
export function writeOnboarding(state: OnboardingState): void {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch {

    // Storage unavailable — progress lasts for this visit only.
  }}

export function clearOnboarding(): void {
  try {
    window.localStorage.removeItem(ONBOARDING_KEY);
  } catch {

    // Nothing to clear.
  }}

/** Unfinished onboarding that should show "Finish setting up". */
export function hasUnfinishedOnboarding(): boolean {
  const s = readOnboarding();
  return !!s && !s.workspaceId && (s.step > 0 || !!s.goal || !!s.name);
}

export function useOnboarding(initialKit: string | null) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = readOnboarding();
    const fresh = withClaim(initialKit ? { ...initialOnboarding, kitId: initialKit, step: 2 } : initialOnboarding);
    if (!saved) return fresh;
    // Just finished: stay on the share screen (the app remounts when the workspace is created).
    if (saved.workspaceId) return saved.step === 5 ? saved : fresh;
    // Unfinished: resume where they left off.
    return withClaim(initialKit ? { ...saved, kitId: initialKit, step: Math.max(saved.step, 2) } : saved);
  });

  // Once the workspace exists, the claimed handle is theirs for real.
  useEffect(() => {
    if (state.workspaceId) clearHandleClaim();
  }, [state.workspaceId]);

  useEffect(() => writeOnboarding(state), [state]);

  const update = useCallback((patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch })), []);
  const go = useCallback((step: number) => setState((s) => ({ ...s, step: Math.max(0, Math.min(5, step)) })), []);
  const restart = useCallback(() => {
    clearOnboarding();
    setState(initialOnboarding);
  }, []);

  return { state, update, go, restart };
}