import { useCallback } from 'react';
import { toast } from 'sonner';
import type { PageDocument } from '../types/page';
import { useEditor } from '../contexts/EditorContext';
import { prepareStarter } from '../utils/starterKit';

/**
 * Replaces the open space's draft with a template, keeping the owner's name and photo and
 * stripping the example's prices, links and quotes. Snapshot first, so it's undoable.
 */
export function useApplyTemplate() {
  const { state, actions } = useEditor();
  return useCallback(
    (name: string, source: PageDocument) => {
      const profile = state.draft.blocks.find((b) => b.type === 'profile');
      const identity =
        profile?.type === 'profile'
          ? { name: profile.content.name, tagline: profile.content.tagline, avatarUrl: profile.content.avatarUrl, location: profile.content.location }
          : { name: state.draft.title };
      const { doc, hidden } = prepareStarter(source, identity);
      actions.saveSnapshot(`Before “${name}” template`);
      actions.applyTemplate({ ...doc, title: state.draft.title });
      toast(`Applied “${name}”`, {
        description:
          hidden.length > 0
            ? `${hidden.length} block${hidden.length === 1 ? ' is' : 's are'} hidden until you add your own links or details. Find them in Layers.`
            : 'Your products, links and contact details stay. The previous draft is in version history.',
        action: { label: 'Undo', onClick: () => actions.undo() },
      });
    },
    [state.draft, actions],
  );
}
