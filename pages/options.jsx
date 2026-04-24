import React from 'react';
import Head from 'next/head';
import Layout from '../src/components/Layout';
import { OptionsScreen } from '../src/components/OptionsScreen';
import { useHashSession } from '../src/hooks/useHashSession';

const Options = () => {
  const { session, user, ready } = useHashSession();

  return (
    <>
      <Head>
        <title>Options - Planning Poker</title>
      </Head>
      <Layout>
        {ready ? <OptionsScreen session={session} user={user} /> : null}
      </Layout>
    </>
  );
};

export default Options;
