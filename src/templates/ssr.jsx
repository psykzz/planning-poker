import React from 'react';

// Component for rendering, doing nothing special.
const TestTemplate = ({ serverData }) => {
  return <>
    <pre>{JSON.stringify(serverData, null, 2)}</pre>
    <hr />
    <div style={{}}>{serverData.hours}:{serverData.minutes}</div>
  </>;
};

export const getServerData = async ({ query }) => {
  // Fetch some data
  const data = await (
    await fetch('http://worldtimeapi.org/api/timezone/Europe/Dublin')
  ).json();
    
  
  // Process it
  const date = new Date(data.datetime);
  
  // Return object with optional { props, headers, status } 
  return {
    props: {
      time: data.utc_datetime,
      hours: date.getHours(),
      minutes: date.getMinutes(),
    },
    
    // Add cache control headers
    // max-age == browser
    // s-maxage == shared cache (CDN, etc)
    // state-while-revalidate == time to serve stale request
    headers: {
      'Cache-Control':
        `public, max-age=${query.age ?? 5}, s-maxage=${query.sage ?? 15}, stale-while-revalidate=${query.swr ?? 30}`,
    },
  };
};

export default TestTemplate;
