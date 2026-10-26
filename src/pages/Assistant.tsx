import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AssistantExampleDialog } from '../components/assistant/AssistantExampleDialog';
import { ArrowLeftIcon, BookOpenIcon, MessageSquareIcon, MonitorSmartphoneIcon, PauseCircleIcon, PenToolIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAssistant } from '../hooks/useAssistant';
import { useCan } from '../contexts/TeamContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { useFlag } from '../utils/admin/store';
import { AssistantChat } from '../components/assistant/AssistantChat';
import { AssistantPreview } from '../components/assistant/AssistantPreview';
import { AiPreviewTag } from '../components/ai/AiPreviewTag';
import { AiUsageMeter } from '../components/ai/AiUsageMeter';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { InlineAlert } from '../components/ui/InlineAlert';
import { cn } from '../utils/cn';

type MobileTab = 'chat' | 'preview';

/** Full-screen AI page assistant (D211): the conversation on the left, the page building live on the right. */
export function Assistant() {
  const navigate = useNavigate();
  const { currentSpace } = useWorkspace();
  const plan = usePlan();
  const can = useCan('pages.edit', currentSpace.id);
  const enabled = useFlag('ai_page_setup', plan.id);

  if (!enabled || !can.allowed) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-canvas p-6">
        <div className="max-w-md">
          <InlineAlert tone={enabled ? 'warning' : 'info'} title={enabled ? 'You can’t use the assistant here' : 'The AI assistant is paused'}>
            {enabled ? can.reason : `KUBICU has switched it off for ${plan.name} for now. Your page is unaffected.`}
          </InlineAlert>
          <Button className="mt-4" variant="secondary" leadingIcon={ArrowLeftIcon} onClick={() => navigate('/app')}>
            Back to your workspace
          </Button>
        </div>
      </main>);

  }
  return <AssistantWorkspace />;
}

