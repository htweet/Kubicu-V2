import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOptionalAuth } from '../../contexts/AuthContext';

/**
 * "Sign out" in the account menu and the phone menu. Prototype (flag off): unchanged, nothing to end.
 * Real sign-in: ends the Kubicu session (CSRF-protected), then goes to sign-in. Browser workspaces stay.
 */
export function useSignOut(): () => void {
  const navigate = useNavigate();
  const auth = useOptionalAuth();
  return () => {
    if (!auth) {
      navigate('/signin');
      toast('Signed out', { description: 'Prototype — your data stays on this device.' });
      return;
    }
    auth.signOut().then(
      () => {
        navigate('/signin', { replace: true });
        toast('Signed out', { description: 'Your browser workspaces stay on this device.' });
      },
      () => toast.error('Couldn’t sign out', { description: 'Check your connection and try again.' })
    );
  };
}
