import { useMemo, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useEditor } from '../contexts/EditorContext';
import { useT } from '../contexts/LocaleContext';
import { layerName } from '../utils/blocks';
import { announce } from '../utils/announce';
import { blocksToCopy, clipboardSnapshot, readClipboard, subscribeClipboard, writeClipboard } from '../utils/blockClipboard';

/**
 * Copy and paste blocks on the canvas (D515, D516). Shared by the keyboard shortcuts and the block toolbar so
 * both behave the same: copy says what was copied; paste lands inside the selected container when it fits,
 * otherwise below the selection, and offers Undo.
 */
export function useBlockClipboard() {
  const { state, actions } = useEditor();
  const { t: tr } = useT();
  const raw = useSyncExternalStore(subscribeClipboard, clipboardSnapshot, () => null);
  const clip = useMemo(() => raw ? readClipboard() : [], [raw]);
  const first = clip[0];

  const copy = (id: string) => {
    const blocks = blocksToCopy(state.draft.blocks, id);
    if (blocks.length === 0) return;
    if (!writeClipboard(blocks)) {
      toast.error(tr('Couldn’t copy this block'), { description: tr('Your browser’s storage is full or switched off.') });
      return;
    }
    const msg = tr('Copied “{name}”', { name: layerName(blocks[0]) });
    toast.success(msg, { description: tr('Paste it on any page with ⌘V or Ctrl+V, or the paste button.') });
    announce(msg);
  };

  const paste = () => {
    const blocks = readClipboard();
    if (blocks.length === 0) return;
    const res = actions.insertBlocks(blocks, undefined, { smart: true });
    if (!res) return;
    const container = res.parentId ? state.draft.blocks.find((b) => b.id === res.parentId) : undefined;
    const msg = container ? tr('Pasted inside “{name}”', { name: layerName(container) }) : tr('Pasted below the selected block');
    toast.success(msg, { action: { label: tr('Undo'), onClick: actions.undo } });
    announce(msg);
  };

  return { canPaste: !!first, clipName: first ? layerName(first) : null, copy, paste };
}