# 🚀 Migración a Vercel - Guía Completa

## 📋 Resumen de la Migración

✅ **COMPLETADO**: Migración completa del proyecto React + Express a Vercel con Serverless Functions.

### 🔄 Cambios Realizados

#### 1. **Estructura del Proyecto**
```
ANTES (Express separado):
├── backend/                  # Express server separado
│   ├── server.js
│   ├── routes/shortUrls.js
│   └── package.json
├── src/                      # Frontend React
└── package.json              # Solo frontend

DESPUÉS (Vercel Functions):
├── api/                      # Serverless Functions
│   ├── upload.js             # POST /api/upload
│   ├── files/[stateId].js    # GET /api/files/:stateId
│   ├── files/[fileId].js     # DELETE /api/files/:fileId
│   ├── download/[fileId].js  # GET /api/download/:fileId
│   ├── short-url.js          # POST /api/short-url
│   ├── s/[shortCode].js      # GET /s/:shortCode (redirección)
│   ├── short-url/[shortCode]/stats.js  # GET /api/short-url/:shortCode/stats
│   └── health.js             # GET /api/health
├── lib/                      # Utilidades compartidas
│   ├── aws-config.js         # Configuración AWS
│   ├── utils.js              # Utilidades generales
│   └── storage.js            # Sistema de almacenamiento para URLs cortas
├── src/                      # Frontend React (sin cambios)
├── vercel.json               # Configuración de Vercel
└── package.json              # Dependencias consolidadas
```

#### 2. **Migración de Rutas Express → Vercel Functions**

| Ruta Express | Función Vercel | Archivo |
|---|---|---|
| `POST /api/upload` | `POST /api/upload` | `api/upload.js` |
| `GET /api/files/:stateId` | `GET /api/files/[stateId]` | `api/files/[stateId].js` |
| `DELETE /api/files/:fileId` | `DELETE /api/files/[fileId]` | `api/files/[fileId].js` |
| `GET /api/download/:fileId` | `GET /api/download/[fileId]` | `api/download/[fileId].js` |
| `POST /api/short-url` | `POST /api/short-url` | `api/short-url.js` |
| `GET /s/:shortCode` | `GET /s/[shortCode]` | `api/s/[shortCode].js` |
| `GET /api/short-url/:shortCode/stats` | `GET /api/short-url/[shortCode]/stats` | `api/short-url/[shortCode]/stats.js` |
| `GET /api/health` | `GET /api/health` | `api/health.js` |

#### 3. **Dependencias Consolidadas**
- ✅ Movidas de `backend/package.json` → `package.json` raíz
- ✅ Agregadas: `aws-sdk`, `formidable`, `uuid`
- ✅ Eliminado: `express`, `multer`, `cors`, `dotenv` (no necesarios en Vercel)

#### 4. **Configuración de Vercel** (`vercel.json`)
- ✅ Rutas configuradas para redirecciones de URLs cortas
- ✅ Headers CORS configurados
- ✅ Variables de entorno mapeadas
- ✅ Runtime Node.js 18.x especificado

## 🚀 Pasos para Desplegar en Vercel

### 1. **Instalar Vercel CLI** (si no lo tienes)
```bash
npm install -g vercel
```

### 2. **Instalar Dependencias**
```bash
# Instalar nuevas dependencias consolidadas
npm install
```

### 3. **Configurar Variables de Entorno**

#### Opción A: Dashboard de Vercel (Recomendado)
1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a Settings → Environment Variables
4. Agrega:
   - `AWS_ACCESS_KEY_ID`: Tu AWS Access Key
   - `AWS_SECRET_ACCESS_KEY`: Tu AWS Secret Key
   - `AWS_REGION`: Tu región AWS (ej: `us-east-1`)
   - `S3_BUCKET_NAME`: Nombre de tu bucket S3

#### Opción B: Vercel CLI
```bash
# Configurar variables de entorno via CLI
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add S3_BUCKET_NAME production
```

### 4. **Desplegar a Vercel**

