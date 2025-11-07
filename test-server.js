// Servidor simple para probar las funciones API localmente
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { default: handler } = await import('./api/health.js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload
app.post('/api/upload', async (req, res) => {
  try {
    const { default: handler } = await import('./api/upload.js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get files by state
app.get('/api/files/state/:stateId', async (req, res) => {
  try {
    // Importar dependencias manualmente
    const { AWS } = await import('./lib/aws-config.js');
    
    const stateId = req.params.stateId;
    
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
});

// Delete file
app.delete('/api/files/delete/:fileId', async (req, res) => {
  try {
    const { default: handler } = await import('./api/files/delete/[fileId].js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/api/files/download/:fileId', async (req, res) => {
  try {
    const { default: handler } = await import('./api/files/download/[fileId].js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create short URL
app.post('/api/urls/create', async (req, res) => {
  try {
    const { getStore, setStore } = await import('./lib/storage.js');
    const crypto = await import('crypto');
    
    const { token, expiresIn = '1h' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token JWT requerido' });
    }

    // Generar código corto único (8 caracteres)
    const shortCode = crypto.default.randomBytes(4).toString('hex');
    
    // Calcular tiempo de expiración del código corto
    const expirationTime = calculateExpiration(expiresIn);
    
    // Almacenar la relación código -> token
    const urlData = {
      token,
      createdAt: new Date(),
      expiresAt: expirationTime,
      clicks: 0
    };

    await setStore(shortCode, urlData);

    // URL corta final - en producción usará el dominio de Vercel
    const host = req.headers.host || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;
    
    return res.json({
      shortCode,
      shortUrl,
      originalUrl: `${protocol}://${host}?token=${token}`,
      expiresAt: expirationTime
    });

    /**
     * Calcula tiempo de expiración basado en string
     */
    function calculateExpiration(expiresIn) {
      const now = new Date();
      const match = expiresIn.match(/^(\d+)([mhd])$/);
      
      if (!match) {
        // Por defecto 1 hora
        return new Date(now.getTime() + 60 * 60 * 1000);
      }

      const [, amount, unit] = match;
      const multipliers = {
        'm': 60 * 1000,        // minutos
        'h': 60 * 60 * 1000,   // horas
        'd': 24 * 60 * 60 * 1000 // días
      };

      return new Date(now.getTime() + parseInt(amount) * multipliers[unit]);
    }

  } catch (error) {
    console.error('Error generando URL corta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Redirect short URL
app.get('/s/:shortCode', async (req, res) => {
  try {
    const { default: handler } = await import('./api/urls/redirect/[shortCode].js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Short URL stats
app.get('/api/urls/stats/:shortCode', async (req, res) => {
  try {
    const { default: handler } = await import('./api/urls/stats/[shortCode].js');
    await handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Frontend running on: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('');
  console.log('📊 Configuration:');
  console.log(`   AWS Region: ${process.env.AWS_REGION || 'Not configured'}`);
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME || 'Not configured'}`);
  console.log(`   AWS Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});