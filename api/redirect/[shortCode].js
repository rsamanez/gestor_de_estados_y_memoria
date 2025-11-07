import { getStore, setStore } from '../../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode } = req.query;
    
    if (!shortCode) {
      return res.status(400).json({ error: 'No short code provided' });
    }

    console.log('Processing redirect for shortCode:', shortCode);

    const urlData = await getStore(shortCode);

    if (!urlData) {
      console.log('Short code not found:', shortCode);
      return res.status(404).json({ error: 'Short code not found' });
    }

    console.log('Found URL data for:', shortCode);

    // Verificar si ha expirado
    if (new Date() > new Date(urlData.expiresAt)) {
      console.log('Short code expired:', shortCode);
      return res.status(410).json({ error: 'Short code expired' });
    }

    // Incrementar contador
    urlData.clicks = (urlData.clicks || 0) + 1;
    await setStore(shortCode, urlData);

    // Redirigir
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const redirectUrl = `${protocol}://${host}?token=${urlData.token}`;
    
    console.log('Redirecting to:', redirectUrl);
    
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Error processing short code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}