#### Primer Deploy
```bash
# Inicializar proyecto en Vercel
vercel

# Seguir las preguntas:
# - Set up and deploy? → Yes
# - Which scope? → Tu scope
# - Link to existing project? → No
# - Project name? → prueba (o el nombre que prefieras)
# - Directory? → ./ (raíz del proyecto)
# - Override settings? → No
```

#### Deploys Posteriores
```bash
# Deploy a producción
vercel --prod

# O usar el script del package.json
npm run deploy
```

### 5. **Verificar el Deploy**

Una vez desplegado, Vercel te dará una URL como: `https://tu-proyecto.vercel.app`

**Verificar endpoints:**
- ✅ Frontend: `https://tu-proyecto.vercel.app`
- ✅ Health Check: `https://tu-proyecto.vercel.app/api/health`
- ✅ Upload: `https://tu-proyecto.vercel.app/api/upload` (POST)
- ✅ URLs Cortas: `https://tu-proyecto.vercel.app/s/abc123` (redirección)

## 🔧 Desarrollo Local con Vercel

### 1. **Desarrollo Local**
```bash
# Instalar Vercel CLI localmente (opcional)
npm install vercel --save-dev

# Ejecutar servidor de desarrollo de Vercel
vercel dev

# O usar el script del package.json
npm run vercel-dev
```

### 2. **Configurar Variables de Entorno Local**
```bash
# Crear archivo .env.local (para desarrollo local con Vercel)
cp .env.example .env.local

# Editar .env.local con tus credenciales AWS reales
```

### 3. **Testing Local**
Con `vercel dev` funcionando en puerto 3000:

```bash
# Generar JWT
node generate-jwt.cjs -e 2h -u admin

# Crear URL corta
curl -X POST http://localhost:3000/api/short-url \
  -H "Content-Type: application/json" \
  -d '{"token":"TU_TOKEN_AQUI","expiresIn":"2h"}'

# Probar redirección
curl -L http://localhost:3000/s/abc12345
```

## 🔄 Diferencias con el Setup Anterior

### ✅ Ventajas de Vercel
1. **Escalabilidad automática**: No necesitas manejar servidores
2. **Deploy automático**: Conecta con GitHub para deploys automáticos
3. **Edge Functions**: Funciones más rápidas en el edge
4. **SSL automático**: HTTPS habilitado automáticamente
5. **CDN global**: Assets servidos desde CDN
6. **Zero downtime**: Deploys sin interrupciones

### ⚠️ Consideraciones
1. **URLs cortas en memoria**: Se pierden en cold starts
   - **Solución**: Migrar a Vercel KV o base de datos externa
2. **Límites de función**: 15s timeout para Hobby plan, 60s para Pro
3. **Tamaño de payload**: 4.5MB límite para requests
4. **Cold starts**: Primera request puede ser más lenta

## 🔮 Mejoras Futuras

### 1. **Persistencia de URLs Cortas**
```bash
# Opción 1: Vercel KV (Redis)
npm install @vercel/kv

# Opción 2: Base de datos externa
npm install prisma @prisma/client  # PostgreSQL
# O
npm install mongodb                # MongoDB
```

### 2. **Optimizaciones**
- ✅ **Vercel Analytics**: Para métricas de rendimiento
- ✅ **Edge Functions**: Para mejor latencia global
- ✅ **Incremental Static Regeneration**: Para caching inteligente

### 3. **Monitoreo**
- ✅ **Vercel Monitoring**: Logs y métricas integradas
- ✅ **Error Tracking**: Sentry u otras soluciones

## 📚 Recursos Adicionales

- **[Vercel Functions Docs](https://vercel.com/docs/functions)**
- **[Vercel CLI Reference](https://vercel.com/docs/cli)**
- **[Environment Variables](https://vercel.com/docs/projects/environment-variables)**
- **[Custom Domains](https://vercel.com/docs/projects/domains)**

## 🎯 Próximos Pasos

1. **Desplegar**: Seguir los pasos de deploy arriba
2. **Probar**: Verificar que todos los endpoints funcionen
3. **Configurar dominio**: (Opcional) Agregar dominio personalizado
4. **Monitorear**: Revisar logs y métricas
5. **Optimizar**: Implementar mejoras según necesidades

¡La migración está completa y lista para producción! 🚀
