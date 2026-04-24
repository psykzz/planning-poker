import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { PlanningPoker } from '../src/components/PlanningPoker';

const Results = () => {
  const router = useRouter();
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const hasUser = Boolean(storedUser?.id && storedUser?.name);

    if (!hashSession || !hasUser) {
      router.replace('/');
      return;
    }

    setSession(hashSession);
    setUser(storedUser);
    setReady(true);
  }, [router]);

  return (
    <>
      <Head>
        <title>Results - Planning Poker</title>
      </Head>
      <Layout>
        {ready ? <PlanningPoker session={session} user={user} /> : null}
      </Layout>
    </>
  );
};

export default Results;
