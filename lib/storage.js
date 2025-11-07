// En producción, esto se podría reemplazar por Vercel KV, Redis, o una base de datos
// Por ahora usamos un Map en memoria (se reinicia con cada cold start)

const store = new Map();

/**
 * Obtiene un valor del store
 */
export async function getStore(key) {
  return store.get(key);
}

/**
 * Guarda un valor en el store
 */
export async function setStore(key, value) {
  store.set(key, value);
  return true;
}

/**
 * Elimina un valor del store
 */
export async function deleteStore(key) {
  return store.delete(key);
}

/**
 * Limpia entradas expiradas (llamar periódicamente)
 */
export async function cleanupExpired() {
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

// NOTA: Para producción, considera migrar a:
// - Vercel KV: https://vercel.com/docs/storage/vercel-kv
// - Redis: https://redis.io/
// - Base de datos: PostgreSQL, MongoDB, etc.
