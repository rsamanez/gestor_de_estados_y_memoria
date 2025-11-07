export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Importar info del storage dinámicamente
  let storageInfo = { type: 'Unknown', isProduction: false };
  try {
    const { getStorageInfo } = await import('../lib/storage.js');
    storageInfo = getStorageInfo();
  } catch (error) {
    console.warn('Could not get storage info:', error.message);
  }

  return res.json({
    success: true,
    message: 'File Manager API is running on Vercel',
    timestamp: new Date().toISOString(),
    s3Configured: !!process.env.S3_BUCKET_NAME,
    redisConfigured: !!process.env.REDIS_URL,
    storage: storageInfo,
    environment: process.env.NODE_ENV || 'development'
  });
}
