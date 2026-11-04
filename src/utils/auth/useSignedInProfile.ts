import { useAccount } from '../account/store';
import { useOptionalAuth } from '../../contexts/AuthContext';

/**
 * The profile shown in the account menus. Prototype: the simulated account (unchanged). Real sign-in:
 * the person who is really signed in (name and e-mail from /v1/me), never the sample profile (M2.6).
 */
export function useSignedInProfile(): ReturnType<typeof useAccount>['profile'] {
  const account = useAccount();
  const me = useOptionalAuth()?.me?.user;
  if (!me) return account.profile;
  const name = me.displayName ?? me.email ?? account.profile.name;
  return { ...account.profile, name, displayName: name, email: me.email ?? '', photo: null };
}
