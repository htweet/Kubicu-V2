import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { AccountStateAlert } from '../account/AccountStates';
import { useAccountSave, SaveStatus } from './useAccountSave';

/**
 * Settings → Business → Workspace details, account mode only (D545). The prototype had no place to rename
 * a workspace; the server accepts name and owner name with commerce.settings. Old values stay until saved.
 */
export function WorkspaceDetailsCard() {
  const { t: tr } = useT();
  const { current, update } = useWorkspace();
  const can = useTeam().can('commerce.settings');
  const server = useAccountSave();
  const [name, setName] = useState(current.name);
  const [ownerName, setOwnerName] = useState(current.ownerName);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setName(current.name);
    setOwnerName(current.ownerName);
  }, [current.name, current.ownerName]);

  const dirty = name.trim() !== current.name || ownerName.trim() !== current.ownerName;
  const nameError = tried && !name.trim() ? tr('Enter a name for the workspace.') : undefined;

  const save = async () => {
    setTried(true);
    if (!name.trim()) return;
    const outcome = await server.run({ action: 'settings.save', refusal: tr('You need permission to change business settings.') });
    if (outcome === 'ok') {
      update(current.id, { name: name.trim(), ownerName: ownerName.trim() });
      return;
    }
    if (outcome !== 'cancelled') {
      setName(current.name);
      setOwnerName(current.ownerName);
    }
  };

  return (
    <Card id="workspace-details" title={tr('Workspace details')} description={tr('The name your team and customers see, and who owns the business.')}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {server.screenFailure && <AccountStateAlert failure={server.screenFailure} />}
        {!can.allowed && (
          <InlineAlert tone="info" title={tr('You can’t change this')}>
            {can.reason}
          </InlineAlert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="ws-name" label={tr('Workspace name')} value={name} error={nameError} disabled={!can.allowed || server.busy} onChange={(e) => setName(e.target.value)} />
          <TextInput id="ws-owner-name" label={tr('Owner name')} value={ownerName} disabled={!can.allowed || server.busy} onChange={(e) => setOwnerName(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={server.busy} disabled={!can.allowed || !dirty}>
            {tr('Save')}
          </Button>
          <SaveStatus state={server.state} />
        </div>
      </form>
    </Card>
  );
}
