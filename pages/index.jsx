import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Index = () => {
  const router = useRouter();

  React.useEffect(() => {
    const hash = window.location.hash || '';
    router.replace(`/voting${hash}`);
  }, [router]);

  return (
    <>
      <Head>
        <title>Planning Poker</title>
      </Head>
    </>
  );
};

export default Index;
