import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEditor } from '../contexts/EditorContext';

/** `/app/canvas` opens the current workspace's page. */
export function CanvasRedirect() {
  const { state } = useEditor();
  return <Navigate to={`/app/canvas/${state.draft.id}`} replace />;
}
