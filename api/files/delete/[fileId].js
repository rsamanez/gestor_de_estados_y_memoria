import { AWS } from '../../../lib/aws-config.js';

export default async function handler(req, res) {
  // Solo permitir DELETE
  if (req.method !== 'DELETE') {
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
    
    console.log('🗑️ Deleting file:', fileId);

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: decodeURIComponent(fileId)
    };

    await s3.deleteObject(s3Params).promise();

    console.log('✅ File deleted successfully:', fileId);

    return res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during deletion'
    });
  }
}