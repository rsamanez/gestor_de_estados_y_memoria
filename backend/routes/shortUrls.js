const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// Almacenamiento en memoria (en producción usar Redis o base de datos)
const shortUrlStore = new Map();

/**
 * POST /api/short-url
 * Genera un código corto para un JWT
 */
router.post('/short-url', (req, res) => {
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
    shortUrlStore.set(shortCode, {
      token,
      createdAt: new Date(),
      expiresAt: expirationTime,
      clicks: 0
    });

    // URL corta final
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;
    
    res.json({
      shortCode,
      shortUrl,
      originalUrl: `http://localhost:5173?token=${token}`,
      expiresAt: expirationTime
    });

  } catch (error) {
    console.error('Error generando URL corta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /s/:shortCode
 * Redirige del código corto a la URL completa con JWT
 */
router.get('/s/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = shortUrlStore.get(shortCode);

    if (!urlData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Enlace no encontrado</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🔗 Enlace no encontrado</h1>
          <p>El código "${shortCode}" no existe o ha expirado.</p>
        </body>
        </html>
      `);
    }

    // Verificar si el código corto ha expirado
    if (new Date() > urlData.expiresAt) {
      shortUrlStore.delete(shortCode);
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Enlace expirado</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>⏰ Enlace expirado</h1>
          <p>El código "${shortCode}" ha expirado.</p>
        </body>
        </html>
      `);
    }

    // Incrementar contador de clicks
    urlData.clicks++;

    // Redirigir a la aplicación con el JWT
    const redirectUrl = `http://localhost:5173?token=${urlData.token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error procesando código corto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

/**
 * GET /api/short-url/:shortCode/stats
 * Estadísticas del código corto
 */
router.get('/short-url/:shortCode/stats', (req, res) => {
  const { shortCode } = req.params;
  const urlData = shortUrlStore.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Código no encontrado' });
  }

  res.json({
    shortCode,
    createdAt: urlData.createdAt,
    expiresAt: urlData.expiresAt,
    clicks: urlData.clicks,
    isExpired: new Date() > urlData.expiresAt
  });
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

// Limpieza automática de códigos expirados cada 10 minutos
setInterval(() => {
  const now = new Date();
  for (const [code, data] of shortUrlStore.entries()) {
    if (now > data.expiresAt) {
      shortUrlStore.delete(code);
      console.log(`Código expirado eliminado: ${code}`);
    }
  }
}, 10 * 60 * 1000);

module.exports = router;
