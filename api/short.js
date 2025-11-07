// Función combinada para manejar URLs cortas con almacenamiento simple
// Esta es una solución temporal hasta implementar Vercel KV o base de datos

import crypto from 'crypto';

// Storage temporal en memoria (se reinicia con cada cold start)
let globalStore = new Map();

export default async function handler(req, res) {
  const { method, query, body } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Crear URL corta (POST)
    if (method === 'POST') {
      const { token, expiresIn = '1h' } = body;

      if (!token) {
        return res.status(400).json({ error: 'Token JWT requerido' });
      }

      // Generar código corto único (8 caracteres)
      const shortCode = crypto.randomBytes(4).toString('hex');
      
      // Calcular tiempo de expiración
      const expirationTime = calculateExpiration(expiresIn);
      
      // Almacenar la relación código -> token
      const urlData = {
        token,
        createdAt: new Date(),
        expiresAt: expirationTime,
        clicks: 0
      };

      globalStore.set(shortCode, urlData);

      // URL corta final
      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const shortUrl = `${protocol}://${host}/api/short?c=${shortCode}`;
      
      console.log(`✅ Created short URL: ${shortCode} -> ${token.substring(0, 20)}...`);
      
      return res.json({
        shortCode,
        shortUrl,
        originalUrl: `${protocol}://${host}?token=${token}`,
        expiresAt: expirationTime
      });
    }

    // Redirección y estadísticas (GET)
    if (method === 'GET') {
      const { c: shortCode, stats } = query;
      
      if (!shortCode) {
        return res.status(400).json({ error: 'Código corto requerido' });
      }

      const urlData = globalStore.get(shortCode);

      if (!urlData) {
        // Si no está en memoria, tal vez se perdió por cold start
        return res.status(404).send(getErrorPage('Enlace no encontrado', 
          `El código "${shortCode}" no existe, ha expirado, o se perdió por reinicio del servidor.`));
      }

      // Verificar si ha expirado
      if (new Date() > new Date(urlData.expiresAt)) {
        globalStore.delete(shortCode);
        return res.status(410).send(getErrorPage('Enlace expirado', 
          `El código "${shortCode}" ha expirado.`));
      }

      // Si pide estadísticas
      if (stats === 'true') {
        return res.json({
          shortCode,
          createdAt: urlData.createdAt,
          expiresAt: urlData.expiresAt,
          clicks: urlData.clicks,
          isExpired: false
        });
      }

      // Incrementar contador y redirigir
      urlData.clicks++;
      globalStore.set(shortCode, urlData);

      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const redirectUrl = `${protocol}://${host}?token=${urlData.token}`;
      
      console.log(`🔗 Redirecting ${shortCode} (click ${urlData.clicks}) to app with token`);
      
      return res.redirect(302, redirectUrl);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Short URL error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Calcula tiempo de expiración basado en string
 */
function calculateExpiration(expiresIn) {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  
  if (!match) {
    return new Date(now.getTime() + 60 * 60 * 1000); // 1 hora por defecto
  }

  const [, amount, unit] = match;
  const multipliers = {
    'm': 60 * 1000,        // minutos
    'h': 60 * 60 * 1000,   // horas
    'd': 24 * 60 * 60 * 1000 // días
  };

  return new Date(now.getTime() + parseInt(amount) * multipliers[unit]);
}

function getErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          text-align: center;
          padding: 50px;
          background: #f5f5f5;
          margin: 0;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.5; }
        .code { 
          background: #f0f0f0; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-family: monospace; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔗 ${title}</h1>
        <p>${message}</p>
        <hr>
        <p><small>Si este enlace debería funcionar, puede que el servidor se haya reiniciado y perdido los datos temporales.</small></p>
      </div>
    </body>
    </html>
  `;
}