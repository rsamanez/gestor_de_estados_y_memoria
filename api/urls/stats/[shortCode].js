import { getStore } from '../../../lib/storage.js';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode } = req.query;
    
    if (!shortCode) {
      return res.status(400).json({ error: 'Código corto requerido' });
    }

    const urlData = await getStore(shortCode);

    if (!urlData) {
      return res.status(404).json({ error: 'Código no encontrado' });
    }

    return res.json({
      shortCode,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      clicks: urlData.clicks,
      isExpired: new Date() > new Date(urlData.expiresAt)
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
