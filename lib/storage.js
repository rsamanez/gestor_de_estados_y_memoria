// Vercel KV Storage para URLs cortas
// Usa KV en producción, fallback a memoria en desarrollo

let store = new Map(); // Fallback para desarrollo local
let kv = null;

// Inicializar Vercel KV en producción
const isVercelEnvironment = process.env.VERCEL_ENV;

if (isVercelEnvironment) {
  try {
    const vercelKv = await import('@vercel/kv');
    kv = vercelKv.kv;
    console.log('✅ Vercel KV initialized successfully');
  } catch (error) {
    console.warn('⚠️ Vercel KV initialization failed, using memory store:', error.message);
    kv = null;
  }
} else {
  console.log('📝 Using memory store (local development)');
}

/**
 * Obtiene un valor del store
 */
export async function getStore(key) {
  console.log(`🔍 getStore called with key: ${key}, kv available: ${!!kv}`);
  
  if (kv) {
    try {
      const kvKey = `short-url:${key}`;
      console.log(`📖 Attempting to read from KV: ${kvKey}`);
      
      const result = await kv.get(kvKey);
      console.log(`📄 KV GET result for ${key}:`, result ? 'FOUND' : 'NOT FOUND');
      
      return result;
    } catch (error) {
      console.error('❌ KV get error:', error);
      return null;
    }
  }
  
  // Fallback a memoria
  console.log(`💾 Using memory store for key: ${key}`);
  return store.get(key);
}

/**
 * Guarda un valor en el store
 */
export async function setStore(key, value) {
  console.log(`🔄 setStore called with key: ${key}, kv available: ${!!kv}`);
  
  if (kv) {
    try {
      // Calcular TTL en segundos
      const expiresAt = new Date(value.expiresAt);
      const now = new Date();
      const ttlSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      console.log(`📝 Attempting to store in KV: key=${key}, ttl=${ttlSeconds}s`);
      
      const kvKey = `short-url:${key}`;
      
      await kv.set(kvKey, value);
      await kv.expire(kvKey, ttlSeconds);
      
      console.log(`✅ KV SET completed for ${key}`);
      
      // Verificar inmediatamente que se guardó
      const verification = await kv.get(kvKey);
      console.log(`🔍 Immediate verification for ${key}:`, verification ? 'FOUND' : 'NOT FOUND');
      
      return true;
    } catch (error) {
      console.error('❌ KV set error:', error);
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
 * En Redis esto se maneja automáticamente con TTL
 */
export async function cleanupExpired() {
  if (redis) {
    // En Redis las entradas expiran automáticamente
    console.log('Redis handles expiration automatically');
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
    kvConfigured: !!process.env.VERCEL_ENV,
    environment: process.env.NODE_ENV || 'development'
  };
}
