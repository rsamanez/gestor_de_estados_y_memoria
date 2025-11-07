# 🧠 Concepto Avanzado: Persistencia de URLs Cortas

## Arquitectura de Persistencia

### 1. Almacenamiento Actual (Desarrollo)
```javascript
// En memoria - Map de JavaScript
const shortUrlStore = new Map();

// Estructura de datos:
{
  'abc12345': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    createdAt: '2025-11-07T10:00:00.000Z',
    expiresAt: '2025-11-07T12:00:00.000Z',
    clicks: 5
  }
}
```

### 2. Propuesta para Producción

#### A. Redis (Recomendado)
```javascript
const redis = require('redis');
const client = redis.createClient();

// Crear URL corta
async function createShortUrl(token, expiresIn) {
  const shortCode = generateCode();
  const data = {
    token,
    createdAt: new Date().toISOString(),
    expiresAt: calculateExpiration(expiresIn),
    clicks: 0
  };
  
  // Almacenar con TTL automático
  await client.setex(
    `short:${shortCode}`, 
    getTTLSeconds(expiresIn), 
    JSON.stringify(data)
  );
  
  return shortCode;
}

// Incrementar clicks
async function incrementClicks(shortCode) {
  const key = `short:${shortCode}`;
  const data = JSON.parse(await client.get(key));
  
  if (data) {
    data.clicks++;
    await client.setex(key, await client.ttl(key), JSON.stringify(data));
  }
  
  return data;
}
```

#### B. Base de Datos SQL
```sql
CREATE TABLE short_urls (
  short_code VARCHAR(8) PRIMARY KEY,
  jwt_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  clicks INTEGER DEFAULT 0,
  INDEX idx_expires_at (expires_at)
);

-- Cleanup automático de URLs expiradas
DELETE FROM short_urls WHERE expires_at < NOW();
```

#### C. Base de Datos NoSQL (MongoDB)
```javascript
const shortUrlSchema = new mongoose.Schema({
  shortCode: { type: String, unique: true, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  clicks: { type: Number, default: 0 }
});

// TTL automático en MongoDB
shortUrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## 🔄 Flujo de Datos Detallado

### Creación de URL Corta
```
[Frontend/Script] 
      │
      │ POST /api/short-url
      │ {"token": "JWT...", "expiresIn": "2h"}
      ▼
[Backend API]
      │
      ├─ Validar JWT ✓
      ├─ Generar código único: crypto.randomBytes(4).toString('hex') 
      ├─ Calcular expiración: now + 2h
      │
      ▼
[Almacenamiento]
      │
      ├─ Key: "abc12345"
      └─ Value: {
           token: "eyJhbG...",
           createdAt: "2025-11-07T10:00:00Z",
           expiresAt: "2025-11-07T12:00:00Z", 
           clicks: 0
         }
      │
      ▼
[Respuesta al Usuario]
{
  "shortCode": "abc12345",
  "shortUrl": "http://localhost:3001/s/abc12345",
  "originalUrl": "http://localhost:5173?token=eyJhbG...",
  "expiresAt": "2025-11-07T12:00:00Z"
}
```

### Redirección y Tracking
```
[Usuario click URL corta]
http://localhost:3001/s/abc12345
      │
      ▼
[Backend - GET /s/:shortCode]
      │
      ├─ Buscar en almacenamiento: get("abc12345")
      ├─ ¿Existe? → Si no: 404 Not Found
      ├─ ¿Expirado? → Si sí: 410 Gone + delete
      │
      ▼
[Incrementar Estadísticas]
      │
      ├─ data.clicks++
      └─ save(data)
      │
      ▼
[Redirección HTTP 302]
Location: http://localhost:5173?token=eyJhbG...
      │
      ▼
[Frontend React]
      │
      ├─ useJWTAuth detecta token en URL
      ├─ Valida JWT
      ├─ Limpia URL (sin token visible)
      └─ Usuario autenticado
```

### Consultar Estadísticas
```
[Admin/Usuario]
GET /api/short-url/abc12345/stats
      │
      ▼
[Backend API]
      │
      ├─ Buscar: get("abc12345")
      ├─ Extraer metadatos (SIN token JWT)
      │
      ▼
