import type { Workspace } from '../../types/workspace';
import type { Role } from '../../types/team';
import type { AccountData } from '../../types/account';
import { readTeam } from '../team';

/**
 * The people behind workspaces (D472). One person can own or work in several workspaces, so staff see people
 * and workspaces separately. In the prototype the signed-in account holder owns every workspace on the device;
 * teammates come from each workspace's team list and are matched across workspaces by email or phone.
 */
export interface PersonWorkspace {
  id: string;
  /** Their member id in that workspace's team, when they're on it. */
  memberId?: string;
  name: string;
  role: Role;
  lastActiveAt: string | null;
}

export interface Person {
  /** `account` for the account holder, else `c:{contact}` in lower case. */
  key: string;
  name: string;
  email: string;
  phone: string;
  accountHolder: boolean;
  workspaces: PersonWorkspace[];
  lastActiveAt: string | null;
  joinedAt: string | null;
  twoStep: AccountData['security']['twoStep'] | null;
  emailVerified: boolean | null;
  sessions: number | null;
  sample: boolean;
}

export const ACCOUNT_PERSON = 'account';
const contactKey = (c: string) => `c:${c.trim().toLowerCase().replace(/\s+/g, '')}`;
const latest = (a: string | null, b: string | null) => (!a ? b : !b ? a : Date.parse(a) > Date.parse(b) ? a : b);

export function buildPeople(workspaces: Workspace[], account: AccountData): Person[] {
  const holder: Person = {
    key: ACCOUNT_PERSON,
    name: account.profile.name || account.profile.displayName,
    email: account.profile.email,
    phone: account.profile.phone,
    accountHolder: true,
    workspaces: [],
    lastActiveAt: account.sessions.reduce<string | null>((m, s) => latest(m, s.lastActiveAt), null),
    joinedAt: account.createdAt,
    twoStep: account.security.twoStep,
    emailVerified: account.emailVerified,
    sessions: account.sessions.length,
    sample: false,
  };
  const others = new Map<string, Person>();

  workspaces.forEach((w) => {
    const team = readTeam(w.id);
    const members = team?.members ?? [];
    const owner = members.find((m) => m.role === 'owner');
    holder.workspaces.push({ id: w.id, memberId: owner?.id, name: w.name, role: 'owner', lastActiveAt: owner?.lastActiveAt ?? null });
    members
      .filter((m) => m.role !== 'owner')
      .forEach((m) => {
        const key = contactKey(m.contact || m.name);
        const p =
          others.get(key) ??
          ({
            key,
            name: m.name,
            email: m.contact.includes('@') ? m.contact : '',
            phone: m.contact.includes('@') ? '' : m.contact,
            accountHolder: false,
            workspaces: [],
            lastActiveAt: null,
            joinedAt: m.joinedAt,
            twoStep: null,
            emailVerified: null,
            sessions: null,
            sample: !!m.sample,
          } as Person);
        p.workspaces.push({ id: w.id, memberId: m.id, name: w.name, role: m.role, lastActiveAt: m.lastActiveAt });
        p.lastActiveAt = latest(p.lastActiveAt, m.lastActiveAt);
        if (m.joinedAt && (!p.joinedAt || Date.parse(m.joinedAt) < Date.parse(p.joinedAt))) p.joinedAt = m.joinedAt;
        others.set(key, p);
      });
  });

  return [holder, ...others.values()];
}

/** Everyone in one workspace, owner first. */
export const peopleIn = (people: Person[], workspaceId: string) =>
  people
    .map((p) => ({ person: p, ws: p.workspaces.find((w) => w.id === workspaceId) }))
    .filter((x): x is { person: Person; ws: PersonWorkspace } => !!x.ws)
    .sort((a, b) => (a.ws.role === 'owner' ? -1 : b.ws.role === 'owner' ? 1 : a.person.name.localeCompare(b.person.name)));

export const roleNames: Record<Role, string> = { owner: 'Owner', admin: 'Admin', editor: 'Editor', sales: 'Sales', viewer: 'Viewer' };
