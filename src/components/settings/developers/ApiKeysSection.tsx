import React, { useState } from 'react';
import { CopyIcon, KeyRoundIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTeam } from '../../../contexts/TeamContext';
import { useDevelopers } from '../../../hooks/useDevelopers';
import { scopeInfo, scopeLabel, RATE_LIMIT_PER_MIN } from '../../../data/developerApi';
import type { ApiKey, ApiScope, KeyMode } from '../../../types/developers';
import { makeKey, maskKey, uid } from '../../../utils/developers';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { TextInput } from '../../ui/TextInput';
import { Segmented } from '../../ui/Segmented';

/** API keys: create with scopes, see the secret once, revoke (D131). */
export function ApiKeysSection({ canManage }: {canManage: boolean;}) {
  const team = useTeam();
  const { data, update } = useDevelopers();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<KeyMode>('test');
  const [scopes, setScopes] = useState<Set<ApiScope>>(new Set(['products:read', 'orders:read']));
  const [tried, setTried] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const active = data.keys.filter((k) => !k.revokedAt);
  const revoked = data.keys.filter((k) => k.revokedAt);

  const reset = () => {
    setName('');
    setMode('test');
    setScopes(new Set(['products:read', 'orders:read']));
    setTried(false);
  };

  const create = () => {
    setTried(true);
    if (!name.trim() || scopes.size === 0) return;
    const k = makeKey(mode);
    update((d) => ({
      ...d,
      keys: [{ id: uid('key'), name: name.trim(), mode, prefix: k.prefix, last4: k.last4, scopes: [...scopes], createdAt: new Date().toISOString(), createdBy: team.me.name }, ...d.keys]
    }));
    team.log('settings', `created the ${mode} API key “${name.trim()}”`, '/app/settings/developers');
    setCreating(false);
    reset();
    setSaved(false);
    setSecret(k.secret);
  };

  const revoke = () => {
    if (!revoking) return;
    update((d) => ({ ...d, keys: d.keys.map((k) => k.id === revoking.id ? { ...k, revokedAt: new Date().toISOString() } : k) }));
    team.log('settings', `revoked the API key “${revoking.name}”`, '/app/settings/developers');
    toast.success(`“${revoking.name}” revoked`, { description: 'Requests using it now get 401 Unauthorized.' });
    setRevoking(null);
  };

  const toggle = (s: ApiScope) =>
  setScopes((cur) => {
    const n = new Set(cur);
    if (n.has(s)) n.delete(s);else
    n.add(s);
    return n;
  });

  return (
    <Card
      id="keys"
      title="API keys"
      description={`Let your own software read and update this workspace. Each key only does what you tick. Limit: ${RATE_LIMIT_PER_MIN} requests a minute per key.`}
      body="flush"
      actions={canManage ? <Button size="sm" leadingIcon={PlusIcon} onClick={() => setCreating(true)}>New key</Button> : undefined}>
      
      {active.length === 0 ?
      <div className="flex flex-col items-start gap-1 px-5 py-6 md:px-6">
          <p className="text-label font-medium text-fg">No keys yet</p>
          <p className="text-caption text-fg-muted">Start with a test key — it only sees sample data, so nothing real can break.</p>
        </div> :

      <ul className="divide-y divide-line">
          {active.map((k) =>
        <li key={k.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
              <KeyRoundIcon size={16} className="hidden shrink-0 text-fg-subtle sm:block" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                  {k.name}
                  <Badge tone={k.mode === 'live' ? 'warning' : 'neutral'}>{k.mode === 'live' ? 'Live' : 'Test'}</Badge>
                </span>
                <span className="block font-mono text-caption text-fg-muted">{maskKey(k.prefix, k.last4)}</span>
                <span className="block text-caption text-fg-subtle">
                  {k.scopes.length} permission{k.scopes.length === 1 ? '' : 's'} · made by {k.createdBy} {formatRelative(k.createdAt)} · {k.lastUsedAt ? `last used ${formatRelative(k.lastUsedAt)}` : 'never used'}
                </span>
              </span>
              {canManage &&
          <Button size="sm" variant="tertiary" onClick={() => setRevoking(k)}>
                  Revoke…
                </Button>
          }
            </li>
        )}
        </ul>
      }
      {revoked.length > 0 &&
      <p className="border-t border-line px-5 py-3 text-caption text-fg-subtle md:px-6">
          {revoked.length} revoked key{revoked.length === 1 ? '' : 's'}: {revoked.map((k) => k.name).join(', ')}
        </p>
      }

      <Dialog
        open={creating}
        onClose={() => {
          setCreating(false);
          reset();
        }}
        title="New API key"
        description="Give it a name you’ll recognise, like the app or person using it."
        footer={
        <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Create key</Button>
          </>
        }>
        
        <div className="flex flex-col gap-5">
          <TextInput id="key-name" label="Name" placeholder="e.g. Stock sync from my POS" value={name} onChange={(e) => setName(e.target.value)} error={tried && !name.trim() ? 'Give the key a name.' : undefined} autoFocus />
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">Mode</span>
            <Segmented ariaLabel="Key mode" value={mode} onChange={setMode} options={[{ value: 'test', label: 'Test — sample data' }, { value: 'live', label: 'Live — real data' }]} />
            {mode === 'live' && <p className="text-caption text-warning">Live keys can change real orders and stock. Keep them on a server, never in a page or app people can download.</p>}
          </div>
          <fieldset>
            <legend className="text-label font-medium text-fg">What it can do</legend>
            <ul className="mt-2 divide-y divide-line rounded-md border border-line">
              {scopeInfo.map((s) =>
              <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5">
                    <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={scopes.has(s.id)} onChange={() => toggle(s.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-label text-fg">{s.label}</span>
                      <span className="block font-mono text-caption text-fg-subtle">{s.id}</span>
                    </span>
                    {s.risky && <Badge tone="warning">Changes data</Badge>}
                  </label>
                </li>
              )}
            </ul>
            {tried && scopes.size === 0 && <p className="mt-1.5 text-caption text-danger">Tick at least one.</p>}
          </fieldset>
        </div>
      </Dialog>

      <Dialog
        open={!!secret}
        onClose={() => saved && setSecret(null)}
        title="Copy your key now"
        description="For your safety we only show it once. If you lose it, revoke it and make a new one."
        footer={
        <Button onClick={() => setSecret(null)} disabled={!saved}>
            Done
          </Button>
        }>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-md border border-line bg-sunken px-3 py-2.5">
            <code className="min-w-0 flex-1 break-all font-mono text-caption text-fg">{secret}</code>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={CopyIcon}
              onClick={() => {
                if (secret) void navigator.clipboard?.writeText(secret);
                toast.success('Key copied');
              }}>
              
              Copy
            </Button>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-label text-fg">
            <input type="checkbox" className="size-4 accent-[rgb(var(--action))]" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
            I’ve saved this key somewhere safe
          </label>
        </div>
      </Dialog>

      <Dialog
        open={!!revoking}
        onClose={() => setRevoking(null)}
        size="sm"
        title={`Revoke “${revoking?.name}”?`}
        description={`Anything using it stops working straight away. Permissions: ${revoking?.scopes.map(scopeLabel).join('; ')}.`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setRevoking(null)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={revoke}>
              Revoke key
            </Button>
          </>
        }>
        
        {null}
      </Dialog>
    </Card>);

}