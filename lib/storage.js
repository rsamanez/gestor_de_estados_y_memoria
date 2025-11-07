// Redis Storage para URLs cortas
// Usa Redis en producción, fallback a memoria en desarrollo

let store = new Map(); // Fallback para desarrollo local
let redis = null;

// Inicializar Redis usando las variables de entorno
const redisUrl = process.env.REDIS_PRUEBA_REDIS_URL || process.env.REDIS_URL;

console.log('🔧 Redis Environment Check:', {
  hasRedisUrl: !!redisUrl,
  urlPrefix: redisUrl ? redisUrl.substring(0, 30) + '...' : 'N/A'
});

if (redisUrl) {
  try {
    const { createClient } = await import('redis');
    redis = createClient({
      url: redisUrl
    });
    
    redis.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });
    
    await redis.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, using memory store:', error.message);
    redis = null;
  }
} else {
  console.log('📝 Using memory store (Redis not configured)');
}

/**
 * Obtiene un valor del store
 */
export async function getStore(key) {
  console.log(`🔍 getStore called with key: ${key}, redis available: ${!!redis}`);
  
  if (redis) {
    try {
      const redisKey = `short-url:${key}`;
      console.log(`📖 Attempting to read from Redis: ${redisKey}`);
      
      const result = await redis.get(redisKey);
      console.log(`📄 Redis GET result for ${key}:`, result ? 'FOUND' : 'NOT FOUND');
      
      if (result) {
        try {
          return JSON.parse(result);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Redis get error:', error);
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
  console.log(`🔄 setStore called with key: ${key}, redis available: ${!!redis}`);
  
  if (redis) {
    try {
      // Calcular TTL en segundos
      const expiresAt = new Date(value.expiresAt);
      const now = new Date();
      const ttlSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      console.log(`📝 Attempting to store in Redis: key=${key}, ttl=${ttlSeconds}s`);
      
      const redisKey = `short-url:${key}`;
      const serializedValue = JSON.stringify(value);
      
      // Usar setEx para establecer valor con expiración
      await redis.setEx(redisKey, ttlSeconds, serializedValue);
      console.log(`✅ Redis SETEX completed for ${key}`);
      
      // Verificar inmediatamente que se guardó
      const verification = await redis.get(redisKey);
      console.log(`🔍 Immediate verification for ${key}:`, verification ? 'FOUND' : 'NOT FOUND');
      
      return true;
    } catch (error) {
      console.error('❌ Redis set error:', error);
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
  const redisUrl = process.env.REDIS_PRUEBA_REDIS_URL || process.env.REDIS_URL;
  return {
    type: redis ? 'Redis' : 'Memory',
    isProduction: !!redis,
    redisConfigured: !!redisUrl,
    environment: process.env.NODE_ENV || 'development'
  };
}
