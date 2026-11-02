import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NfcDestination, NfcTag } from '../../types/nfc';
import { useNfcTags } from '../../hooks/useNfcTags';
import { useT } from '../../contexts/LocaleContext';
import { tapPath, tapsSince } from '../../utils/nfc';
import { formatRelative } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { NfcDestinationFields, destinationValid } from './NfcDestinationFields';

/** Rename one tag and change where it points (D442). */
export function NfcTagSheet({ tag, onClose }: {tag: NfcTag | null;onClose: () => void;}) {
  const { t: tr } = useT();
  const { tags, update } = useNfcTags(tag?.workspaceId ?? '');
  const live = tag ? tags.find((t) => t.id === tag.id) ?? tag : null;
  const [label, setLabel] = useState('');
  const [dest, setDest] = useState<NfcDestination>({ type: 'page' });
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!tag) return;
    setLabel(tag.label);
    setDest(tag.destination);
    setTried(false);
  }, [tag]);

  if (!live) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const save = () => {
    setTried(true);
    if (!label.trim() || !destinationValid(dest)) return;
    if (update((list) => list.map((t) => t.id === live.id ? { ...t, label: label.trim().slice(0, 40), destination: dest } : t))) {
      toast.success(tr('Tag updated'), { description: tr('The next tap goes to the new place. Nothing to reprint.') });
      onClose();
    }
  };

  return (
    <Sheet
      open={!!tag}
      onClose={onClose}
      side="right"
      bodyClassName="px-5 py-6"
      title={live.label}
      description={tr('Total taps: {total} · This week: {week}', { total: live.taps.length, week: tapsSince(live, 7) })}
      footer={
      <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={save}>{tr('Save')}</Button>
        </div>
      }>
      
      <div className="flex flex-col gap-5">
        <TextInput id="nfc-label" label={tr('Name')} hint={tr('Where it is, so you can tell tags apart — e.g. Front counter, Rider Tunde.')} maxLength={40} value={label} error={tried && !label.trim() ? tr('Give it a name') : undefined} onChange={(e) => setLabel(e.target.value)} />
        <NfcDestinationFields id="nfc-edit" value={dest} onChange={setDest} tried={tried} />
        <div className="flex flex-col gap-1 rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
          <span>{tr('Written on the chip:')}</span>
          <code className="break-all font-mono text-fg">kub.icu{tapPath(live)}</code>
          {live.taps[0] ? <span>{tr('Last tap {when}', { when: formatRelative(live.taps[0]) })}</span> : null}
        </div>
      </div>
    </Sheet>);

}