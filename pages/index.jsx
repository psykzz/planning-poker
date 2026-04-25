import React from 'react';
import { useRouter } from 'next/router';
import LandingPage from '../src/components/LandingPage';

const Index = () => {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const hash = window.location.hash || '';
    if (hash) {
      router.replace(`/voting${hash}`);
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return <LandingPage />;
};

export default Index;
