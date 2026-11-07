import React, { useState } from 'react';
import { MonitorIcon, SmartphoneIcon } from 'lucide-react';
import type { PageDocument } from '../../types/page';
import type { SignatureTheme } from '../../data/signatureThemes';
import { signatureTheme } from '../../data/signatureThemes';
import { useT } from '../../contexts/LocaleContext';
import { Sheet } from '../ui/Sheet';
import { Segmented } from '../ui/Segmented';
import { TemplateLivePreview } from '../templates/TemplateLivePreview';
import { cn } from '../../utils/cn';

interface ThemeCompareSheetProps {
  open: boolean;
  onClose: () => void;
  themes: SignatureTheme[];
  doc: PageDocument;
}

/** Up to three themes side by side on the same page (D164). Only the look differs. Translated in D337. */
export function ThemeCompareSheet({ open, onClose, themes, doc }: ThemeCompareSheetProps) {
  const { t: tr } = useT();
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      height="full"
      title={tr('Compare themes')}
      description={tr('Same page, same content — only the theme changes.')}
      headerActions={
        <Segmented<'phone' | 'desktop'>
          ariaLabel={tr('Preview size')}
          size="sm"
          value={device}
          onChange={setDevice}
          options={[
            { value: 'phone', label: tr('Phone'), icon: SmartphoneIcon },
            { value: 'desktop', label: tr('Desktop'), icon: MonitorIcon },
          ]}
        />
      }
    >
      <div className={cn('grid gap-6 pb-6', device === 'phone' ? 'md:grid-cols-3' : 'grid-cols-1')}>
        {themes.map((t) => (
          <figure key={t.id} className="min-w-0">
            <TemplateLivePreview doc={doc} plan="pro" device={device} theme={signatureTheme(t)} name={t.name} height={device === 'phone' ? 640 : 560} />
            <figcaption className="mt-3 text-center text-label font-semibold text-fg">{t.name}</figcaption>
          </figure>
        ))}
      </div>
    </Sheet>
  );
}
