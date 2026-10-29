import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRightIcon, ShieldCheckIcon, UserPlusIcon, LogInIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BackButton } from '../../components/shell/BackButton';
import { ClaimDraftAside } from '../../components/copilot/claim/ClaimDraftAside';
import { ClaimNewAccount } from '../../components/copilot/claim/ClaimNewAccount';
import { ClaimExisting } from '../../components/copilot/claim/ClaimExisting';
import { useCopilotSim } from '../../contexts/CopilotSimContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { readSession } from '../../utils/copilot/store';
import { chatPathFor, previewPath } from '../../utils/copilot/links';
import { CLAIM_MINUTES, claimStatus, markClaimed, updateClaim, writeCopilotWelcome, type ClaimStatus, type ClaimStep, type PendingClaim } from '../../utils/copilot/claim';
import { slugifyHandle } from '../../utils/handles';

const titles: Record<ClaimStep, {title: string;description: string;}> = {
  choose: { title: 'Continue with your draft', description: 'It moves into KUBICU as a normal page you can edit. Nothing is published.' },
  signup: { title: 'Create your account', description: 'Free to start. Your draft is waiting on the other side.' },
  verify: { title: 'Confirm your email', description: 'One quick check that this email is yours.' },
  setup: { title: 'Almost there', description: 'A short setup, already filled in from your chat.' },
  signin: { title: 'Sign in to continue', description: 'Then choose where your draft goes.' },
  workspace: { title: 'Choose a workspace', description: 'Your draft is added as a new space — nothing you already have changes.' }
};

/**
 * /copilot/continue — claiming a Copilot draft (D264). Reached only from the chat that made the draft,
 * which holds its one-time code; the code is never in the URL. Interrupted claims resume at the same step.
 */
