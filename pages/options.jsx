import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { OptionsScreen } from '../src/components/OptionsScreen';
import { getStoredUser } from '../src/utils/userStorage';

const Options = () => {
  const router = useRouter();
  const [session, setSession] = React.useState('');
  const [user, setUser] = React.useState();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hashSession = window.location.hash.slice(1);
    const storedUser = getStoredUser();
    const hasUser = Boolean(storedUser?.id && storedUser?.name);

    if (!hashSession) {
      router.replace('/voting');
      return;
    }

    if (!hasUser) {
      router.replace(`/voting#${hashSession}`);
      return;
    }

    setSession(hashSession);
    setUser(storedUser);
    setReady(true);
  }, [router]);

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
