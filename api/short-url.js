import crypto from 'crypto';
import { getStore, setStore } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('� Creating short URL via /api/short-url...');
    console.log('�🔧 Environment check - REDIS_URL exists:', !!process.env.REDIS_URL);
    
    const { token, expiresIn = '1h' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token JWT requerido' });
    }

    // Validar que el token tiene el formato JWT básico
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return res.status(400).json({ error: 'Formato de token JWT inválido' });
    }
    
    // Generar código corto único (8 caracteres)
    const shortCode = crypto.randomBytes(4).toString('hex');
    
    // Calcular tiempo de expiración basado en expiresIn
    const expirationTime = calculateExpiration(expiresIn);
    
    // Almacenar la relación código -> token
    const urlData = {
      token,
      createdAt: new Date(),
      expiresAt: expirationTime,
      clicks: 0
    };

    console.log('🚀 About to store URL data:', { shortCode, urlData });
    
    const storeResult = await setStore(shortCode, urlData);
    console.log('📊 Store operation result:', storeResult);
    
    // Verificar que se guardó correctamente
    console.log('🔄 Immediate verification...');
    const verification = await getStore(shortCode);
    console.log('✅ Verification after save:', verification ? 'SUCCESS' : 'FAILED', verification);

    // Construir URLs
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    
    const shortUrl = `${protocol}://${host}/api/s/${shortCode}`;
    const originalUrl = `${protocol}://${host.replace(/:\d+/, ':5173')}?token=${token}`;

    console.log('✨ Created short URL:', shortUrl);

    return res.status(200).json({
      shortCode,
      shortUrl,
      originalUrl,
      expiresAt: expirationTime.toISOString()
    });

  } catch (error) {
    console.error('❌ Error creating short URL:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
}

/**
 * Calcula el tiempo de expiración basado en el string de tiempo
 */
function calculateExpiration(expiresIn) {
  const now = new Date();
  const timeUnits = {
    'm': 60 * 1000,        // minutos
    'h': 60 * 60 * 1000,   // horas
    'd': 24 * 60 * 60 * 1000 // días
  };

  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (match) {
    const [, amount, unit] = match;
    const milliseconds = parseInt(amount) * timeUnits[unit];
    return new Date(now.getTime() + milliseconds);
  }
  
  // Por defecto 1 hora si no se puede parsear
  return new Date(now.getTime() + 60 * 60 * 1000);
}