import React from 'react';
import { nanoid } from 'nanoid';
import { PlanningPoker } from '../PlanningPoker';
import * as styles from './hero.module.css';
import {
  clearStoredUser,
  getStoredUser,
  getStoredUserName,
  normalizeStoredUser,
  setStoredUser,
} from '../../utils/userStorage';

export const Hero = () => {
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [nameInput, setNameInput] = React.useState('');
  const hasUser = Boolean(user?.id && user?.name);

  const onHashChange = React.useCallback(() => {
    const nextSession = window.location.hash.slice(1);
    const storedUser = nextSession ? getStoredUser(nextSession) : undefined;
    const storedName = getStoredUserName();

    setSession(nextSession);

    if (storedUser) {
      setUser(storedUser);
      setNameInput(storedUser.name);
      return;
    }

    setUser(undefined);
    setNameInput(storedName || '');
  }, []);

  React.useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [onHashChange]);

  React.useEffect(() => {
    if (!user?.id || !user?.name || !session) {
      return;
    }

    setStoredUser(user, session);
  }, [session, user]);

  const ensureUser = React.useCallback(() => {
    if (user?.id && user?.name) {
      return user;
    }

    const normalizedName = nameInput.trim();
    if (!normalizedName) {
      return null;
    }

    const nextUser = normalizeStoredUser({ name: normalizedName });
    setUser(nextUser);
    return nextUser;
  }, [nameInput, user]);

  const createSession = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const nextSession = nanoid(7);
    const nextUser = ensureUser();
    if (!nextUser) {
      return;
    }
    setStoredUser(nextUser, nextSession);
    window.location.hash = nextSession;
  }, [ensureUser]);

  const onSubmitName = React.useCallback(
    event => {
      event.preventDefault();
      if (session) {
        const nextUser = ensureUser();
        if (nextUser) {
          setStoredUser(nextUser, session);
        }
        return;
      }

      createSession();
    },
    [createSession, ensureUser, session],
  );

  const clearIdentity = React.useCallback(() => {
    clearStoredUser();
    setUser(undefined);
    setNameInput('');
  }, []);

  return (
    <div className={`${styles.content} ${session ? styles.has_session : ''}`}>
      <h1 className={styles.title}>Planning Poker</h1>
      {!session || !hasUser ? (
        <section className={styles.panel}>
          <p className={styles.subtitle}>
            {session
              ? 'Enter your display name to join this session.'
              : 'Create a session, share the link, and reveal estimates together.'}
          </p>
          <form onSubmit={onSubmitName} className={styles.form}>
            <label htmlFor="player-name" className={styles.label}>
              Your display name
            </label>
            <input
              id="player-name"
              className={styles.name_input}
              value={nameInput}
              onChange={event => setNameInput(event.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
            <div className={styles.actions}>
              <button type="submit" className={styles.new_session}>
                {session ? 'Join session' : 'Start new session'}
              </button>
              {hasUser ? (
                <button
                  type="button"
                  className={styles.existing_session}
                  onClick={clearIdentity}
                >
                  Switch identity
                </button>
              ) : null}
            </div>
          </form>
        </section>
      ) : (
        <PlanningPoker {...{ user, session }} />
      )}
    </div>
  );
};
