import React, { useEffect, useMemo, useState } from 'react';
import { CopyIcon, DownloadIcon, Loader2Icon, MessageCircleIcon, Share2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { TrustLevel } from '../../utils/trustPassport';
import { cardFileName, renderTrustCard } from '../../utils/trustCardImage';
import { whatsappLink } from '../../utils/format';
import { Button } from '../ui/Button';
import { ConsentCheck } from '../kyc/ConsentCheck';

interface TrustCardShareProps {
  business: string;
  level: TrustLevel;
  score: number;
  signals: string[];
  /** Public passport page. */
  url: string;
  /** Plain-text version sent alongside the image. */
  summary: string;
  /** The live page isn't published, so the link and QR won't open yet. */
  unpublished: boolean;
}

/**
 * Share the Trust Passport as an image card (D253). Phones get the system share sheet with the image attached
 * (WhatsApp chats and Status, Instagram…); elsewhere the image downloads and WhatsApp opens with the text and link.
 */
export function TrustCardShare({ business, level, score, signals, url, summary, unpublished }: TrustCardShareProps) {
  // The score is on by default and takes the card's open space (D272); owners can still turn it off.
  const [showScore, setShowScore] = useState(true);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => (blob ? URL.createObjectURL(blob) : ''), [blob]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const key = `${business}|${level}|${score}|${showScore}|${signals.join('|')}|${url}`;
  useEffect(() => {
    let alive = true;
    setFailed(false);
    renderTrustCard({ business, level, score, showScore, signals, url, generatedAt: new Date() })
      .then((b) => alive && setBlob(b))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const text = showScore ? summary : summary.replace(/ \(\d+\/100\)/, '');
  const file = blob ? new File([blob], cardFileName(business), { type: 'image/png' }) : null;
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  const download = () => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = cardFileName(business);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await navigator.share({ files: [file], text, title: `${business} · Trust Passport` });
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') toast.error('Couldn’t open sharing', { description: 'Download the image and send it yourself instead.' });
    } finally {
      setBusy(false);
    }
  };

  const downloadAndWhatsApp = () => {
    download();
    window.open(whatsappLink('', text), '_blank', 'noopener');
    toast('Image saved', { description: 'WhatsApp opened with the text and link — attach the saved image in the chat.' });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Passport text copied');
    } catch {
      toast.error('Couldn’t copy. Select the text and copy it instead.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-line bg-sunken">
        {preview ? (
          <img src={preview} alt={`Trust Passport card for ${business}: ${showScore ? `${score} out of 100, ` : ''}${signals.length} checks met, with a QR code to the live passport.`} className="block aspect-[4/5] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center px-6 text-center text-caption text-fg-muted" role="status">
            {failed ? 'The card couldn’t be drawn on this device. You can still share the text and link.' : 'Drawing your card…'}
          </div>
        )}
      </div>

      <div>
        <ConsentCheck id="tp-card-score" checked={showScore} onChange={setShowScore} label="Show my score on the card" />
        {!showScore && <p className="ml-9 text-caption text-fg-subtle">Only your level and the checks you’ve met are shown.</p>}
      </div>

      {unpublished && <p className="text-caption text-warning">Publish your page so the QR code and link open your live passport.</p>}

      <div className="flex flex-wrap gap-2">
        {canShareFile ? (
          <Button size="sm" leadingIcon={busy ? Loader2Icon : Share2Icon} onClick={share} disabled={busy}>
            Share image
          </Button>
        ) : (
          <Button size="sm" leadingIcon={MessageCircleIcon} onClick={downloadAndWhatsApp} disabled={!blob}>
            Save image & open WhatsApp
          </Button>
        )}
        <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={download} disabled={!blob}>
          Download
        </Button>
        <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={copy}>
          Copy text
        </Button>
      </div>
      <p className="text-caption text-fg-subtle">
        {canShareFile ? 'Opens your phone’s share menu — pick WhatsApp, Status or any app. The text and link go with the image.' : 'WhatsApp on a computer can’t receive images from a link, so the image saves and you attach it in the chat.'} The QR code opens your live passport, so buyers can check the card is real.
      </p>
    </div>
  );
}
