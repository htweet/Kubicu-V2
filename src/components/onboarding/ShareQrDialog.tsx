import React, { useMemo, useState } from 'react';
import { DownloadIcon, PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { QrPreview } from '../domains/QrPreview';
import { downloadPng, downloadSvg, printSheet, styleOf } from '../../utils/domains/qr';
import { publicUrl } from '../../utils/format';

interface ShareQrDialogProps {
  open: boolean;
  onClose: () => void;
  handle: string;
  name: string;
}

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'K';

/** A ready-to-use QR code for the page just published. Scans are tagged as QR visits in Analytics. */
export function ShareQrDialog({ open, onClose, handle, name }: ShareQrDialogProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const address = publicUrl(handle);
  const url = `https://${address}?src=qr`;
  const style = useMemo(() => styleOf({ frameText: 'Scan to visit', frame: 'none', centreKind: 'initials' }, initialsOf(name)), [name]);
  const file = `${handle}-qr`;

  const png = async () => {
    if (!svg) return;
    try {
      await downloadPng(svg, file, 1024);
    } catch {
      toast.error('Couldn’t make the PNG', { description: 'Try the SVG download instead.' });
    }
  };

  const print = () => {
    if (svg && !printSheet(svg, 'card', name.trim() || address, address)) toast.error('Your browser blocked the print window', { description: 'Allow pop-ups for this site and try again.' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Your QR code"
      description="Put it on your counter, packaging or flyers. Anyone who scans it lands on your page."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="w-48 shrink-0 rounded-lg border border-line bg-white p-3">
          <QrPreview url={url} style={style} alt={`QR code that opens ${address}`} onReady={setSvg} />
        </div>
        <div className="flex w-full min-w-0 flex-col gap-4">
          <div>
            <p className="text-caption text-fg-subtle">Opens</p>
            <p className="truncate font-mono text-label text-fg">{address}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" leadingIcon={DownloadIcon} disabled={!svg} onClick={png}>
              Download PNG
            </Button>
            <Button variant="secondary" leadingIcon={DownloadIcon} disabled={!svg} onClick={() => svg && downloadSvg(svg, file)}>
              Download SVG (for printers)
            </Button>
            <Button variant="tertiary" leadingIcon={PrinterIcon} disabled={!svg} onClick={print}>
              Print an A6 card
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">Scans show as “QR code” visits in Analytics. To change colours, add your logo or see scans per code, open Domains &amp; QR from your workspace.</p>
        </div>
      </div>
    </Dialog>
  );
}
