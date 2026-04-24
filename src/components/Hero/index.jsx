import React from 'react';
import { nanoid } from 'nanoid';
import { PlanningPoker } from '../PlanningPoker';
import * as styles from './hero.module.css';
import {
  clearStoredUser,
  getStoredUser,
  normalizeStoredUser,
  setStoredUser,
} from '../../utils/userStorage';

export const Hero = () => {
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [nameInput, setNameInput] = React.useState('');
  const hasUser = Boolean(user?.id && user?.name);

  const onHashChange = React.useCallback(() => {
    setSession(window.location.hash.slice(1));
  }, []);

  const createOrRestoreUser = React.useCallback(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setNameInput(storedUser.name);
      return;
    }

    setUser(undefined);
  }, []);

  React.useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    createOrRestoreUser();

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [createOrRestoreUser, onHashChange]);

  React.useEffect(() => {
    if (!user?.id || !user?.name) {
      return;
    }

    setStoredUser(user);
  }, [user]);

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
    if (!ensureUser()) {
      return;
    }
    window.location.hash = nanoid(7);
  }, [ensureUser]);

  const onSubmitName = React.useCallback(
    event => {
      event.preventDefault();
      if (session) {
        ensureUser();
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
