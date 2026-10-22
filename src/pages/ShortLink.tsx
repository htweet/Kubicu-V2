import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkIcon } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { findShortLink, landingHref, spaceHandle } from '../utils/domains/links';
import { readDomains } from '../utils/domains/storage';
import { MAIN_SPACE_ID } from '../utils/spaces';
import { pageHref } from '../utils/sitePages';

/** kub.icu/{handle}/s/{slug}: a campaign link or QR scan lands on its destination, tagged for Analytics (D62). */
export function ShortLink() {
  const { handle = '', slug = '' } = useParams();
  const { workspaces } = useWorkspace();
  const hit = findShortLink(workspaces, handle, slug, readDomains);
  const target = hit && !hit.link.archivedAt ? landingHref(hit.workspace.id, hit.link) : null;
  if (target) return <Navigate to={target} replace />;
  const home = hit ? spaceHandle(hit.workspace.id, MAIN_SPACE_ID) : handle;
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F4EE] px-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAE4D8] text-[#6B6459]">
          <LinkIcon size={20} aria-hidden />
        </span>
        <h1 className="text-[20px] font-semibold text-[#1F1B16]">{hit ? 'This link has ended' : 'This link doesn’t exist'}</h1>
        <p className="text-[14px] text-[#6B6459]">{hit ? 'The owner stopped using this link or QR code.' : 'Check the address, or visit the page directly.'}</p>
        <Link to={pageHref(home ?? handle, '')} className="mt-2 inline-flex h-11 items-center rounded-full bg-[#1F1B16] px-5 text-[14px] font-semibold text-white">
          Go to kub.icu/{home ?? handle}
        </Link>
      </div>
    </main>);

}