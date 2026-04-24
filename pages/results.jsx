import React from 'react';
import Head from 'next/head';
import Layout from '../src/components/Layout';
import { ResultsScreen } from '../src/components/ResultsScreen';
import { useHashSession } from '../src/hooks/useHashSession';

const Results = () => {
  const { session, user, ready } = useHashSession();

  return (
    <>
      <Head>
        <title>Results - Planning Poker</title>
      </Head>
      <Layout>
        {ready ? <ResultsScreen session={session} user={user} /> : null}
      </Layout>
    </>
  );
};

export default Results;
