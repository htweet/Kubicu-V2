import React, { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useEditor } from '../contexts/EditorContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { DesktopEditor } from '../components/canvas/DesktopEditor';
import { MobileEditor } from '../components/canvas/MobileEditor';
import { pageView } from '../utils/sitePages';
import { NotFound } from './NotFound';

export function CanvasPage() {
  const { pageId } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useEditor();
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

  // A page from another workspace (e.g. after switching): open this workspace's page instead.
  if (pageId !== state.draft.id) return pageId?.startsWith('page_') ? <Navigate to={`/app/canvas/${state.draft.id}`} replace /> : <NotFound />;
  return isDesktop ? <DesktopEditor /> : <MobileEditor />;
}