export function CopilotContinue() {
  const sim = useCopilotSim();
  const [version, setVersion] = useState(0);
  const status = claimStatus(sim.failure === 'expiredLink');
  void version;

  useEffect(() => {
    document.title = 'Continue your draft — KUBICU';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  if (status.kind !== 'ok') return <ClaimProblem status={status} />;
  return <ClaimFlow draft={status.draft} pending={status.pending} failFirst={sim.failure === 'signIn'} onChange={() => setVersion((v) => v + 1)} />;
}

function ClaimFlow({ draft, pending, failFirst, onChange }: {draft: Extract<ClaimStatus, {kind: 'ok';}>['draft'];pending: PendingClaim;failFirst: boolean;onChange: () => void;}) {
  const navigate = useNavigate();
  const { create, createSpace, switchSpace, current } = useWorkspace();
  const session = readSession(draft.sessionId);
  const step = pending.step;
  // Setup reached from sign-in (choosing "a new workspace") goes back to the workspace list.
  const [setupFrom, setSetupFrom] = useState<ClaimStep>(pending.email && !pending.name ? 'workspace' : 'verify');

  const go = (next: ClaimStep, patch?: Partial<PendingClaim>) => {
    if (next === 'setup') setSetupFrom(step === 'workspace' ? 'workspace' : 'verify');
    updateClaim({ ...patch, step: next });
    onChange();
    window.scrollTo({ top: 0 });
  };

  const welcome = (pageId: string, asSpace: boolean) => writeCopilotWelcome({ pageId, title: draft.doc.title, gaps: draft.brief.gaps, asSpace });

  const finishNew = ({ workspaceName, ownerName, whatsapp }: {workspaceName: string;ownerName: string;whatsapp: string;}) => {
    try {
      const doc = { ...draft.doc, handle: slugifyHandle(workspaceName) || 'my-page' };
      const ws = create({ name: workspaceName, ownerName: ownerName || current.ownerName, doc, publish: false, whatsapp });
      markClaimed(draft.id, { workspaceId: ws.id, pageId: ws.pageId, at: new Date().toISOString() });
      welcome(ws.pageId, false);
      navigate(`/app/canvas/${ws.pageId}`);
    } catch {
      toast.error('Couldn’t save your draft', { description: 'Your browser storage is full or blocked. Free some space and try again — your draft is still here.' });
    }
  };

  const finishSpace = () => {
    try {
      const handle = `${slugifyHandle(draft.doc.title) || 'page'}-${Math.random().toString(36).slice(2, 5)}`;
      const space = createSpace({
        kind: 'page',
        name: draft.doc.title,
        buildDoc: ({ pageId }) => ({ ...draft.doc, id: pageId, handle, updatedAt: new Date().toISOString() })
      });
      const pageId = `page_${current.id}_${space.id}`;
      markClaimed(draft.id, { workspaceId: current.id, spaceId: space.id, pageId, at: new Date().toISOString() });
      welcome(pageId, true);
      switchSpace(space.id);
      navigate('/app/canvas');
    } catch {
      toast.error('Couldn’t add your draft', { description: 'Your browser storage is full or blocked. Free some space and try again — your draft is still here.' });
    }
  };

  const copy = titles[step];
  const chatPath = session ? chatPathFor(session.channel) : '/copilot/chat';
  const previous: Partial<Record<ClaimStep, ClaimStep>> = { signup: 'choose', verify: 'signup', setup: setupFrom, signin: 'choose', workspace: 'signin' };
  const prevStep = previous[step];
  const back = prevStep ? <BackButton fallback={chatPath} onClick={() => go(prevStep)} /> : <BackButton fallback={chatPath} label="Back to chat" onClick={() => navigate(chatPath)} />;
  return (
    <AuthLayout back={back} title={copy.title} description={copy.description} aside={<ClaimDraftAside draft={draft} />} footer={step === 'choose' ? <ChooseFooter draftId={draft.id} chatPath={session ? chatPathFor(session.channel) : null} /> : undefined}>
      {step === 'choose' && <ChooseStep title={draft.doc.title} gaps={draft.brief.gaps.length} onStep={go} />}
      {(step === 'signup' || step === 'verify' || step === 'setup') &&
      <ClaimNewAccount step={step} pending={pending} draft={draft} chatPhone={session?.answers.phone ?? ''} failFirst={failFirst} onStep={go} onFinish={finishNew} backTo={setupFrom} />
      }
      {(step === 'signin' || step === 'workspace') && <ClaimExisting step={step} pending={pending} failFirst={failFirst} onStep={go} onAddSpace={finishSpace} title={draft.doc.title} />}
    </AuthLayout>);

}

function ChooseStep({ title, gaps, onStep }: {title: string;gaps: number;onStep: (s: ClaimStep) => void;}) {
  const option = 'flex min-h-[64px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';
  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 rounded-lg border border-line bg-raised px-3.5 py-3 lg:hidden">
        <p className="truncate text-label font-semibold text-fg">{title}</p>
        <p className="text-caption text-fg-muted">
          Draft · not published{gaps ? ` · ${gaps} detail${gaps === 1 ? '' : 's'} to fill in` : ''}
        </p>
      </div>
      <button type="button" onClick={() => onStep('signup')} className={`${option} border-fg bg-raised hover:bg-sunken`}>
        <UserPlusIcon size={20} className="shrink-0 text-fg" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-label font-semibold text-fg">I’m new to KUBICU</span>
          <span className="block text-caption text-fg-muted">Create a free account. Your draft becomes your main page.</span>
        </span>
        <ArrowRightIcon size={16} className="shrink-0 text-fg-muted" aria-hidden />
      </button>
      <button type="button" onClick={() => onStep('signin')} className={`${option} border-line hover:border-line-strong hover:bg-sunken`}>
        <LogInIcon size={20} className="shrink-0 text-fg" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-label font-semibold text-fg">I already have an account</span>
          <span className="block text-caption text-fg-muted">Sign in and add it to a workspace as a new space.</span>
        </span>
        <ArrowRightIcon size={16} className="shrink-0 text-fg-muted" aria-hidden />
      </button>
      <p className="mt-3 flex items-start gap-2 text-caption text-fg-subtle">
        <ShieldCheckIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
        This continue link came from your chat and works once, for {CLAIM_MINUTES} minutes. The preview link you may have shared only lets people look — it can’t be used to take your draft.
      </p>
    </div>);

}

function ChooseFooter({ draftId, chatPath }: {draftId: string;chatPath: string | null;}) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      <Link to={previewPath(draftId)} className="font-semibold text-fg underline-offset-2 hover:underline">
        See the preview again
      </Link>
      {chatPath &&
      <Link to={chatPath} className="font-semibold text-fg underline-offset-2 hover:underline">
          Back to the chat
        </Link>
      }
    </span>);

}

