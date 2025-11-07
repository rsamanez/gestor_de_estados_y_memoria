import { AWS } from '../lib/aws-config.js';
import { generateFileName } from '../lib/utils.js';
import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('📁 Received upload request');

    const s3 = new AWS.S3();
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;

    if (!BUCKET_NAME) {
      return res.status(500).json({ 
        success: false, 
        error: 'S3 bucket not configured' 
      });
    }

    // Configurar formidable para manejar archivos
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      keepExtensions: true,
    });

    // Parsear el formulario
    const [fields, files] = await form.parse(req);
    
    const file = files.file ? files.file[0] : null;
    const stateId = fields.stateId ? fields.stateId[0] : null;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    if (!stateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'State ID is required' 
      });
    }

    console.log('📁 Processing file:', {
      filename: file.originalFilename,
      size: file.size,
      stateId
    });

    // Leer el archivo
    const buffer = fs.readFileSync(file.filepath);
    const fileName = generateFileName(file.originalFilename, stateId);

    // Parámetros para S3
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-name': file.originalFilename,
        'state-id': stateId.toString(),
        'upload-timestamp': Date.now().toString(),
        'file-size': file.size.toString()
      }
    };

    console.log('☁️ Uploading to S3:', fileName);

    // Subir a S3
    const s3Response = await s3.upload(s3Params).promise();

    console.log('✅ S3 upload successful:', s3Response.Location);

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    // Respuesta exitosa
    return res.json({
      success: true,
      data: {
        fileId: fileName,
        fileName: file.originalFilename,
        s3Url: s3Response.Location,
        s3Key: s3Response.Key,
        size: file.size,
        contentType: file.mimetype,
        stateId: parseInt(stateId),
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during upload'
    });
  }
}

// Configuración para deshabilitar el parser por defecto de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
