import crypto from 'crypto';
import { getStore, setStore } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { state, fileData } = req.body;

    if (!state || !fileData) {
      return res.status(400).json({ error: 'State and fileData required' });
    }

    // Crear un token simple para prueba (sin JWT)
    const token = JSON.stringify({
      state,
      fileData,
      timestamp: Date.now()
    });

    // Generar código corto único
    const shortCode = crypto.randomBytes(4).toString('hex');
    
    // Calcular tiempo de expiración (1 hora)
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Almacenar la relación código -> token
    const urlData = {
      token,
      createdAt: now,
      expiresAt: expirationTime,
      clicks: 0
    };

    console.log('Storing URL data:', { shortCode, urlData });
    await setStore(shortCode, urlData);
    
    // Verificar que se guardó correctamente
    const verification = await getStore(shortCode);
    console.log('Verification after save:', verification);

    // Construir URL corta
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const shortUrl = `${protocol}://${host}/api/r?code=${shortCode}`;

    console.log('Created short URL:', shortUrl);

    return res.status(201).json({
      success: true,
      shortCode,
      shortUrl,
      expiresAt: expirationTime.toISOString()
    });

  } catch (error) {
    console.error('Error creating URL:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}