/** Every way a continue link can't go ahead — each with a way forward. */
function ClaimProblem({ status }: {status: Exclude<ClaimStatus, {kind: 'ok';}>;}) {
  const navigate = useNavigate();
  const { workspaces, switchTo } = useWorkspace();
  const draft = 'draft' in status ? status.draft : null;
  const session = draft ? readSession(draft.sessionId) : null;
  const chatPath = session ? chatPathFor(session.channel) : '/copilot/chat';

  let title = 'Nothing to continue here';
  let body: React.ReactNode = 'Continue links are made by the Copilot chat that built a draft. Open your chat and tap “Continue to KUBICU”.';
  let primary: React.ReactNode =
  <PrimaryLink to="/copilot">About Copilot</PrimaryLink>;


  if (status.kind === 'missing') {
    title = 'This draft is no longer available';
    body = 'It may have been deleted, or the link is incomplete. Your chat still has your answers if you’d like to make it again.';
    primary = <PrimaryLink to={chatPath}>Back to the chat</PrimaryLink>;
  } else if (status.kind === 'expired') {
    title = status.reason === 'link' ? 'This continue link has expired' : 'This draft has expired';
    body =
    status.reason === 'link' ?
    `Continue links work for ${CLAIM_MINUTES} minutes. Your draft is fine — tap “Continue to KUBICU” in your chat for a fresh link.` :
    'Drafts that aren’t continued are deleted after 7 days. Your answers are still in the chat — ask Copilot to make the draft again.';
    primary = <PrimaryLink to={chatPath}>Return to your chat</PrimaryLink>;
  } else if (status.kind === 'invalid') {
    title = 'This continue link doesn’t match';
    body = 'It wasn’t made for this draft, so it can’t be used. Tap “Continue to KUBICU” in the chat that made the draft.';
    primary = <PrimaryLink to={chatPath}>Back to the chat</PrimaryLink>;
  } else if (status.kind === 'claimed') {
    const claimed = status.draft.claimed!;
    const mine = workspaces.find((w) => w.id === claimed.workspaceId);
    title = 'This draft is already in KUBICU';
    body = mine ?
    `It was added to ${mine.name}. A draft can only be continued once, so open it there.` :
    'It was continued into a KUBICU account. A draft can only be claimed once — if that wasn’t you, start a new draft.';
    if (mine) {
      primary =
      <button
        type="button"
        onClick={() => {
          switchTo(mine.id, claimed.spaceId);
          navigate(claimed.spaceId ? '/app/canvas' : `/app/canvas/${claimed.pageId}`);
        }}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-label font-semibold text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
          Open it in KUBICU <ArrowRightIcon size={16} aria-hidden />
        </button>;

    }
  }

  return (
    <AuthLayout back={<BackButton fallback="/copilot" />} title={title} description={body} aside={draft ? <ClaimDraftAside draft={draft} /> : undefined}>
      <div className="flex flex-col gap-3 sm:flex-row">
        {primary}
        <Link to="/copilot/chat" className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-6 text-label font-semibold text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          Start a new draft
        </Link>
      </div>
    </AuthLayout>);

}

function PrimaryLink({ to, children }: {to: string;children: React.ReactNode;}) {
  return (
    <Link to={to} className="inline-flex h-12 items-center justify-center rounded-full bg-action px-6 text-label font-semibold text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      {children}
    </Link>);

}