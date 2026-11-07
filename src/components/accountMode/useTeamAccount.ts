import { useCallback, useEffect, useRef, useState } from 'react';
import type { Role } from '../../types/team';
import type { AccountAction, AccountFailure, AccountInvite, AccountMember } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { simulate } from '../../utils/accountModeSim';
import { useAccount } from '../../utils/account/store';
import { sampleAccountInvites, sampleAccountMembers, sampleAccountEmail } from '../../data/accountModeSamples';
import { accountErrorCopy, isScreenFailure } from '../account/AccountStates';

export type RowStatus = { kind: 'saving' } | { kind: 'saved' } | { kind: 'failed'; text: string } | { kind: 'gone' };
export type MutationOutcome = 'done' | 'cancelled' | 'failed';

/** Account-mode Team data and actions (D532). Every change waits for the (simulated) server before it shows. */
export function useTeamAccount() {
  const { simulation, withStepUp } = useAccountMode();
  const team = useTeam();
  const account = useAccount();
  const { t: tr } = useT();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadFailure, setLoadFailure] = useState<AccountFailure | null>(null);
  const [screenFailure, setScreenFailure] = useState<AccountFailure | null>(null);
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [invites, setInvites] = useState<AccountInvite[]>([]);
  const [rows, setRows] = useState<Record<string, RowStatus>>({});
  const [meId, setMeId] = useState('acc_owner');
  const timers = useRef<number[]>([]);

  const load = useCallback(async () => {
    setStatus('loading');
    setLoadFailure(null);
    setScreenFailure(null);
    const r = await simulate('team.load', simulation);
    if (!r.ok) {
      if (isScreenFailure(r.code)) setScreenFailure(r);
      setLoadFailure(r);
      setStatus('error');
      return;
    }
    // The sample "you" follows the Viewing as control so permissions match the rest of the prototype.
    const list = [...sampleAccountMembers];
    let me = list.find((m) => m.role === team.role);
    if (!me) {
      me = { id: 'acc_me', name: account.profile.name || tr('You'), contact: account.profile.email || sampleAccountEmail, role: team.role, spaceIds: null, branchId: null, joinedAt: '2026-10-01T09:00:00.000Z' };
      list.push(me);
    }
    setMeId(me.id);
    setMembers(list);
    setInvites(simulation === 'empty' ? [] : [...sampleAccountInvites]);
    setRows({});
    setStatus('loaded');
  }, [simulation, team.role, account.profile.name, account.profile.email, tr]);

  useEffect(() => {
    void load();
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, [load]);

  const setRow = (id: string, s: RowStatus | null) =>
    setRows((prev) => {
      const next = { ...prev };
      if (s) next[id] = s;
      else delete next[id];
      return next;
    });

  /** Runs one server change for one row; the row keeps its old value unless the server confirms. */
  const mutate = async (id: string, action: AccountAction, opts: { stepUp?: boolean; refusal?: string }, apply: () => void): Promise<MutationOutcome> => {
    setRow(id, { kind: 'saving' });
    const r = await withStepUp(() => simulate(action, simulation, opts));
    if (r.ok) {
      apply();
      setRow(id, { kind: 'saved' });
      timers.current.push(window.setTimeout(() => setRows((prev) => (prev[id]?.kind === 'saved' ? (({ [id]: _drop, ...rest }) => rest)(prev) : prev)), 2500));
      return 'done';
    }
    if (r.code === 'cancelled') {
      setRow(id, null);
      return 'cancelled';
    }
    if (isScreenFailure(r.code)) {
      setRow(id, null);
      setScreenFailure(r);
      return 'failed';
    }
    if (r.code === 'conflict') {
      setRow(id, { kind: 'gone' });
      return 'failed';
    }
    setRow(id, { kind: 'failed', text: accountErrorCopy(tr, r).body });
    return 'failed';
  };

  const refusalFor = (m: AccountMember, kind: 'role' | 'remove') =>
    m.id === meId ? 'Ask another Admin or the Owner to change your role or access.' : m.role === 'owner' ? (kind === 'remove' ? 'The Owner cannot be removed. Transfer ownership first.' : 'The Owner’s role changes only through ownership transfer.') : 'Approver needs a workspace with Workflows.';

  const changeRole = (m: AccountMember, role: Role) => mutate(m.id, 'member.update', { stepUp: true, refusal: tr(refusalFor(m, 'role')) }, () => setMembers((l) => l.map((x) => (x.id === m.id ? { ...x, role } : x))));

  const changeAccess = (m: AccountMember, spaceIds: string[] | null, branchId: string | null) =>
    mutate(m.id, 'member.update', { stepUp: true, refusal: tr(refusalFor(m, 'role')) }, () => setMembers((l) => l.map((x) => (x.id === m.id ? { ...x, spaceIds, branchId } : x))));

  const remove = (m: AccountMember) => mutate(m.id, 'member.remove', { stepUp: true, refusal: tr(refusalFor(m, 'remove')) }, () => setMembers((l) => l.filter((x) => x.id !== m.id)));

  const transfer = (m: AccountMember, ownedLimit: number) =>
    mutate(m.id, 'ownership.transfer', { stepUp: true, refusal: tr('The new owner already owns {n} workspaces, the most allowed. They need to archive one first.', { n: ownedLimit }) }, () =>
      setMembers((l) => l.map((x) => (x.id === m.id ? { ...x, role: 'owner' } : x.id === meId ? { ...x, role: 'admin' } : x))),
    );

  const leave = async (): Promise<AccountFailure | null> => {
    const r = await simulate('member.leave', simulation);
    if (r.ok) return null;
    if (isScreenFailure(r.code)) setScreenFailure(r);
    return r;
  };

  const cancelInvite = async (inv: AccountInvite): Promise<AccountFailure | null> => {
    const r = await simulate('invite.cancel', simulation);
    if (r.ok || r.code === 'conflict') setInvites((l) => l.filter((i) => i.id !== inv.id));
    if (r.ok) return null;
    if (isScreenFailure(r.code)) setScreenFailure(r);
    return r;
  };

  return {
    status,
    loadFailure,
    screenFailure,
    members,
    invites,
    rows,
    meId,
    reload: load,
    changeRole,
    changeAccess,
    remove,
    transfer,
    leave,
    cancelInvite,
    addInvite: (inv: AccountInvite) => setInvites((l) => [inv, ...l]),
    dismissRow: (id: string) => {
      setRow(id, null);
      setMembers((l) => l.filter((x) => x.id !== id));
    },
    clearRow: (id: string) => setRow(id, null),
    setScreenFailure,
  };
}
