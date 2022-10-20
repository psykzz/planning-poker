import React from 'react';

const TestTemplate = ({ serverData }) => {
  return <pre>{JSON.stringify(serverData, null, 2)}</pre>;
};

export const getServerData = async () => {
  const data = await (
    await fetch('http://worldtimeapi.org/api/timezone/Europe/Dublin')
  ).json();
  return {
    props: {
      time: data.utc_datetime,
    },
    headers: {
      'Cache-Control':
        'public, max-age=5, s-maxage=30, stale-while-revalidate=60',
    },
  };
};

export default TestTemplate;
