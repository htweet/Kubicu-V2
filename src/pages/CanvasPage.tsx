import React, { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useEditor } from '../contexts/EditorContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { DesktopEditor } from '../components/canvas/DesktopEditor';
import { MobileEditor } from '../components/canvas/MobileEditor';
import { pageView } from '../utils/sitePages';
import { spaceForPageId } from '../utils/spaces';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { NotFound } from './NotFound';
import { CampaignPreviewProvider } from '../contexts/CampaignPreviewContext';
import { useCan } from '../contexts/TeamContext';
import { CanvasNoAccess } from '../components/canvas/CanvasNoAccess';
import { ReviewSync } from '../components/canvas/ReviewStatus';
import { PresenceProvider } from '../contexts/PresenceContext';
import { SiteKitLauncher } from '../components/canvas/SiteKitLauncher';
import { CopilotCanvasWelcome } from '../components/copilot/CopilotCanvasWelcome';

export function CanvasPage() {
  const { pageId } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useEditor();
  const { current, currentSpace, switchSpace } = useWorkspace();
  const editAllowed = useCan('pages.edit', currentSpace.id);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const blockParam = params.get('block');
  const pageParam = params.get('page');

  // Deep links (e.g. from Media → “Where it’s used”) open that page with the block selected.
  useEffect(() => {
    if (!blockParam && !pageParam) return;
    actions.setPage(pageParam);
    if (blockParam && pageView(state.site, pageParam).blocks.some((b) => b.id === blockParam)) actions.select(blockParam);
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockParam, pageParam]);

  // Workspace screens show the home page; leaving the canvas returns to it.
  useEffect(() => () => actions.setPage(null), [actions]);

  // A link to another space of this workspace (e.g. “Back to editor” from a campaign preview) opens that space.
  const otherSpace = pageId && pageId !== state.draft.id ? spaceForPageId(current, pageId) : null;
  const switchable = otherSpace && !otherSpace.archivedAt && otherSpace.id !== currentSpace.id ? otherSpace.id : null;
  useEffect(() => {
    if (switchable) switchSpace(switchable);
  }, [switchable, switchSpace]);
  if (switchable) return null;

  // A page from another workspace (e.g. after switching): open this workspace's page instead.
  if (pageId !== state.draft.id) return pageId?.startsWith('page_') ? <Navigate to={`/app/canvas/${state.draft.id}`} replace /> : <NotFound />;
  // Roles that can't edit (or can't edit this space) get a read-only door instead of the editor (D57).
  if (!editAllowed.allowed) return <CanvasNoAccess reason={editAllowed.reason} handle={state.draft.handle} title={currentSpace.name} />;
  return (
    <CampaignPreviewProvider>
      <PresenceProvider>
        <ReviewSync />
        <SiteKitLauncher />
        {isDesktop ? <DesktopEditor /> : <MobileEditor />}
        <CopilotCanvasWelcome pageId={state.draft.id} />
      </PresenceProvider>
    </CampaignPreviewProvider>
  );
}