function AssistantWorkspace() {
  const assistant = useAssistant();
  const { session, resumable, restart, preview, doc, undo } = assistant;
  const [tab, setTab] = useState<MobileTab>('chat');
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [showResume, setShowResume] = useState(resumable);

  const doRestart = () => {
    restart();
    setConfirmRestart(false);
    setShowResume(false);
    setTab('chat');
  };

  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showExample, setShowExample] = useState(false);

  // The builder fills the window; stop the page behind it from scrolling.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = prev;
    };
  }, []);
  const created = session.created ?? { productIds: [], serviceIds: [] };
  const removeList = [
  session.answers.mode === 'add' ? 'The sections it added, and any changes since' : 'The built page and any changes since — your page goes back to how it was',
  created.productIds.length ? `${created.productIds.length} product${created.productIds.length === 1 ? '' : 's'} in Commerce (any with orders are kept)` : '',
  created.serviceIds.length ? `${created.serviceIds.length} Bookings service${created.serviceIds.length === 1 ? '' : 's'} (any with bookings are kept)` : '',
  created.qrId ? 'The QR code and its campaign link' : '',
  session.savedTemplateId ? 'The layout saved in your templates' : ''].
  filter(Boolean);

  const doRemove = () => {
    const { kept } = assistant.removeEverything();
    setConfirmRemove(false);
    toast('Everything the assistant made was removed', { description: kept.length ? `Kept ${kept.join(' and ')}. Photos stay in Media.` : 'Photos stay in Media.' });
  };
  void undo;

  const navigate = useNavigate();
  const builtPage = session.applied && !session.removed && session.stage === 'done';
  const [confirmLeave, setConfirmLeave] = useState(false);
  const canvasPath = `/app/canvas/${session.pageId}`;
  // A change still waiting for Keep or Discard would be lost silently — ask first.
  const openCanvas = () => assistant.pending ? setConfirmLeave(true) : navigate(canvasPath);
  const leaveWith = (keep: boolean) => {
    const id = assistant.pending?.id;
    if (id) (keep ? assistant.keepChange : assistant.discardChange)(id);
    setConfirmLeave(false);
    navigate(canvasPath);
  };

  return (
    // Pinned to the window so nothing outside the builder can make the page scroll and cut off its bottom.
    <div className="fixed inset-0 z-10 flex w-full flex-col overflow-hidden bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-raised px-3 sm:px-4">
        <Link to="/app" className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <ArrowLeftIcon size={16} aria-hidden />
          <span className="hidden sm:inline">Workspace</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-label font-semibold text-fg">AI page assistant</h1>
          <AiPreviewTag />
        </div>
        <AiUsageMeter className="hidden w-48 md:flex" />
        <Button size="sm" variant="tertiary" leadingIcon={BookOpenIcon} onClick={() => setShowExample(true)}>
          <span className="hidden sm:inline">See an example</span>
          <span className="sr-only sm:hidden">See an example</span>
        </Button>
        <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} onClick={() => setConfirmRestart(true)} disabled={session.stage === 'building'}>
          <span className="hidden sm:inline">Start over</span>
          <span className="sr-only sm:hidden">Start over</span>
        </Button>
        {/* Always-visible way on to the canvas once the page is built, however far the chat has scrolled. */}
        {builtPage &&
        <Button size="sm" leadingIcon={PenToolIcon} onClick={openCanvas}>
            <span className="hidden sm:inline">Open in canvas</span>
            <span className="sm:hidden">Canvas</span>
          </Button>
        }
      </header>

      {/* Phones: Chat and Preview are tabs. */}
      <div role="tablist" aria-label="Assistant view" className="flex shrink-0 border-b border-line bg-raised lg:hidden">
        {(['chat', 'preview'] as MobileTab[]).map((t) =>
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={tab === t}
          onClick={() => setTab(t)}
          className={cn('flex h-11 flex-1 items-center justify-center gap-1.5 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus', tab === t ? 'text-fg shadow-[inset_0_-2px_0_rgb(var(--action))]' : 'text-fg-muted')}>
          
            {t === 'chat' ? <MessageSquareIcon size={15} aria-hidden /> : <MonitorSmartphoneIcon size={15} aria-hidden />}
            {t === 'chat' ? 'Chat' : 'Preview'}
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={cn('min-h-0 w-full flex-col border-line bg-raised lg:flex lg:w-[440px] lg:shrink-0 lg:border-r', tab === 'chat' ? 'flex' : 'hidden')}>
          {showResume && session.stage !== 'done' &&
          <div className="flex shrink-0 items-center gap-3 border-b border-line bg-action-soft px-4 py-2.5">
              <PauseCircleIcon size={16} className="shrink-0 text-action" aria-hidden />
              <p className="min-w-0 flex-1 text-caption text-fg">Continuing where you left off.</p>
              <button type="button" className="text-caption font-semibold text-action hover:underline" onClick={() => setShowResume(false)}>
                OK
              </button>
              <button type="button" className="text-caption font-medium text-fg-muted hover:underline" onClick={doRestart}>
                Start fresh
              </button>
            </div>
          }
          <AssistantChat assistant={assistant} onRestart={() => setConfirmRestart(true)} onUndo={() => setConfirmRemove(true)} />
          {tab === 'chat' && (session.stage === 'plan' || session.stage === 'building' || !!assistant.pending) &&
          <button type="button" onClick={() => setTab('preview')} className="mx-4 mb-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-sunken text-caption font-semibold text-fg lg:hidden">
              <MonitorSmartphoneIcon size={14} aria-hidden /> See preview
            </button>
          }
        </div>
        <div className={cn('min-h-0 min-w-0 flex-1 flex-col lg:flex', tab === 'preview' ? 'flex' : 'hidden')}>
          <AssistantPreview
            session={session}
            doc={doc}
            blocks={preview.blocks}
            theme={preview.theme}
            label={preview.label}
            before={assistant.beforeChange}
            highlightId={assistant.pending?.focusId ?? session.focusId}
            onPickSection={
            session.stage === 'done' && !session.removed && !assistant.pending ?
            (id) => {
              assistant.focusSection(id);
              setTab('chat');
            } :
            undefined
            } />
          
        </div>
      </div>

      <Dialog
        open={confirmRestart}
        onClose={() => setConfirmRestart(false)}
        size="sm"
        title="Start a new conversation?"
        description={session.applied ? 'Your page keeps what was built. The conversation and plan are cleared.' : 'The conversation and plan are cleared. Your page hasn’t changed. Photos you added stay in Media.'}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmRestart(false)}>
              Keep going
            </Button>
            <Button onClick={doRestart}>Start over</Button>
          </>
        } />
      

      <Dialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        size="sm"
        title="Remove everything the assistant made?"
        description="This is one step, and you can rebuild any time by starting over."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmRemove(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={doRemove}>
              Remove everything
            </Button>
          </>
        }>
        
        <ul className="flex flex-col gap-1.5 text-label text-fg">
          {removeList.map((r) =>
          <li key={r}>· {r}</li>
          )}
        </ul>
        <p className="mt-3 text-caption text-fg-muted">Photos you added stay in Media. AI credits already used aren’t returned.</p>
      </Dialog>
      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        size="sm"
        title="Keep the last change before opening the canvas?"
        description={assistant.pending ? `“${assistant.pending.summary}” is still waiting for Keep or Discard. Kept changes go on your page; discarded ones don’t.` : ''}
        footer={
        <>
            <Button variant="secondary" onClick={() => leaveWith(false)}>
              Discard and open
            </Button>
            <Button onClick={() => leaveWith(true)}>Keep and open</Button>
          </>
        } />
      
      <AssistantExampleDialog open={showExample} onClose={() => setShowExample(false)} />
    </div>);

}