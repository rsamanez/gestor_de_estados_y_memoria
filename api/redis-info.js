export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const redisUrl = process.env.REDIS_URL;
  
  return res.json({
    hasRedisUrl: !!redisUrl,
    urlLength: redisUrl ? redisUrl.length : 0,
    urlPrefix: redisUrl ? redisUrl.substring(0, 20) + '...' : 'N/A',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}