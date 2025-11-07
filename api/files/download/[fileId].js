import { AWS } from '../../../lib/aws-config.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.query;
    
    if (!fileId) {
      return res.status(400).json({ 
        success: false, 
        error: 'File ID is required' 
      });
    }

    const s3 = new AWS.S3();
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;

    if (!BUCKET_NAME) {
      return res.status(500).json({ 
        success: false, 
        error: 'S3 bucket not configured' 
      });
    }
    
    console.log('⬇️ Generating download URL for:', fileId);

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: decodeURIComponent(fileId),
      Expires: 3600 // URL válida por 1 hora
    };

    const downloadUrl = s3.getSignedUrl('getObject', s3Params);

    return res.json({
      success: true,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('❌ Download URL error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error generating download URL'
    });
  }
}
