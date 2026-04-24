import React from 'react';
import Head from 'next/head';
import { fetchAllUsers } from '../src/api/users';
import { fetchScores } from '../src/api/scores';
import { fetchRounds } from '../src/api/rounds';
import { supabase } from '../src/api/client';

const Section = ({ title, data }) => (
  <section style={{ marginBottom: '2rem' }}>
    <h2
      style={{
        fontFamily: 'monospace',
        borderBottom: '1px solid #555',
        paddingBottom: '0.25rem',
      }}
    >
      {title}
    </h2>
    <pre
      style={{
        background: 'var(--background-secondary, #1e1e1e)',
        color: 'var(--foreground, #d4d4d4)',
        padding: '1rem',
        borderRadius: '4px',
        overflowX: 'auto',
        fontSize: '0.8rem',
        lineHeight: '1.5',
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  </section>
);

const Debug = () => {
  const [session, setSession] = React.useState('');
  const [localUser, setLocalUser] = React.useState(null);
  const [users, setUsers] = React.useState(null);
  const [scores, setScores] = React.useState(null);
  const [options, setOptions] = React.useState(null);
  const [rounds, setRounds] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);
    if (!hashSession) {
      setError('No session provided. Use /debug/#<session>');
      setLoading(false);
      return;
    }

    setSession(hashSession);

    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    setLocalUser(stored);

    const load = async () => {
      try {
        const [allUsers, allScores, allOptions, allRounds] = await Promise.all([
          fetchAllUsers(hashSession),
          fetchScores(hashSession),
          supabase
            .from('options')
            .select('*')
            .eq('session_name', hashSession)
            .then(({ data, error: e }) => {
              if (e) throw new Error(JSON.stringify(e));
              return data;
            }),
          fetchRounds(hashSession),
        ]);
        setUsers(allUsers);
        setScores(allScores);
        setOptions(allOptions);
        setRounds(allRounds);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <Head>
        <title>Debug - Planning Poker</title>
      </Head>
      <div
        style={{
          padding: '2rem',
          maxWidth: '900px',
          margin: '0 auto',
          fontFamily: 'monospace',
        }}
      >
        <h1 style={{ marginBottom: '0.25rem' }}>Debug</h1>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.85rem' }}>
          Read-only snapshot &mdash; session: <strong>{session || '—'}</strong>
        </p>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#f44' }}>{error}</p>}

        {!loading && !error && (
          <>
            <Section title="Local User (localStorage)" data={localUser} />
            <Section title={`Users (${users?.length ?? 0})`} data={users} />
            <Section title={`Scores (${scores?.length ?? 0})`} data={scores} />
            <Section
              title={`Options (${options?.length ?? 0})`}
              data={options}
            />
            <Section title={`Rounds (${rounds?.length ?? 0})`} data={rounds} />
          </>
        )}
      </div>
    </>
  );
};

export default Debug;
