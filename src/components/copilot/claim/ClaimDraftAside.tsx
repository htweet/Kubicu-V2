import React from 'react';
import type { CopilotDraft } from '../../../types/copilot';
import { TemplateThumb } from '../../templates/TemplateThumb';

/** The lime panel beside the claim steps shows the person's own draft, so it's clear what's moving. */
export function ClaimDraftAside({ draft }: {draft: CopilotDraft;}) {
  return (
    <>
      <p className="kb-display relative max-w-sm text-center text-[40px] leading-[0.98]">Your draft, ready to move in.</p>
      <div className="relative overflow-hidden rounded-[26px] border-[5px] border-[rgb(var(--kb-forest))] bg-[rgb(var(--kb-forest))] shadow-3">
        <TemplateThumb doc={draft.doc} width={240} height={480} />
      </div>
      <p className="relative text-caption font-semibold">
        {draft.doc.title} · {draft.themeName} · not published
      </p>
    </>);

}