[Respuesta Segura]
{
  "shortCode": "abc12345",
  "createdAt": "2025-11-07T10:00:00Z",
  "expiresAt": "2025-11-07T12:00:00Z",
  "clicks": 5,
  "isExpired": false
}
```

## 🛡️ Aspectos de Seguridad

### 1. Separación de Datos
```javascript
// ✅ Lo que se almacena
{
  token: "JWT_COMPLETO_AQUI",    // Solo para redirección
  createdAt: "timestamp",
  expiresAt: "timestamp", 
  clicks: number
}

// ✅ Lo que se expone en /stats
{
  shortCode: "abc12345",
  createdAt: "timestamp",        // Metadatos seguros
  expiresAt: "timestamp",
  clicks: number,
  isExpired: boolean
  // ❌ NO se incluye el JWT
}
```

### 2. Prevención de Ataques
```javascript
// Rate limiting
const rateLimiter = require('express-rate-limit');

app.use('/api/short-url', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10 // máximo 10 URLs cortas por IP por 15min
}));

// Validación de códigos
function isValidShortCode(code) {
  return /^[a-f0-9]{8}$/.test(code); // Solo hex, 8 chars
}

// Sanitización
function sanitizeShortCode(code) {
  return code.toLowerCase().replace(/[^a-f0-9]/g, '');
}
```

## ⚡ Optimizaciones de Rendimiento

### 1. Caché en Memoria + Persistencia
```javascript
// L1: Caché local (LRU)
const NodeCache = require('node-cache');
const localCache = new NodeCache({ stdTTL: 300 }); // 5 minutos

// L2: Redis/DB
async function getShortUrl(shortCode) {
  // Intentar caché local primero
  let data = localCache.get(shortCode);
  
  if (!data) {
    // Fallback a Redis/DB
    data = await redis.get(`short:${shortCode}`);
    if (data) {
      localCache.set(shortCode, data);
    }
  }
  
  return data;
}
```

### 2. Cleanup Automático
```javascript
// Cron job para limpiar códigos expirados
const cron = require('node-cron');

// Cada hora
cron.schedule('0 * * * *', async () => {
  const expiredKeys = await redis.keys('short:*');
  
  for (const key of expiredKeys) {
    const data = JSON.parse(await redis.get(key));
    if (new Date() > new Date(data.expiresAt)) {
      await redis.del(key);
      console.log(`Cleaned expired short URL: ${key}`);
    }
  }
});
```

## 📊 Analytics Avanzado

### Métricas Adicionales
```javascript
// Estructura expandida para analytics
{
  shortCode: "abc12345",
  token: "JWT...",
  createdAt: "2025-11-07T10:00:00Z",
  expiresAt: "2025-11-07T12:00:00Z",
  clicks: 5,
  
  // Analytics avanzado
  firstClickAt: "2025-11-07T10:15:00Z",
  lastClickAt: "2025-11-07T11:30:00Z",
  clicksPerHour: [2, 1, 2, 0],
  referrers: {
    "direct": 3,
    "whatsapp": 1,
    "email": 1
  },
  userAgents: {
    "chrome": 4,
    "safari": 1
  },
  ipAddresses: ["192.168.1.1", "10.0.0.1"] // Para detectar abuso
}
```

### Dashboard de Estadísticas
```javascript
// Endpoint para dashboard
app.get('/api/analytics/dashboard', async (req, res) => {
  const stats = await calculateDashboardStats();
  
  res.json({
    totalUrls: stats.total,
    activeUrls: stats.active,
    totalClicks: stats.clicks,
    topUrls: stats.top10,
    clicksPerDay: stats.dailyClicks,
    averageClicksPerUrl: stats.avgClicks
  });
});
```

## 🚀 Implementación en Producción

### Docker Compose con Redis
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    
volumes:
  redis_data:
```

### Variables de Entorno
```bash
# .env
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10
SHORT_URL_DEFAULT_TTL=3600
CLEANUP_INTERVAL_MINUTES=60
ANALYTICS_ENABLED=true
```

Esta arquitectura permite:
- ✅ Persistencia real de datos
- ✅ Escalabilidad horizontal  
- ✅ Analytics detallado
- ✅ Seguridad robusta
- ✅ Alto rendimiento
- ✅ Mantenimiento automático
