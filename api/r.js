import { getStore, setStore } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No code parameter provided' });
    }

    console.log('Processing redirect for code:', code);

    const urlData = await getStore(code);

    if (!urlData) {
      console.log('Code not found:', code);
      return res.status(404).json({ error: 'Code not found' });
    }

    console.log('Found URL data for:', code);

    // Verificar si ha expirado
    if (new Date() > new Date(urlData.expiresAt)) {
      console.log('Code expired:', code);
      return res.status(410).json({ error: 'Code expired' });
    }

    // Incrementar contador
    urlData.clicks = (urlData.clicks || 0) + 1;
    await setStore(code, urlData);

    // Redirigir
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const redirectUrl = `${protocol}://${host}?token=${urlData.token}`;
    
    console.log('Redirecting to:', redirectUrl);
    
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Error processing code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}