// Vercel Redis Storage para URLs cortas
// Usa Redis en producción, fallback a memoria en desarrollo

let store = new Map(); // Fallback para desarrollo local
let redis = null;

// Inicializar Redis cuando REDIS_URL está disponible
const isRedisEnvironment = process.env.REDIS_URL;

if (isRedisEnvironment) {
  try {
    const { Redis } = await import('@upstash/redis');
    redis = Redis.fromEnv();
    console.log('✅ Redis initialized with REDIS_URL');
  } catch (error) {
    console.warn('⚠️ Redis not available, using memory store:', error.message);
  }
}

/**
 * Obtiene un valor del store
 */
export async function getStore(key) {
  if (redis) {
    try {
      const result = await redis.get(`short-url:${key}`);
      return result;
    } catch (error) {
      console.error('Redis get error:', error);
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
  if (redis) {
    try {
      // Calcular TTL en segundos
      const expiresAt = new Date(value.expiresAt);
      const now = new Date();
      const ttlSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      await redis.set(`short-url:${key}`, JSON.stringify(value), { ex: ttlSeconds });
      console.log(`✅ Stored ${key} in Redis with TTL ${ttlSeconds}s`);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
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
  if (redis) {
    try {
      await redis.del(`short-url:${key}`);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
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
    type: redis ? 'Vercel Redis' : 'Memory',
    isProduction: !!redis,
    redisConfigured: !!process.env.REDIS_URL,
    environment: process.env.NODE_ENV || 'development'
  };
}
