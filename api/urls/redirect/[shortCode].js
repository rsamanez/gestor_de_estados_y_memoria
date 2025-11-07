import { getStore, setStore } from '../../../lib/storage.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode } = req.query;
    
    if (!shortCode) {
      return res.status(400).send(getErrorPage('Código requerido', 'No se proporcionó código corto.'));
    }

    const urlData = await getStore(shortCode);

    if (!urlData) {
      return res.status(404).send(getErrorPage('Enlace no encontrado', `El código "${shortCode}" no existe o ha expirado.`));
    }

    // Verificar si el código corto ha expirado
    if (new Date() > new Date(urlData.expiresAt)) {
      // Eliminar código expirado (opcional: implementar cleanup job)
      return res.status(410).send(getErrorPage('Enlace expirado', `El código "${shortCode}" ha expirado.`));
    }

    // Incrementar contador de clicks
    urlData.clicks++;
    await setStore(shortCode, urlData);

    // Redirigir a la aplicación con el JWT
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const redirectUrl = `${protocol}://${host}?token=${urlData.token}`;
    
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Error procesando código corto:', error);
    return res.status(500).send(getErrorPage('Error del servidor', 'Error interno del servidor'));
  }
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔗 ${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}
