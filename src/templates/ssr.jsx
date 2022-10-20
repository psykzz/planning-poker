import React from 'react';

const TestTemplate = ({ serverData }) => {
  return <>
    <pre>{JSON.stringify(serverData, null, 2)}</pre>
    <hr />
    <div style={{}}>{serverData.hours}:{serverData.minutes}</div>
  </>;
};

export const getServerData = async () => {
  const data = await (
    await fetch('http://worldtimeapi.org/api/timezone/Europe/Dublin')
  ).json();
    
  const date = new Date(data.utc_datetime);
  
  return {
    props: {
      time: data.utc_datetime,
      hours: date.getHours(),
      minutes: date.getMinutes(),
    },
    headers: {
      'Cache-Control':
        'public, max-age=5, s-maxage=15, stale-while-revalidate=30',
    },
  };
};

export default TestTemplate;
