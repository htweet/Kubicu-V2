import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { legacyModuleIds } from '../data/navigation';
import { NotFound } from './NotFound';

/** Sends addresses from before the workspace moved to /app to their new home. */
export function LegacyRedirect() {
  const { pageId, module } = useParams();
  if (pageId) return <Navigate to={`/app/canvas/${pageId}`} replace />;
  if (module && legacyModuleIds.includes(module)) return <Navigate to={`/app/${module}`} replace />;
  return <NotFound />;
}