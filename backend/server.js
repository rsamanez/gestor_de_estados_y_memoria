const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server
  credentials: true
}));
app.use(express.json());

// Configurar AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Configurar Multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo
  }
});

// Función para generar nombre único de archivo
const generateFileName = (originalName, stateId) => {
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  const extension = originalName.split('.').pop();
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `state-${stateId}/${timestamp}-${uuid}-${cleanName}`;
};

// Endpoint para subir archivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📁 Received upload request:', {
      filename: req.file?.originalname,
      size: req.file?.size,
      stateId: req.body.stateId
    });

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    if (!req.body.stateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'State ID is required' 
      });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const { stateId } = req.body;
    const fileName = generateFileName(originalname, stateId);

    // Parámetros para S3
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype,
      Metadata: {
        'original-name': originalname,
        'state-id': stateId.toString(),
        'upload-timestamp': Date.now().toString(),
        'file-size': size.toString()
      }
    };

    console.log('☁️ Uploading to S3:', fileName);

    // Subir a S3
    const s3Response = await s3.upload(s3Params).promise();

    console.log('✅ S3 upload successful:', s3Response.Location);

    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        fileId: fileName,
        fileName: originalname,
        s3Url: s3Response.Location,
        s3Key: s3Response.Key,
        size: size,
        contentType: mimetype,
        stateId: parseInt(stateId),
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during upload'
    });
  }
});

// Endpoint para obtener archivos por estado
app.get('/api/files/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
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

    res.json({
      success: true,
      data: filesWithMetadata
    });

  } catch (error) {
    console.error('❌ Error getting files:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error getting files'
    });
  }
});

// Endpoint para eliminar archivo
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log('🗑️ Deleting file:', fileId);

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: decodeURIComponent(fileId)
    };

    await s3.deleteObject(s3Params).promise();

    console.log('✅ File deleted successfully:', fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during deletion'
    });
  }
});

// Endpoint para generar URL de descarga
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log('⬇️ Generating download URL for:', fileId);

    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: decodeURIComponent(fileId),
      Expires: 3600 // URL válida por 1 hora
    };

    const downloadUrl = s3.getSignedUrl('getObject', s3Params);

    res.json({
      success: true,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('❌ Download URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error generating download URL'
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'File Manager API is running',
    timestamp: new Date().toISOString(),
    s3Configured: !!BUCKET_NAME
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 File Manager API running on port ${PORT}`);
  console.log(`📁 S3 Bucket: ${BUCKET_NAME || 'NOT CONFIGURED'}`);
  console.log(`🌍 CORS enabled for: http://localhost:5173, http://localhost:5174`);
});
