import React from 'react';
import Head from 'next/head';

// Component for rendering, doing nothing special.
const TestTemplate = ({ serverData }) => {
  const [apiData, setApiData] = React.useState();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch(`https://poker.psykzz.dev/api/time?${params}`).then(res =>
      res.json().then(data => setApiData(data))
    );
  }, []);

  return (
    <>
      <Head>
        <title>SSR Test - Planning Poker</title>
      </Head>
      <pre>{JSON.stringify(serverData, null, 2)}</pre>
      <hr />
      <div style={{ fontSize: '10rem', fontFamily: 'sans-serif' }}>
        {serverData.hours}:{serverData.minutes}:{serverData.seconds}
      </div>
      <hr />
      <div>
        <h4>API Time</h4>
        <pre>{apiData && JSON.stringify(apiData, null, 2)}</pre>
      </div>
      {apiData && (
        <div style={{ fontSize: '10rem', fontFamily: 'sans-serif' }}>
          {apiData.datetime.split('T')[1].split('.')[0]}
        </div>
      )}
    </>
  );
};

export const getServerSideProps = async ({ query, res }) => {
  // Fetch some data
  const params = new URLSearchParams();
  params.set('age', query.age ?? 5);
  params.set('sage', query.sage ?? 15);
  params.set('swr', query.swr ?? 30);
  const data = await (
    await fetch(`https://poker.psykzz.dev/api/time?${params}`)
  ).json();

  // Process it
  const now = new Date(data.datetime);

  // Add cache control headers
  // max-age == browser
  // s-maxage == shared cache (CDN, etc)
  // stale-while-revalidate == time to serve stale request
  res.setHeader(
    'Cache-Control',
    `public, max-age=${query.age ?? 5}, s-maxage=${
      query.sage ?? 15
    }, stale-while-revalidate=${query.swr ?? 30}`
  );

  // Return props
  return {
    props: {
      serverData: {
        time: data.utc_datetime,
        hours: now.getHours(),
        minutes: ('0' + now.getMinutes()).slice(-2),
        seconds: ('0' + now.getSeconds()).slice(-2),
        age: query.age ?? 5,
        sage: query.sage ?? 15,
        swr: query.swr ?? 30,
      }
    }
  };
};

export default TestTemplate;