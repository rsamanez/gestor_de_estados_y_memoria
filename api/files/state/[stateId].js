import { AWS } from '../../../lib/aws-config.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { stateId } = req.query;
    
    if (!stateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'State ID is required' 
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

    const prefix = `state-${stateId}/`;

    console.log('📋 Getting files for state:', stateId);

    const s3Params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix
    };

    const s3Response = await s3.listObjectsV2(s3Params).promise();
    
    // Obtener metadatos de cada archivo
    const filesWithMetadata = await Promise.all(
      s3Response.Contents.map(async (obj) => {
        try {
          const headParams = {
            Bucket: BUCKET_NAME,
            Key: obj.Key
          };
          
          const headResponse = await s3.headObject(headParams).promise();
          
          return {
            fileId: obj.Key,
            fileName: headResponse.Metadata['original-name'] || obj.Key.split('/').pop(),
            s3Key: obj.Key,
            size: obj.Size,
            contentType: headResponse.ContentType,
            stateId: parseInt(headResponse.Metadata['state-id'] || stateId),
            uploadedAt: headResponse.Metadata['upload-timestamp'] 
              ? new Date(parseInt(headResponse.Metadata['upload-timestamp'])).toISOString()
              : obj.LastModified.toISOString(),
            lastModified: obj.LastModified
          };
        } catch (error) {
          console.warn('⚠️ Error getting metadata for:', obj.Key, error.message);
          return {
            fileId: obj.Key,
            fileName: obj.Key.split('/').pop(),
            s3Key: obj.Key,
            size: obj.Size,
            stateId: parseInt(stateId),
            uploadedAt: obj.LastModified.toISOString(),
            lastModified: obj.LastModified
          };
        }
      })
    );

    console.log(`✅ Found ${filesWithMetadata.length} files for state ${stateId}`);

    return res.json({
      success: true,
      data: filesWithMetadata
    });

  } catch (error) {
    console.error('❌ Error getting files:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error getting files'
    });
  }
}
