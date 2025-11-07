import crypto from 'crypto';
import { getStore, setStore } from '../../lib/storage.js';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, expiresIn = '1h' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token JWT requerido' });
    }

    // Generar código corto único (8 caracteres)
    const shortCode = crypto.randomBytes(4).toString('hex');
    
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
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;
    
    return res.json({
      shortCode,
      shortUrl,
      originalUrl: `${protocol}://${host}?token=${token}`,
      expiresAt: expirationTime
    });

  } catch (error) {
    console.error('Error generando URL corta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

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
