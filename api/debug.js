import { getStore } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Code parameter required' });
    }

    console.log('Debug - checking code:', code);

    const data = await getStore(code);
    
    console.log('Debug - retrieved data:', data);

    return res.json({
      code,
      exists: !!data,
      data: data || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      error: 'Debug error',
      message: error.message,
      stack: error.stack
    });
  }
}