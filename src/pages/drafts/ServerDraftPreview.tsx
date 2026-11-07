import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, CircleDashedIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useImports } from '../../contexts/ImportsContext';
import { editorStorageKey } from '../../utils/workspaceStorage';
import { spaceStorageId } from '../../utils/spaces';
import { markSynced, rememberServerSpace } from '../../utils/serverSpaces';
import type { PersistedPage } from '../../types/workspace';
import { RenderPlanProvider } from '../../contexts/RenderPlanContext';
import { PageSurface } from '../../components/blocks/PageSurface';
import { PageLayoutView } from '../../components/blocks/PageLayoutView';
import { PlatformLook } from '../../components/marketing/PlatformLook';
import { KubicuLogo } from '../../components/shell/KubicuLogo';
import { BackButton } from '../../components/shell/BackButton';
import { plans } from '../../data/plans';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { realAuthEnabled } from '../../utils/auth/realAuth';
import { api } from '../../utils/auth/session';
import { documentFromDraft, handleFromTitle, type ServerPageDraft } from '../../utils/pageDraft';
import type { PageDocument } from '../../types/page';

type State =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'error' }
  | { kind: 'ready'; draft: ServerPageDraft; doc: PageDocument };

/**
 * /app/drafts/:wsId/:draftId — the private preview of a page draft an agent saved on the server (P6). Signed-in
 * members with page editing only (the API decides). The page exactly as visitors would see it, rendered by the same
 * renderer and bar as the Copilot draft preview (D263). Not listed by search engines; viewing only, never editing.
 */
