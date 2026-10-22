import { useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useEditor } from '../../contexts/EditorContext';
import { useDealRoomSettlement } from '../../hooks/useDealRoomSettlement';
import { activeExtraSpaces, readSpacePage } from '../../utils/spaces';

/** Keeps every group-goal DealRoom in this workspace settled (D54). Renders nothing. */
export function DealRoomSettler() {
  const { current, currentSpace } = useWorkspace();
  const { data, apply } = useCommerce();
  const { state } = useEditor();
  const rooms = useMemo(
    () =>
    activeExtraSpaces(current).
    filter((s) => s.kind === 'dealroom').
    map((s) => {
      // The open room uses the editor's published copy so changes apply straight away.
      const doc = s.id === currentSpace.id ? state.published : readSpacePage(current.id, s.id)?.published;
      return doc?.dealRoom ? { room: doc.dealRoom, handle: doc.handle } : null;
    }).
    filter((r): r is NonNullable<typeof r> => !!r),
    [current, currentSpace.id, state.published]
  );
  useDealRoomSettlement(data, apply, rooms);
  return null;
}