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
    s3Configured: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
    kvConfigured: !!process.env.VERCEL_ENV,
    storage: getStorageInfo(),
    environment: process.env.NODE_ENV || 'development'
  });
}
