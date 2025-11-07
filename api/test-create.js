import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getStore, setStore } from '../../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { state, fileData, expiresIn = '1h' } = req.body;

    if (!state || !fileData) {
      return res.status(400).json({ error: 'State and fileData required' });
    }

    // Generar JWT para prueba
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    const token = jwt.sign({
      state,
      fileData,
      timestamp: Date.now()
    }, jwtSecret, { expiresIn: '24h' });

    // Generar código corto único
    const shortCode = crypto.randomBytes(4).toString('hex');
    
    // Calcular tiempo de expiración
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora
    
    // Almacenar la relación código -> token
    const urlData = {
      token,
      createdAt: now,
      expiresAt: expirationTime,
      clicks: 0
    };

    await setStore(shortCode, urlData);

    // Construir URL corta
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;

    console.log('Created short URL:', shortUrl);

    return res.status(201).json({
      success: true,
      shortCode,
      shortUrl,
      expiresAt: expirationTime.toISOString()
    });

  } catch (error) {
    console.error('Error creating URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}