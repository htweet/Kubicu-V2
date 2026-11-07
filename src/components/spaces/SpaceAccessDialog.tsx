import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Space } from '../../types/workspace';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';
import { initials } from '../../utils/team';
import { workspaceSpaces } from '../../utils/spaces';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

/** “Who can edit” for one space (D57). Owners and Admins always can; others are ticked here. */
export function SpaceAccessDialog({ space, onClose }: { space: Space | null; onClose: () => void }) {
  const team = useTeam();
  const { current } = useWorkspace();
  const people = team.data.members.filter((m) => m.role !== 'owner' && m.role !== 'admin');
  const always = team.data.members.filter((m) => m.role === 'owner' || m.role === 'admin');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!space) return;
    setChecked(new Set(people.filter((m) => m.spaceIds === null || m.spaceIds.includes(space.id)).map((m) => m.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space?.id]);

  if (!space) return null;
  const allSpaceIds = workspaceSpaces(current).filter((s) => !s.archivedAt).map((s) => s.id);

  const save = () => {
    people.forEach((m) => {
      const has = m.spaceIds === null || m.spaceIds.includes(space.id);
      const want = checked.has(m.id);
      if (has === want) return;
      // Someone with every space who loses this one keeps all the others.
      const base = m.spaceIds ?? allSpaceIds;
      const next = want ? [...base, space.id] : base.filter((id) => id !== space.id);
      team.setSpaces(m.id, next.length === allSpaceIds.length && allSpaceIds.every((id) => next.includes(id)) ? null : next);
    });
    toast(`Access to ${space.name} updated`);
    onClose();
  };

  return (
    <Dialog
      open={!!space}
      onClose={onClose}
      title={`Who can edit ${space.name}`}
      description="People not ticked can still see it in Overview, but can’t open it in the canvas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-caption text-fg-muted">Always: {always.map((m) => `${m.name} (${roleInfo[m.role].label})`).join(', ')}</p>
        {people.length === 0 ? (
          <p className="text-label text-fg-muted">Nobody else to choose yet. Invite Editors or Sales from Settings → Team.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button size="sm" variant="tertiary" onClick={() => setChecked(new Set(people.map((m) => m.id)))}>
                Everyone on the team
              </Button>
              <Button size="sm" variant="tertiary" onClick={() => setChecked(new Set())}>
                Only Owner and Admins
              </Button>
            </div>
            <ul className="flex flex-col rounded-md border border-line">
              {people.map((m) => (
                <li key={m.id} className="border-b border-line last:border-0">
                  <label className="flex min-h-[48px] cursor-pointer items-center gap-3 px-3 text-label text-fg hover:bg-sunken">
                    <input type="checkbox" className="h-4 w-4" checked={checked.has(m.id)} onChange={() => setChecked((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })} />
                    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action-soft text-caption font-semibold text-action">
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{m.name}</span>
                    <span className="text-caption text-fg-subtle">{roleInfo[m.role].label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Dialog>
  );
}
