import React from 'react';
import { useRouter } from 'next/router';
import { getStoredUser } from '../utils/userStorage';

/**
 * Bootstraps session + user from the URL hash and localStorage.
 * If there is no hash, redirects to `fallbackPath`.
 * If there is a hash but no stored user, redirects to `/voting#<hash>`.
 *
 * @param {string} [fallbackPath='/voting'] - Where to redirect when the hash is absent.
 * @returns {{ session: string, user: object|undefined, ready: boolean }}
 */
export const useHashSession = (fallbackPath = '/voting') => {
  const router = useRouter();
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);
    const storedUser = getStoredUser();
    const hasUser = Boolean(storedUser?.id && storedUser?.name);

    if (!hashSession) {
      router.replace(fallbackPath);
      return;
    }

    if (!hasUser) {
      router.replace(`/voting#${hashSession}`);
      return;
    }

    setSession(hashSession);
    setUser(storedUser);
    setReady(true);
  }, [router, fallbackPath]);

  return { session, user, ready };
};
