import fetch from 'cross-fetch';

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=${req.query.age ?? 5}, s-maxage=${
      req.query.sage ?? 15
    }, stale-while-revalidate=${req.query.swr ?? 30}`
  );

  const data = await (
    await fetch('http://worldtimeapi.org/api/timezone/Europe/Dublin')
  ).json();

  res.status(200).json(data);
}
