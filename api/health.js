export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Si se pide test de S3
  if (req.query.test === 's3') {
    return await testS3Connection(req, res);
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
    redisConfigured: !!(process.env.REDIS_PRUEBA_REDIS_URL || process.env.REDIS_URL),
    storage: storageInfo,
    environment: process.env.NODE_ENV || 'development'
  });
}

async function testS3Connection(req, res) {
  try {
    const { AWS } = await import('../lib/aws-config.js');
    
    console.log('🔧 Testing S3 connection...');
    
    const envCheck = {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
    };

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(500).json({
        error: 'AWS credentials not configured',
        envCheck
      });
    }

    const s3 = new AWS.S3();
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;

    if (!BUCKET_NAME) {
      return res.status(500).json({
        error: 'S3_BUCKET_NAME not configured',
        envCheck
      });
    }

    const listParams = {
      Bucket: BUCKET_NAME,
      MaxKeys: 3
    };

    const listResult = await s3.listObjectsV2(listParams).promise();
    
    return res.status(200).json({
      success: true,
      message: 'S3 connection successful',
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      objectCount: listResult.Contents ? listResult.Contents.length : 0,
      envCheck
    });

  } catch (error) {
    console.error('❌ S3 connection error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
}
