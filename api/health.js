export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  return res.json({
    success: true,
    message: 'File Manager API is running on Vercel',
    timestamp: new Date().toISOString(),
    s3Configured: !!process.env.S3_BUCKET_NAME,
    environment: process.env.NODE_ENV || 'development'
  });
}
