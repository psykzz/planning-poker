import React from 'react';
import Head from 'next/head';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { VotingScreen } from '../src/components/VotingScreen';
import * as styles from '../src/components/JoinSessionPrompt/joinsessionprompt.module.css';
import {
  getStoredUser,
  getStoredUserName,
  setStoredUser,
} from '../src/utils/userStorage';

const Voting = () => {
  const router = useRouter();
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [nameInput, setNameInput] = React.useState('');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);

    if (!hashSession) {
      const nextSession = nanoid(7);
      router.replace(`/voting#${nextSession}`);
      return;
    }

    const storedUser = getStoredUser(hashSession);
    const storedName = getStoredUserName();
    const hasUser = Boolean(storedUser?.id && storedUser?.name);

    setSession(hashSession);
    if (hasUser) {
      setUser(storedUser);
      setNameInput(storedUser.name);
      setReady(true);
      return;
    }

    setUser(undefined);
    setNameInput(storedName || '');
    setReady(false);
  }, [router]);

  const submitName = React.useCallback(
    event => {
      event.preventDefault();
      const normalizedName = nameInput.trim();
      if (!normalizedName) {
        return;
      }

      const nextUser = {
        id: globalThis.crypto.randomUUID(),
        name: normalizedName,
      };
      setStoredUser(nextUser, session);
      setUser(nextUser);
      setReady(true);
    },
    [nameInput, session],
  );

  return (
    <>
      <Head>
        <title>Voting - Planning Poker</title>
      </Head>
      <Layout>
        {ready ? (
          <VotingScreen session={session} user={user} />
        ) : (
          <section className={styles.panel}>
            <h1 className={styles.title}>Join Voting Session</h1>
            <p className={styles.subtitle}>
              Enter your display name to join session <strong>{session}</strong>
              .
            </p>
            <form onSubmit={submitName} className={styles.form}>
              <label htmlFor="player-name" className={styles.label}>
                Display name
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
              <button type="submit" className={styles.submit_button}>
                Join session
              </button>
            </form>
          </section>
        )}
      </Layout>
    </>
  );
};

export default Voting;
