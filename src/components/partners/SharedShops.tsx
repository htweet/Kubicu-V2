import React, { useEffect, useState } from 'react';
import { CopyIcon, ExternalLinkIcon, StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { SharedShop, SharedShopMember } from '../../types/sharedShop';
import { memberItems, memberStatusLabels, onSharedShopsChange, readSharedShops, sharedShopUrl, updateSharedShops } from '../../utils/sharedShops';
import { useT } from '../../contexts/LocaleContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Switch } from '../ui/Switch';

interface Props {
  workspaceId: string;
  canEdit: boolean;
  onCreate: () => void;
}

const tone = { invited: 'info', joined: 'success', left: 'neutral' } as const;

/** Collaborations → Shared shops (D128): shops this workspace hosts or shows products in. */
export function SharedShops({ workspaceId, canEdit, onCreate }: Props) {
  const { t: tr } = useT();
  const [shops, setShops] = useState<SharedShop[]>(() => readSharedShops());
  useEffect(() => onSharedShopsChange(() => setShops(readSharedShops())), []);
  const mine = shops.filter((s) => s.hostWorkspaceId === workspaceId || s.members.some((m) => m.workspaceId === workspaceId && m.status !== 'left'));

  const patchMember = (shopId: string, memberId: string, patch: Partial<SharedShopMember>) =>
    updateSharedShops((l) => l.map((s) => (s.id === shopId ? { ...s, members: s.members.map((m) => (m.id === memberId ? { ...m, ...patch } : m)) } : s)));
  const patchShop = (shopId: string, patch: Partial<SharedShop>) => updateSharedShops((l) => l.map((s) => (s.id === shopId ? { ...s, ...patch } : s)));

  if (!mine.length)
    return (
      <div className="mt-8">
        <EmptyState
          framed
          icon={StoreIcon}
          title={tr('One shop link for a group of sellers')}
          description={tr('A market line, a designers’ collective, a church or school fair — show everyone’s products on one link. Each seller still takes their own orders and money.')}
          action={
            <Button disabled={!canEdit} onClick={onCreate}>
              {tr('New shared shop')}
            </Button>
          }
        />
      </div>
    );

  return (
    <ul className="mt-8 flex flex-col gap-6">
      {mine.map((s) => {
        const host = s.hostWorkspaceId === workspaceId;
        const joined = s.members.filter((m) => m.status === 'joined');
        const count = s.members.reduce((n, m) => n + memberItems(m).length, 0);
        return (
          <li key={s.id} className="rounded-lg border border-line bg-raised">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start md:p-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-heading font-semibold text-fg">{s.name}</h3>
                  {s.paused ? <Badge tone="neutral">{tr('Closed for now')}</Badge> : <Badge tone="success">{tr('Open')}</Badge>}
                  {!host && <Badge tone="info">{tr('Hosted by {name}', { name: s.hostName })}</Badge>}
                </div>
                <p className="mt-0.5 font-mono text-caption text-fg-subtle">kub.icu/m/{s.slug}</p>
                <p className="mt-2 text-caption text-fg-muted">{tr('Sellers: {a} · products showing: {b}', { a: joined.length, b: count })}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={CopyIcon}
                  onClick={() => {
                    void navigator.clipboard?.writeText(sharedShopUrl(s.slug));
                    toast(tr('Link copied'), { description: tr('Share it on WhatsApp status, flyers or your group chat.') });
                  }}
                >
                  {tr('Copy link')}
                </Button>
                <Button size="sm" variant="tertiary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(`/m/${s.slug}`, '_blank')}>
                  {tr('Open')}
                </Button>
              </div>
            </div>

            <ul aria-label={tr('Sellers in {name}', { name: s.name })} className="divide-y divide-line border-t border-line">
              {s.members.map((m) => {
                const items = memberItems(m).length;
                const self = m.workspaceId === workspaceId;
                return (
                  <li key={m.id} className="flex min-h-[56px] flex-wrap items-center gap-3 px-5 py-3 md:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block text-label font-medium text-fg">
                        {m.name}
                        {self ? ` (${tr('you')})` : ''}
                      </span>
                      <span className="block text-caption text-fg-subtle">
                        @{m.handle}
                        {m.status === 'joined' ? ` · ${tr('Products: {n}', { n: items })}${m.sampleItems ? ` (${tr('sample')})` : ''}` : ''}
                      </span>
                    </span>
                    <Badge tone={tone[m.status]}>{tr(memberStatusLabels[m.status])}</Badge>
                    {m.status === 'invited' && host && canEdit && (
                      <Button size="sm" variant="tertiary" onClick={() => (patchMember(s.id, m.id, { status: 'joined', joinedAt: new Date().toISOString() }), toast(tr('{name} joined', { name: m.name }), { description: tr('Simulated — in real use they accept from their own Collaborations.') }))}>
                        {tr('Accept as {name}', { name: m.name.split(' ')[0] })}
                      </Button>
                    )}
                    {m.status === 'joined' && (host || self) && !(host && self) && canEdit && (
                      <Button size="sm" variant="tertiary" onClick={() => (patchMember(s.id, m.id, { status: 'left' }), toast(self ? tr('You left the shop') : tr('{name} removed', { name: m.name }), { description: tr('Their products no longer show. Orders already placed aren’t affected.') }))}>
                        {self ? tr('Leave') : tr('Remove')}
                      </Button>
                    )}
                    {m.status === 'left' && host && canEdit && (
                      <Button size="sm" variant="tertiary" onClick={() => patchMember(s.id, m.id, { status: 'invited' })}>
                        {tr('Invite again')}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>

            {host && (
              <div className="border-t border-line px-5 py-4">
                <Switch id={`ss-pause-${s.id}`} label={tr('Close the shop for now')} description={tr('Visitors see a short “closed for now” note with links to each seller. Nothing is deleted.')} checked={!!s.paused} disabled={!canEdit} onChange={(paused) => patchShop(s.id, { paused })} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
