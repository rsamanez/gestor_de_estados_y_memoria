// Vercel KV Storage para URLs cortas
// Usa Vercel KV en producción, fallback a memoria en desarrollo

let store = new Map(); // Fallback para desarrollo local
let kv = null;

// Inicializar KV solo en Vercel (cuando las variables están disponibles)
const isVercelEnvironment = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

if (isVercelEnvironment) {
  try {
    const { kv: vercelKv } = await import('@vercel/kv');
    kv = vercelKv;
    console.log('✅ Vercel KV initialized');
  } catch (error) {
    console.warn('⚠️ Vercel KV not available, using memory store:', error.message);
  }
}

/**
 * Obtiene un valor del store
 */
export async function getStore(key) {
  if (kv) {
    try {
      const result = await kv.get(`short-url:${key}`);
      return result;
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }
  
  // Fallback a memoria
  return store.get(key);
}

/**
 * Guarda un valor en el store
 */
export async function setStore(key, value) {
  if (kv) {
    try {
      // Calcular TTL en segundos
      const expiresAt = new Date(value.expiresAt);
      const now = new Date();
      const ttlSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      await kv.set(`short-url:${key}`, value, { ex: ttlSeconds });
      console.log(`✅ Stored ${key} in KV with TTL ${ttlSeconds}s`);
      return true;
    } catch (error) {
      console.error('KV set error:', error);
      return false;
    }
  }
  
  // Fallback a memoria
  store.set(key, value);
  return true;
}

/**
 * Elimina un valor del store
 */
export async function deleteStore(key) {
  if (kv) {
    try {
      await kv.del(`short-url:${key}`);
      return true;
    } catch (error) {
      console.error('KV delete error:', error);
      return false;
    }
  }
  
  // Fallback a memoria
  return store.delete(key);
}

/**
 * Limpia entradas expiradas (llamar periódicamente)
 * En KV esto se maneja automáticamente con TTL
 */
export async function cleanupExpired() {
  if (kv) {
    // En KV las entradas expiran automáticamente
    console.log('KV handles expiration automatically');
    return 0;
  }
  
  // Cleanup para memoria local
  const now = new Date();
  let cleaned = 0;
  
  for (const [key, value] of store.entries()) {
    if (value.expiresAt && new Date(value.expiresAt) < now) {
      store.delete(key);
      cleaned++;
    }
  }
  
  console.log(`Limpiadas ${cleaned} entradas expiradas`);
  return cleaned;
}

/**
 * Obtener información del storage
 */
export function getStorageInfo() {
  return {
    type: kv ? 'Vercel KV' : 'Memory',
    isProduction: !!kv,
    environment: process.env.NODE_ENV || 'development'
  };
}
