import React, { useEffect, useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { findExampleById } from '../../data/examples';
import { analyzeBrief, MIN_BRIEF, pitchFrom, type BriefAnalysis } from '../../utils/ai/brief';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { TemplateThumb } from '../templates/TemplateThumb';
import { AiPreviewTag } from '../ai/AiPreviewTag';

interface Props {
  open: boolean;
  onClose: () => void;
  onUse: (patch: {kitId: string;bio: string;name?: string;city?: string;}) => void;
}

/** During sign-up: a short brief picks the closest starter and fills the pitch with the owner's own words (D63). */
export function AiKitDialog({ open, onClose, onUse }: Props) {
  const [brief, setBrief] = useState('');
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<BriefAnalysis | null>(null);

  useEffect(() => {
    if (open) {
      setTried(false);
      setResult(null);
    }
  }, [open]);

  const error = brief.trim().length < MIN_BRIEF ? `A little more, please — at least ${MIN_BRIEF} characters.` : undefined;
  const example = result?.exampleId ? findExampleById(result.exampleId) : undefined;

  const read = () => {
    setTried(true);
    if (!error) setResult(analyzeBrief(brief));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Describe your business"
      description={
      <span className="flex flex-wrap items-center gap-2">
          <AiPreviewTag />
          <span>We’ll pick the closest starter. Free during setup.</span>
        </span>
      }
      footer={
      result ?
      <>
            <Button variant="secondary" onClick={() => setResult(null)}>
              Edit description
            </Button>
            {example ?
        <Button variant="ai" onClick={() => onUse({ kitId: example.id, bio: pitchFrom(brief), name: result.name || undefined, city: result.city || undefined })}>Use this starter</Button> :

        <Button onClick={onClose}>Pick one myself</Button>
        }
          </> :

      <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="ai" leadingIcon={SparklesIcon} onClick={read}>
              Find my starter
            </Button>
          </>

      }>
      
      {!result ?
      <TextArea
        id="ob-ai-brief"
        label="About your business"
        rows={5}
        data-autofocus
        placeholder="We bake custom birthday cakes and small chops in Surulere, Lagos. Orders come in on WhatsApp."
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        error={tried ? error : undefined} /> :

      example ?
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <TemplateThumb doc={example.doc} width={130} height={190} />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-label font-semibold text-fg">{example.category} starter</p>
            <p className="text-label text-fg-muted">Because you mentioned {result.matched.slice(0, 3).map((w) => `“${w}”`).join(', ')}.</p>
            <p className="text-caption text-fg-subtle">Your pitch: “{pitchFrom(brief)}”</p>
            {result.name && <p className="text-caption text-fg-subtle">Name: {result.name}</p>}
            {result.city && <p className="text-caption text-fg-subtle">Location: {result.city}</p>}
            <p className="text-caption text-fg-subtle">The example’s prices, links and quotes are removed — you add your own next.</p>
          </div>
        </div> :

      <p className="text-label text-fg-muted">We couldn’t tell which starter fits from that description. Pick one from the list — or try mentioning what you sell or offer.</p>
      }
    </Dialog>);

}