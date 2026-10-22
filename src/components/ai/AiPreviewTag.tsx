import React from 'react';
import { SparklesIcon } from 'lucide-react';

/** Marks anything drafted by the simulated AI so it's never mistaken for the owner's own words. */
export function AiPreviewTag() {
  return (
    <span className="ai-fill inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-caption font-semibold text-white" title="Rule-based preview — no AI model is called in this prototype.">
      <SparklesIcon size={12} aria-hidden />
      AI preview
    </span>);

}