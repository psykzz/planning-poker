import React from 'react';
import Head from 'next/head';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { VotingScreen } from '../src/components/VotingScreen';

const Voting = () => {
  const router = useRouter();
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [nameInput, setNameInput] = React.useState('');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const hasUser = Boolean(storedUser?.id && storedUser?.name);

    if (!hashSession) {
      const nextSession = nanoid(7);
      router.replace(`/voting#${nextSession}`);
      return;
    }

    setSession(hashSession);
    if (hasUser) {
      setUser(storedUser);
      setNameInput(storedUser.name);
      setReady(true);
      return;
    }

    setUser(undefined);
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
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      setReady(true);
    },
    [nameInput],
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
          <section
            style={{
              maxWidth: 520,
              margin: '0 auto',
              display: 'grid',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <h1>Join Voting Session</h1>
            <p>
              Enter your display name to join session <strong>{session}</strong>
              .
            </p>
            <form onSubmit={submitName} style={{ display: 'grid', gap: 10 }}>
              <label htmlFor="player-name">Display name</label>
              <input
                id="player-name"
                value={nameInput}
                onChange={event => setNameInput(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
              <button type="submit">Join session</button>
            </form>
          </section>
        )}
      </Layout>
    </>
  );
};

export default Voting;
