import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AccountErrorCode, AccountFailure } from '../../types/accountMode';
import { InlineAlert } from '../ui/InlineAlert';
import { Button } from '../ui/Button';
import { useT } from '../../contexts/LocaleContext';

type Translate = (text: string, vars?: Record<string, string | number>) => string;

/** Shared wording for every account-mode failure (D531). `message` is the server's own refusal, when it sends one. */
export function accountErrorCopy(tr: Translate, f: Pick<AccountFailure, 'code' | 'message' | 'retryAfterSeconds'>): { title: string; body: string } {
  const copy: Record<AccountErrorCode, { title: string; body: string }> = {
    offline: { title: tr('You’re offline'), body: tr('Check your connection and try again. Nothing has changed.') },
    server_unavailable: { title: tr('Kubicu isn’t responding'), body: tr('Try again in a moment. Nothing has changed.') },
    rate_limited: { title: tr('Too many requests'), body: tr('Try again in about {n} seconds.', { n: f.retryAfterSeconds ?? 30 }) },
    lost_access: { title: tr('This workspace isn’t available to you any more'), body: tr('Someone may have removed you or archived it. Your other workspaces aren’t affected.') },
    session_ended: { title: tr('Your session ended'), body: tr('Sign in again to continue. You’ll come back here.') },
    no_seats: { title: tr('No seats left'), body: f.message ?? tr('Every seat is taken or invited.') },
    refused: { title: tr('That wasn’t allowed'), body: f.message ?? tr('Nothing has changed.') },
    conflict: { title: tr('Someone got there first'), body: f.message ?? tr('This changed while you were looking at it. Nothing else has changed.') },
    step_up_required: { title: tr('Confirm it’s you'), body: tr('For your security, confirm it’s you to continue.') },
    cancelled: { title: tr('Nothing changed'), body: tr('You cancelled before confirming.') },
    // Batch 2 (D549) — screens usually show their own wording; these are the fallbacks.
    queue_full: { title: tr('The queue is full'), body: f.message ?? tr('Try again when a run finishes. Nothing was charged.') },
    ai_off: { title: tr('AI is temporarily switched off'), body: tr('Nothing was charged. Try again later.') },
    approval_expired: { title: tr('This approval expired'), body: tr('Approvals expire after 48 hours, so the run stopped. Nothing else happened.') },
    already_decided: { title: tr('Already decided'), body: f.message ?? tr('Someone else decided first.') },
  };
  return copy[f.code];
}

interface AccountStateAlertProps {
  failure: Pick<AccountFailure, 'code' | 'message' | 'retryAfterSeconds'>;
  onRetry?: () => void;
  className?: string;
}

/** One reusable banner for offline, server down, rate limited, lost access and session ended (D531). */
export function AccountStateAlert({ failure, onRetry, className }: AccountStateAlertProps) {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, body } = accountErrorCopy(tr, failure);
  const tone = failure.code === 'lost_access' || failure.code === 'server_unavailable' || failure.code === 'refused' ? 'danger' : 'warning';
  const action =
    failure.code === 'lost_access' ? (
      <Button size="sm" variant="secondary" onClick={() => navigate('/app/account/workspaces')}>
        {tr('Go to your workspaces')}
      </Button>
    ) : failure.code === 'session_ended' ? (
      <Button size="sm" onClick={() => navigate(`/signin?next=${encodeURIComponent(location.pathname + location.search)}`)}>
        {tr('Sign in again')}
      </Button>
    ) : onRetry && (failure.code === 'offline' || failure.code === 'server_unavailable' || failure.code === 'rate_limited') ? (
      <Button size="sm" variant="secondary" onClick={onRetry}>
        {tr('Try again')}
      </Button>
    ) : undefined;
  return (
    <InlineAlert tone={tone} title={title} action={action} className={className}>
      {body}
    </InlineAlert>
  );
}

/** True for failures that replace the whole screen rather than one row. */
export function isScreenFailure(code: AccountErrorCode): boolean {
  return code === 'lost_access' || code === 'session_ended';
}

/** Saved toast — only call after the server confirmed the save. */
export function toastSaved(tr: Translate, description?: string): void {
  toast.success(tr('Saved'), description ? { description } : undefined);
}

/** Error toast for failures that don't have a place on screen. Cancelled shows nothing. */
export function toastFailure(tr: Translate, f: AccountFailure): void {
  if (f.code === 'cancelled') return;
  const { title, body } = accountErrorCopy(tr, f);
  toast.error(title, { description: body });
}
