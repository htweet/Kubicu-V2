import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CopyIcon, ExternalLinkIcon, MessageCircleIcon, QrCodeIcon, InstagramIcon, CheckCircle2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { OnboardingState } from '../../hooks/useOnboarding';
import { publicUrl } from '../../utils/format';
import { Button } from '../ui/Button';
import { PlanLock } from '../ui/PlanLock';

interface ShareStepProps {
  state: OnboardingState;
  onDone: () => void;
}

async function copy(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast('Couldn’t copy automatically', { description: `Select and copy: ${text}` });
  }
}

export function ShareStep({ state, onDone }: ShareStepProps) {
  const navigate = useNavigate();
  const url = `https://${publicUrl(state.handle)}`;
  const shareText = `${state.name.trim()} — find everything here: ${url}`;

  return (
    <div className="mx-auto max-w-xl text-center">
      <CheckCircle2Icon size={36} className="mx-auto text-success" aria-hidden />
      <h1 className="mt-5 font-display text-[32px] font-semibold leading-tight tracking-[-0.025em] text-fg">Your page is live</h1>
      <p className="mt-3 text-body text-fg-muted">Share it where your customers already are. The first person who taps your button is your first visitor action.</p>

      <div className="mt-8 flex items-center gap-2 rounded-md border border-line-strong bg-raised p-2 pl-4 text-left">
        <span className="min-w-0 flex-1 truncate font-mono text-body text-fg">{publicUrl(state.handle)}</span>
        <Button leadingIcon={CopyIcon} onClick={() => copy(url, 'Link copied')}>
          Copy
        </Button>
      </div>
      <p className="mt-2 text-caption text-fg-subtle">Prototype: inside this preview your page opens at /p/{state.handle}. The kub.icu address isn’t live yet.</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button size="lg" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener')}>
          Share on WhatsApp
        </Button>
        <Button size="lg" variant="secondary" leadingIcon={InstagramIcon} onClick={() => copy(url, 'Copied — paste it into your Instagram bio')}>
          Copy for Instagram bio
        </Button>
        <Button size="lg" variant="secondary" leadingIcon={ExternalLinkIcon} onClick={() => navigate(`/p/${state.handle}`)}>
          View my page
        </Button>
        <div className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-line-strong text-label text-fg-muted">
          <QrCodeIcon size={16} aria-hidden /> QR code <PlanLock kind="planned">Batch 5</PlanLock>
        </div>
      </div>

      <p className="mt-6 text-label text-fg-muted">
        On your phone? Open <span className="font-mono text-fg">{publicUrl(state.handle)}</span> to see what visitors see.
      </p>

      <Button size="lg" className="mt-10" onClick={onDone}>
        Go to my workspace
      </Button>
    </div>);

}