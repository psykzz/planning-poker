import React from 'react';

// Component for rendering, doing nothing special.
const TestTemplate = ({ serverData }) => {
  return (
    <>
      <pre>{JSON.stringify(serverData, null, 2)}</pre>
      <hr />
      <div style={{ fontSize: '10rem', fontFamily: 'sans-serif' }}>
        {serverData.hours}:{serverData.minutes}:{serverData.seconds}
      </div>
    </>
  );
};

export const getServerData = async ({ query }) => {
  // Fetch some data
  const data = await (await fetch('https://poker.psykzz.dev/api/time')).json();

  // Process it
  const now = new Date(data.datetime);

  // Return object with optional { props, headers, status }
  return {
    props: {
      time: data.utc_datetime,
      hours: now.getHours(),
      minutes: ('0' + now.getMinutes()).slice(-2),
      seconds: ('0' + now.getSeconds()).slice(-2),

      age: query.age ?? 5,
      sage: query.sage ?? 15,
      swr: query.swr ?? 30,
    },

    // Add cache control headers
    // max-age == browser
    // s-maxage == shared cache (CDN, etc)
    // state-while-revalidate == time to serve stale request
    headers: {
      'Cache-Control': `public, max-age=${query.age ?? 5}, s-maxage=${
        query.sage ?? 15
      }, stale-while-revalidate=${query.swr ?? 30}`,
    },
  };
};

export default TestTemplate;