export function ServerDraftPreview() {
  const { wsId = '', draftId = '' } = useParams();
  const wide = useMediaQuery('(min-width: 768px)');
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [gapsOpen, setGapsOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const navigate = useNavigate();
  const { workspaces, switchTo, addAccountSpace } = useWorkspace();
  const imports = useImports();
  // The browser workspace linked to the draft's account workspace, if it is in this browser.
  const linkedLocal = imports?.imports.find((i) => i.workspaceId === wsId && i.mode === 'primary' && i.status === 'completed')?.legacyWorkspaceId;
  const localWorkspace = linkedLocal && workspaces.some((w) => w.id === linkedLocal) ? linkedLocal : null;

  useEffect(() => {
    if (!realAuthEnabled()) {
      setState({ kind: 'missing' });
      return;
    }
    let live = true;
    api<{ draft: ServerPageDraft }>('GET', `/v1/workspaces/${encodeURIComponent(wsId)}/page-drafts/${encodeURIComponent(draftId)}`).then(
      ({ draft }) => {
        if (!live) return;
        const doc = documentFromDraft(draft);
        setState(doc ? { kind: 'ready', draft, doc } : { kind: 'missing' });
      },
      (error: { status?: number }) => {
        if (!live) return;
        setState(error.status === 404 || error.status === 403 ? { kind: 'missing' } : { kind: 'error' });
      }
    );
    return () => {
      live = false;
    };
  }, [wsId, draftId]);

  useEffect(() => {
    const previous = document.title;
    document.title = state.kind === 'ready' ? `${state.doc.title} — draft preview` : 'Draft preview — KUBICU';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      robots.remove();
      document.title = previous;
    };
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <PlatformLook night>
        <main className="flex min-h-[100dvh] w-full items-center justify-center bg-canvas" aria-busy="true">
          <p className="text-body text-fg-muted">Loading the draft…</p>
        </main>
      </PlatformLook>);
  }
  if (state.kind !== 'ready') return <PreviewState kind={state.kind} />;

  const { draft, doc } = state;
  const gaps = draft.spec.missingInformation;

  /** Server page store S3: the draft becomes a new space in the account and in this browser, then opens in the Canvas. */
  const openInCanvas = async (): Promise<void> => {
    if (!localWorkspace) return;
    setOpening(true);
    try {
      const pageDoc = documentFromDraft(draft, { pageId: `page_${localWorkspace}_d${draft.id.slice(0, 8)}`, handle: handleFromTitle(draft.title) });
      if (!pageDoc) throw new Error('unknown draft');
      const page: PersistedPage = { draft: pageDoc, published: null, publishedAt: null, versions: [], lastSavedAt: null, scheduled: null };
      const made = await api<{ space: { id: string; createdAt: string }; revision: number }>('POST', `/v1/workspaces/${encodeURIComponent(wsId)}/spaces`, { kind: 'page', name: draft.title, page, fromDraftId: draft.id });
      const space = addAccountSpace(localWorkspace, { kind: 'page', name: draft.title, createdAt: made.space.createdAt, page });
      rememberServerSpace(localWorkspace, space.id, made.space.id);
      markSynced(editorStorageKey(spaceStorageId(localWorkspace, space.id)), wsId, made.space.id, made.revision);
      switchTo(localWorkspace, space.id);
      navigate('/app/canvas');
    } catch {
      toast.error('Couldn’t open the draft', { description: 'Nothing was changed. Try again in a moment.' });
      setOpening(false);
    }
  };
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);

  return (
    <PlatformLook night>
      <div className="min-h-[100dvh] w-full" style={{ background: doc.theme.background }}>
        <div className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 sm:gap-3 md:px-6">
            <BackButton fallback="/app" compact />
            <KubicuLogo withWordmark={wide} />
            <p className="min-w-0 flex-1 truncate text-caption text-fg-muted">
              <span className="font-semibold text-fg">Draft preview</span>
              <span className="hidden sm:inline"> · not published</span>
              <span className="hidden md:inline"> · version {draft.version}</span>
            </p>
            {gaps.length > 0 &&
            <button
              type="button"
              aria-expanded={gapsOpen}
              aria-controls="draft-gaps"
              onClick={() => setGapsOpen((o) => !o)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <CircleDashedIcon size={14} aria-hidden /> {gaps.length} to fill in
              </button>
            }
            {localWorkspace &&
            <button
              type="button"
              disabled={opening}
              aria-label="Open in Canvas"
              onClick={() => void openInCanvas()}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-action px-4 text-label font-semibold text-action-fg transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Open<span className="hidden sm:inline"> in Canvas</span> <ArrowRightIcon size={15} aria-hidden />
              </button>
            }
          </div>
          {gapsOpen &&
          <div id="draft-gaps" className="border-t border-line">
              <div className="mx-auto w-full max-w-6xl px-3 py-3 md:px-6">
                <p className="text-label font-semibold text-fg">Still to fill in before publishing</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {gaps.map((g) =>
                <li key={g.field} className="flex items-start gap-2 text-caption text-fg-muted">
                      <CircleDashedIcon size={12} className="mt-0.5 shrink-0" aria-hidden /> {g.reason}
                    </li>
                )}
                </ul>
                <p className="mt-2 text-caption text-fg-subtle">Copilot never makes these up — they stay marked on the page until you add them.</p>
              </div>
            </div>
          }
        </div>

        <main aria-label={`Draft of ${doc.title}`}>
          <RenderPlanProvider plan={plans.creator}>
            <PageSurface theme={doc.theme} fluid>
              <PageLayoutView doc={doc} blocks={visible} theme={doc.theme} mode="live" wide={wide} />
            </PageSurface>
          </RenderPlanProvider>
        </main>
      </div>
    </PlatformLook>);
}

function PreviewState({ kind }: {kind: 'missing' | 'error';}) {
  return (
    <PlatformLook night>
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-canvas px-5 py-16 text-center">
        <KubicuLogo />
        <h1 className="mt-10 max-w-md text-[28px] font-bold leading-tight text-fg">{kind === 'error' ? 'This preview couldn’t load' : 'This preview isn’t available'}</h1>
        <p className="mt-3 max-w-md text-body text-fg-muted">
          {kind === 'error' ?
          'Something went wrong on our side. Try again in a moment.' :
          'The link may be incomplete, the draft was deleted, or you don’t have access to it. Previews only show a draft — they never let anyone edit it.'}
        </p>
        <div className="mt-8">
          <Link to="/app" className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-6 text-label font-semibold text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Back to KUBICU
          </Link>
        </div>
      </main>
    </PlatformLook>);
}
