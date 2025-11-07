# 🗂️ Gestor de Estados y Archivos con Sincronización S3 y Autenticación JWT

Una aplicación React avanzada que demuestra gestión de estados y subida de archivos con persistencia dual: **IndexedDB local** y **Amazon S3 en la nube** con sincronización manual. Incluye un sistema completo de **autenticación JWT** con tokens de tiempo configurable y **URLs cortas** para compartir fácilmente.

## 🚀 Características

### 🔐 Sistema de Autenticación JWT + URLs Cortas
- **Tokens Seguros**: Autenticación basada en JWT con firma criptográfica HMAC-SHA256
- **Expiración Configurable**: Tokens desde minutos hasta semanas (1m, 30m, 1h, 24h, 7d, etc.)
- **URLs Cortas**: Sistema completo para generar URLs cortas en lugar de compartir JWTs largos
- **Generador Incluido**: Script `generate-jwt.cjs` para crear tokens con usuarios personalizados
- **API de URLs Cortas**: Endpoints REST para crear, usar y monitorear códigos cortos
- **Validación Completa**: Verificación de formato, firma, expiración y permisos de aplicación
- **Analytics Básico**: Contador de clicks y estadísticas de uso por URL corta
- **Experiencia Fluida**: URLs limpias, persistencia de sesión y logout automático al expirar
- **Compartir Fácil**: Enlaces cortos tipo `localhost:3001/s/abc123` en lugar de URLs con JWT largo
- **Protección Total**: Toda la aplicación protegida - sin token válido no hay acceso

## 🛠️ Scripts Disponibles

### Frontend
- `npm run dev`: Servidor de desarrollo con HMR (puerto 5173)
- `npm run build`: Build optimizada para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Verificación de código con ESLint

### Backend (Vercel Functions)
```bash
# Development local con Vercel
npm run vercel-dev   # Servidor completo con Vercel Dev (puerto 3000)

# O desarrollo tradicional (solo frontend)
npm run dev          # Solo frontend con Vite (puerto 5173)

# Deploy a producción
npm run deploy       # Deploy a Vercel
```

### Autenticación JWT
```bash
# Generar tokens con diferentes configuraciones
node generate-jwt.cjs                    # Token por defecto (24h)
node generate-jwt.cjs -e 1h              # Token de 1 hora
node generate-jwt.cjs -e 30m -u admin    # Token de 30 min para admin
node generate-jwt.cjs -e 8h -u dev       # Token de 8 horas para desarrollo
node generate-jwt.cjs --help             # Ver todas las opciones

# Guardar token en archivo
node generate-jwt.cjs -e 2h -o token.json
```

### 🗂️ Gestión de Estados
- **4 Estados Distintos**: La aplicación maneja 4 estados diferentes entre los que puedes navegar
- **Persistencia de Estado**: El estado actual se guarda en IndexedDB y se restaura al recargar

### 📁 Gestión de Archivos Dual
- **Almacenamiento Local**: Los archivos se almacenan inmediatamente en IndexedDB para acceso offline
- **Almacenamiento en la Nube**: Integración completa con Amazon S3 para respaldo y sincronización
- **Subida de Archivos Avanzada**: Sube archivos grandes con drag & drop o selección manual
- **Sincronización Manual**: Botón de sincronización para subir archivos locales a S3 cuando lo desees

### ☁️ Integración con AWS S3
- **Backend Express**: API REST para comunicación segura con Amazon S3
- **Upload Directo**: Los archivos se suben directamente a S3 a través del backend
- **Gestión de Estados S3**: Archivos organizados por estados en buckets de S3
- **Conexión en Tiempo Real**: Indicador visual del estado de conexión con S3
- **Sincronización Bidireccional**: Sube archivos locales y descarga metadatos de S3

### 🔧 Características Técnicas
- **Interfaz Moderna**: UI limpia y responsiva con navegación intuitiva y estados de carga
- **Gestión de Archivos**: Ver, descargar y eliminar archivos por estado con vista previa
- **Monitoreo de Almacenamiento**: Visualización en tiempo real del uso de espacio local y S3
- **Estados de Sincronización**: Feedback visual del progreso de uploads y sincronización
- **Validación de Espacio**: Prevención automática de subidas cuando no hay suficiente espacio
- **Barra de Usuario**: Información del usuario autenticado y tiempo de expiración visible

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: Framework de UI con hooks y estado asíncrono
- **Vite**: Herramienta de build rápida y optimizada con HMR
- **IndexedDB**: Base de datos del navegador para almacenamiento local robusto
- **File API**: Para manejo avanzado de archivos y drag & drop
- **CSS3**: Estilos modernos con gradientes, animaciones y componentes de carga

### Backend
- **Vercel Serverless Functions**: API REST escalable sin servidores
- **AWS SDK v2**: Integración oficial con servicios de Amazon Web Services
- **Formidable**: Manejo de uploads multipart/form-data en serverless
- **Edge Runtime**: Funciones optimizadas para máximo rendimiento

### Infraestructura en la Nube
- **Amazon S3**: Almacenamiento de archivos escalable y duradero
- **AWS IAM**: Gestión de permisos y acceso seguro a recursos
- **Organización por Estados**: Estructura de carpetas `state-1/`, `state-2/`, etc.

## 📁 Estructura del Proyecto

```
/
├── src/                      # Frontend React
│   ├── components/
│   │   ├── FileUpload.jsx        # Componente de subida con validación
│   │   ├── FileUpload.css        # Estilos con barra de almacenamiento
│   │   ├── FileList.jsx          # Lista y gestión de archivos local/S3
│   │   ├── FileList.css
│   │   ├── StateNavigation.jsx   # Navegación entre estados
│   │   ├── StateNavigation.css
│   │   ├── S3UploadStatus.jsx    # Estado de conexión y sincronización S3
│   │   ├── S3UploadStatus.css    # Estilos para indicadores S3
│   │   ├── AuthGuard.jsx         # Componente de protección JWT
│   │   └── AuthGuard.css         # Estilos para autenticación
│   ├── hooks/
│   │   ├── useIndexedDB.js       # Hook para IndexedDB con persistencia local
│   │   ├── useS3Upload.js        # Hooks para integración con S3 y backend
│   │   └── useJWTAuth.js         # Hook para autenticación y validación JWT
│   ├── App.jsx                   # Componente principal con estados duales
│   ├── App.css                   # Estilos con componentes de loading
│   ├── index.css                 # Estilos globales optimizados
│   └── main.jsx                  # Punto de entrada
├── api/                      # Vercel Serverless Functions
│   ├── upload.js                 # POST /api/upload - Subir archivos a S3
│   ├── files/[stateId].js        # GET /api/files/:stateId - Obtener archivos por estado
│   ├── files/[fileId].js         # DELETE /api/files/:fileId - Eliminar archivo
│   ├── download/[fileId].js      # GET /api/download/:fileId - URL de descarga
│   ├── short-url.js              # POST /api/short-url - Crear URL corta
│   ├── s/[shortCode].js          # GET /s/:shortCode - Redirección de URL corta
│   ├── short-url/[shortCode]/stats.js  # GET /api/short-url/:shortCode/stats
│   └── health.js                 # GET /api/health - Health check
├── lib/                      # Utilidades y configuración
│   ├── aws-config.js             # Configuración AWS S3
│   ├── utils.js                  # Utilidades generales
│   └── storage.js                # Sistema de almacenamiento URLs cortas
├── vercel.json               # Configuración de deploy y rutas Vercel
├── generate-jwt.cjs          # Script generador de tokens JWT
├── demo-short-urls.sh        # Script de demo para URLs cortas
├── JWT-AUTH.md               # Documentación del sistema de autenticación
├── CONCEPT-PERSISTENCE.md    # Documentación conceptual de persistencia
├── VERCEL-MIGRATION.md       # Guía completa de migración a Vercel
├── package.json              # Dependencias consolidadas (frontend + backend)
└── README.md                 # Esta documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js 18+**: Para desarrollo óptimo
- **Cuenta AWS**: Para funcionalidades de S3 (opcional para modo local)
- **Credenciales AWS**: Access Key y Secret Key con permisos S3
- **Token JWT**: Requerido para acceder a la aplicación (se genera con script incluido)

### 1. Configuración del Frontend
```bash
# Instalar dependencias del frontend
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### 2. Configuración de Variables de Entorno
```bash
# Configurar variables de entorno (local)
cp .env.example .env.local
# Editar .env.local con tus credenciales AWS:
# AWS_ACCESS_KEY_ID=tu_access_key
# AWS_SECRET_ACCESS_KEY=tu_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=tu-bucket-name

# Para producción en Vercel, configura las variables en el dashboard
# o usa Vercel CLI: vercel env add AWS_ACCESS_KEY_ID production
```

### 3. Configuración de AWS S3
```bash
# Crear bucket en S3 (vía AWS CLI o consola web)
aws s3 mb s3://tu-bucket-name

# Configurar permisos CORS en el bucket
# Permitir origins: http://localhost:5173, http://localhost:5174
```

### 4. Generar Token JWT de Acceso (REQUERIDO)
```bash
# Generar token válido por 24 horas (usuario por defecto)
node generate-jwt.cjs

# Generar token para desarrollo (1 hora)
node generate-jwt.cjs -e 1h -u developer

# Generar token para pruebas (30 minutos)
node generate-jwt.cjs -e 30m -u tester

# Generar token de larga duración (8 horas)
node generate-jwt.cjs -e 8h -u admin

# Ver todas las opciones disponibles
node generate-jwt.cjs --help

# Guardar token en archivo JSON
node generate-jwt.cjs -e 2h -u admin -o admin-token.json
```

**⚠️ IMPORTANTE**: La aplicación requiere un token JWT válido para funcionar. Sin token, mostrará una pantalla de "Acceso Denegado".

### 5. Ejecutar la Aplicación Completa

#### Opción A: Desarrollo con Vercel (Recomendado)
```bash
# Una sola terminal: Frontend + Backend integrados
npm run vercel-dev  # Ejecuta en puerto 3000

# Generar token JWT
node generate-jwt.cjs -e 2h -u admin
# Usar la URL generada (puerto 3000)
```

#### Opción B: Desarrollo tradicional (Solo frontend)
```bash
# Una terminal: Solo frontend
npm run dev  # Puerto 5173 (sin funcionalidades de backend)

# Nota: Las funciones de S3 y URLs cortas no funcionarán en este modo
```

### 6. Acceder a la Aplicación

#### Opción 1: URL Completa (Directa)
1. **Generar token**: El script mostrará una URL completa como:
   ```
   # Con Vercel Dev (recomendado)
   http://localhost:3000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Con Vite solo (sin backend)
   http://localhost:5173?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Usar la URL**: Copia y pega la URL completa en tu navegador

3. **Acceso automático**: La aplicación validará el token y te dará acceso

#### Opción 2: URL Corta (Recomendada para compartir)
1. **Generar URL corta**: Con el backend corriendo, usa curl o Postman:
   ```bash
   # Usando curl (reemplaza TU_TOKEN_JWT con el token generado)
   curl -X POST http://localhost:3000/api/short-url \
     -H "Content-Type: application/json" \
     -d '{"token":"TU_TOKEN_JWT","expiresIn":"2h"}'
   ```

2. **Respuesta**: Recibirás algo como:
   ```json
   {
     "shortCode": "a1b2c3d4",
     "shortUrl": "http://localhost:3000/s/a1b2c3d4",
     "originalUrl": "http://localhost:3000?token=eyJhbG...",
     "expiresAt": "2024-01-15T14:30:00.000Z"
   }
   ```

3. **Compartir**: Usa la `shortUrl` para compartir fácilmente (ej: `http://localhost:3000/s/a1b2c3d4`)

4. **Redirección automática**: Al acceder a la URL corta, te redirige automáticamente a la app con el token válido

#### Sin Token
Si accedes a `http://localhost:3000` (o `http://localhost:5173`) sin el parámetro `?token=`, verás una pantalla de "Acceso Denegado" con instrucciones

## 🚀 Deploy a Producción en Vercel

### Configuración Rápida
```bash
# 1. Instalar Vercel CLI (una sola vez)
npm install -g vercel

# 2. Deploy inicial
vercel

# 3. Configurar variables de entorno en dashboard de Vercel:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY  
# - AWS_REGION
# - S3_BUCKET_NAME

# 4. Deploy a producción
npm run deploy
```

### URL de Producción
Una vez desplegado, tu aplicación estará disponible en:
`https://tu-proyecto.vercel.app`

**📖 Guía completa**: Ver [VERCEL-MIGRATION.md](./VERCEL-MIGRATION.md) para instrucciones detalladas de migración y deploy.

## 💡 Funcionalidades

### Estados
- **Estado 1 (🔴)**: Estado inicial por defecto
- **Estado 2 (🟢)**: Estado alternativo
- **Estado 3 (🔵)**: Tercer estado
- **Estado 4 (🟡)**: Cuarto estado

### 📁 Gestión de Archivos Dual (Local + S3)
- **Almacenamiento Inmediato**: Los archivos se guardan inmediatamente en IndexedDB
- **Sincronización Manual**: Botón para subir archivos locales a S3 cuando lo desees
- **Drag & Drop**: Arrastra archivos directamente al área de subida
- **Selección múltiple**: Sube varios archivos a la vez
- **Vista previa inteligente**: Iconos dinámicos según tipo de archivo
- **Información detallada**: Tamaño, fecha de subida, estado de sincronización y metadatos
- **Descarga directa**: Botón de descarga para cada archivo (local o desde S3)
- **Eliminación segura**: Confirmación visual para eliminar archivos de ambos almacenamientos
- **Organización por estado**: Cada estado mantiene su propia colección local y en S3

### ☁️ Sincronización con Amazon S3
- **Conexión en Tiempo Real**: Indicador visual del estado de conexión con S3
- **Upload Progresivo**: Barra de progreso para subidas a S3
- **Sincronización Bidireccional**: 
  - 📤 Sube archivos locales pendientes a S3
  - 📥 Descarga metadatos de archivos existentes en S3
- **Gestión de Conflictos**: Detección de archivos duplicados o modificados
- **Organización S3**: Estructura de carpetas `state-1/`, `state-2/`, `state-3/`, `state-4/`
- **Recuperación de Errores**: Reintento automático en caso de fallos de red

### 💾 Persistencia Robusta (IndexedDB + S3)
- **Almacenamiento Local**: Hasta varios GB de capacidad en IndexedDB
- **Almacenamiento en la Nube**: Capacidad prácticamente ilimitada en S3
- **Operaciones asíncronas**: No bloquea la interfaz de usuario
- **Transacciones ACID**: Garantiza integridad de datos locales
- **Estado persistente**: Se restaura automáticamente al recargar
- **Compatibilidad universal**: Funciona en desktop y móviles
- **Backup automático**: Los archivos sincronizados están respaldados en S3

### 📊 Monitoreo de Almacenamiento Dual
- **Visualización Local**: Barra de progreso del uso de espacio en IndexedDB
- **Estado de S3**: Indicador de conexión y estadísticas de sincronización
- **Estadísticas detalladas**: Espacio usado local, archivos sincronizados, pendientes
- **Validación preventiva**: Prevención de subidas cuando no hay espacio local
- **Alertas inteligentes**: Notificaciones de estado de conexión y sincronización

## 🔗 API de URLs Cortas

### Endpoints Disponibles

#### `POST /api/short-url`
Genera una URL corta para un token JWT.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "2h"  // opcional, por defecto "1h"
}
```

**Response:**
```json
{
  "shortCode": "a1b2c3d4",
  "shortUrl": "http://localhost:3001/s/a1b2c3d4",
  "originalUrl": "http://localhost:5173?token=eyJhbG...",
  "expiresAt": "2024-01-15T14:30:00.000Z"
}
```

#### `GET /s/:shortCode`
Redirige a la aplicación con el token JWT asociado.

**Ejemplo:**
- Acceder: `http://localhost:3001/s/a1b2c3d4`
- Redirige a: `http://localhost:5173?token=eyJhbG...`

#### `GET /api/short-url/:shortCode/stats`
Obtiene estadísticas sobre una URL corta (sin revelar el token).

**Response:**
```json
{
  "shortCode": "a1b2c3d4",
  "createdAt": "2024-01-15T12:30:00.000Z",
  "expiresAt": "2024-01-15T14:30:00.000Z",
  "clicks": 5,
  "isExpired": false
}
```

### Script de Demo Automático

Para probar todo el flujo de URLs cortas automáticamente:

```bash
# Ejecutar demo completa
./demo-short-urls.sh
```

Este script:
1. ✅ Verifica que el backend esté corriendo
2. 🎫 Genera un token JWT de 4 horas
3. 🔗 Crea una URL corta automáticamente
4. 📊 Muestra estadísticas iniciales
5. 🌐 Simula un acceso (redirección)
6. 📊 Muestra estadísticas actualizadas
7. 🎉 Proporciona URLs y comandos para pruebas manuales

### Ejemplos de Uso

#### Con curl
```bash
# 1. Generar JWT
JWT_TOKEN=$(node generate-jwt.cjs -e 4h -u admin | grep "token=" | cut -d'=' -f2)

# 2. Crear URL corta
curl -X POST http://localhost:3000/api/short-url \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$JWT_TOKEN\",\"expiresIn\":\"4h\"}"

# 3. Obtener estadísticas de URL corta
curl http://localhost:3000/api/short-url/a1b2c3d4/stats
```

#### Con JavaScript/Frontend
```javascript
// Generar URL corta desde el frontend
async function createShortUrl(jwtToken, expiresIn = '2h') {
  const response = await fetch('http://localhost:3000/api/short-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: jwtToken,
      expiresIn: expiresIn
    })
  });
  
  const data = await response.json();
  return data.shortUrl; // ej: "http://localhost:3000/s/a1b2c3d4"
}
```

### Características de las URLs Cortas

- ✅ **Códigos únicos**: 8 caracteres hexadecimales (`a1b2c3d4`)
- ⏰ **Expiración configurable**: Misma duración que el JWT o personalizada
- 📊 **Contador de clicks**: Rastrea cuántas veces se accede
- 🔒 **Seguridad**: Los tokens JWT no se exponen en logs del servidor
- 💾 **Almacenamiento temporal**: En memoria (en producción usar Redis/DB)
- 🚀 **Redirección rápida**: Menos de 50ms de latencia típica

### Ventajas de URLs Cortas

1. **Compartir fácil**: URLs más cortas y manejables
2. **Seguridad mejorada**: El JWT no es visible en la URL
3. **Analytics**: Seguimiento de accesos y uso
4. **Expiración independiente**: Puede expirar antes que el JWT
5. **Logs más limpios**: Los tokens JWT no aparecen en logs de acceso

### Limitaciones Actuales

- **Almacenamiento en memoria**: Se pierden al reiniciar el servidor
- **Sin persistencia**: No sobrevive reinicios del backend
- **Dominio fijo**: Usa el dominio del backend (no personalizable)

### Para Producción

Se recomienda:
- Usar **Redis** o **base de datos** para persistir códigos cortos
- Implementar **rate limiting** para prevenir abuso
- Agregar **dominios personalizados** (ej: `https://mi-app.com/s/abc123`)
- **Logs de auditoría** para seguridad
- **Cleanup automático** de códigos expirados

## 🔧 Variables de Entorno

### Backend (.env)
```bash
# Credenciales AWS
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1

# Configuración S3
S3_BUCKET_NAME=tu-bucket-name

# Configuración del servidor
PORT=3001
```

### Configuración JWT

#### Cambiar Clave Secreta (Recomendado para Producción)
1. Edita `generate-jwt.cjs` línea 8:
   ```javascript
   const DEFAULT_SECRET = 'tu-clave-super-secreta-aqui';
   ```

2. Edita `src/hooks/useJWTAuth.js` línea 4:
   ```javascript
   const JWT_SECRET = 'tu-clave-super-secreta-aqui';
   ```

⚠️ **IMPORTANTE**: En producción, la clave secreta debería venir del backend, no estar en el frontend.

#### Tiempos de Expiración Recomendados
- **Desarrollo**: `1h` - `2h` (reinicio frecuente)
- **Testing**: `30m` (pruebas rápidas)
- **Demo**: `8h` - `24h` (presentaciones largas)
- **Producción**: `1h` - `4h` (balance entre seguridad y usabilidad)

### Permisos AWS S3 Requeridos
Tu usuario/rol de AWS necesita los siguientes permisos:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::tu-bucket-name",
        "arn:aws:s3:::tu-bucket-name/*"
      ]
    }
  ]
}
```

## 📖 Ejemplos de Uso

### Flujo Básico de Trabajo
1. **Generar token JWT**: `node generate-jwt.cjs -e 2h -u usuario`
2. **Acceder con token**: Usar la URL generada con el parámetro `?token=...`
3. **Validación automática**: La aplicación valida el token y muestra información del usuario en la barra superior
4. **Sesión activa**: El token se guarda en sessionStorage y la URL se limpia automáticamente
5. **Subir archivos**: Arrastra imágenes, documentos o cualquier archivo (se guardan inmediatamente en IndexedDB)
6. **Sincronizar con S3**: Haz clic en el botón "Sincronizar" para subir archivos a la nube
7. **Cambiar estado**: Haz clic en Estado 2, 3 o 4 para organizaciones diferentes
8. **Gestionar archivos**: Descarga o elimina archivos (local y S3 sincronizados)
9. **Monitoreo de sesión**: Ve el tiempo de expiración en la barra superior
10. **Logout automático**: Al expirar el token, la aplicación te desconecta automáticamente

### Casos de Uso Avanzados
- **📊 Organización de documentos**: Un estado por proyecto con backup automático en S3
- **🎨 Gestión de assets**: Separar imágenes, videos, documentos con sincronización selectiva
- **📁 Backup inteligente**: Almacenamiento local inmediato + sincronización manual a S3
- **🔄 Estados de workflow**: Borradores (local), en revisión (S3), aprobados (S3), publicados (S3)
- **🌍 Trabajo offline/online**: Acceso inmediato offline, sincronización cuando hay conexión

### Modos de Operación
- **Autenticado + Local**: Con token válido, funciona completamente sin conexión S3 (solo IndexedDB)
- **Autenticado + Híbrido**: Con token válido, almacenamiento local inmediato + sincronización manual a S3
- **Sin Autenticación**: Sin token válido, acceso completamente bloqueado con pantalla de error
- **Recuperación**: Los archivos en S3 se pueden descargar si se pierde el almacenamiento local (requiere token válido)

### Límites y Recomendaciones
- **Archivo individual**: Máximo 100MB (limitado por S3 y IndexedDB)
- **Total por estado (local)**: Hasta 1GB recomendado en IndexedDB
- **Total por estado (S3)**: Prácticamente ilimitado
- **Tipos de archivo**: Todos soportados (imágenes, videos, documentos, código, etc.)
- **Sincronización**: Manual para control total del usuario (requiere autenticación)
- **Tokens JWT**: Recomendado 1-8 horas para uso normal, 24h para demos
- **Sesiones**: Los tokens se mantienen solo durante la sesión del navegador

## 🛠️ Troubleshooting

### Problemas Comunes

#### ❌ "Error inicializando IndexedDB"
**Solución:**
- Verifica que el navegador soporte IndexedDB
- Revisa que no esté en modo incógnito (algunos navegadores limitan IndexedDB)
- Limpia caché y cookies del sitio

#### ❌ "Sin conexión a S3" / "Error de conexión S3"
**Solución:**
- Verifica que el backend esté ejecutándose en puerto 3001
- Revisa las credenciales AWS en el archivo `.env` del backend
- Confirma que el bucket S3 existe y tienes permisos
- Verifica la configuración de CORS en el bucket S3

#### ❌ "Error al sincronizar con S3"
**Solución:**
- Verifica conexión a internet
- Revisa los logs del backend para errores específicos de AWS
- Confirma que el bucket S3 tenga los permisos correctos
- Intenta con archivos más pequeños primero

#### ❌ "Acceso Denegado" / "Token JWT requerido"
**Solución:**
- Genera un token JWT: `node generate-jwt.cjs -e 2h -u usuario`
- Usa la URL completa generada por el script
- Verifica que el token no haya expirado
- Revisa que la clave secreta sea la misma en generador y validador

#### ❌ "Token expirado"
**Solución:**
- Genera un nuevo token con `node generate-jwt.cjs`
- Usa tokens más largos para sesiones largas (ej: `-e 8h`)
- El token se valida automáticamente cada minuto

#### ❌ "No hay suficiente espacio disponible"
**Solución:**
- Elimina archivos antiguos de otros estados
- Sincroniza archivos a S3 y luego elimina localmente si es necesario
- Usa archivos más pequeños (comprime imágenes/videos)
- Verifica espacio en disco del dispositivo

#### ❌ "Error al subir archivo"
**Solución:**
- Verifica que el archivo no esté corrupto
- Intenta con un archivo más pequeño
- Revisa si el backend está funcionando
- Recarga la página y vuelve a intentar

### Performance Tips
- **Archivos grandes**: Sube de a uno para mejor feedback visual
- **Muchos archivos**: Sincroniza en lotes pequeños para evitar timeouts
- **Almacenamiento lleno**: Usa S3 como respaldo y limpia archivos locales regularmente
- **Conexión lenta**: Los archivos se guardan localmente primero, sincroniza cuando tengas buena conexión
- **Navegadores antiguos**: Actualiza para mejor compatibilidad con IndexedDB y Fetch API

### Debugging
- **Logs del Frontend**: Abre DevTools > Console para ver logs detallados
- **Logs del Backend**: Revisa la terminal donde ejecutas `npm run dev` en la carpeta backend
- **Estado de S3**: El indicador visual muestra si está conectado o desconectado
- **IndexedDB**: Usa DevTools > Application > Storage para inspeccionar datos locales

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- 🔍 **Búsqueda y filtros**: Buscar archivos por nombre, tipo o fecha en local y S3
- 📊 **Analytics**: Estadísticas de uso, almacenamiento local vs S3, costos de S3
- 🎨 **Temas personalizables**: Dark mode y colores customizables
- 📤 **Export/Import**: Respaldo completo de configuraciones y metadatos
- 🔄 **Sincronización automática**: Opción de sync automático en segundo plano
- 🌐 **Multi-bucket**: Soporte para múltiples buckets S3 por estado
- 📱 **PWA**: Convertir en Progressive Web App para instalación
- 🔐 **Encriptación**: Encriptación de archivos antes de subir a S3
- 📊 **Dashboard S3**: Vista detallada de uso y costos de S3
- 🔄 **Sincronización bidireccional**: Detectar cambios en S3 y sincronizar hacia local

### Mejoras de Autenticación JWT
- 🔐 **JWT desde Backend**: Mover validación JWT completamente al backend
- 🔄 **Refresh Tokens**: Sistema de refresh tokens para sesiones largas
- 👥 **Roles y Permisos**: Sistema de roles más granular (admin, user, readonly)
- 🔐 **2FA**: Autenticación de dos factores opcional
- 📱 **OAuth Integration**: Login con Google, GitHub, etc.
- 🕒 **Session Management**: Gestión avanzada de sesiones activas

### Mejoras Técnicas
- **AWS SDK v3**: Migración a la versión más moderna y optimizada
- **Streaming Uploads**: Soporte para archivos muy grandes con streaming
- **Retry Logic**: Lógica de reintentos más robusta para fallos de red
- **Caching**: Cache inteligente de metadatos de S3
- **Compression**: Compresión automática de archivos antes de S3
- **Rate Limiting**: Límites de velocidad para API y uploads

## 🌐 Compatibilidad

### Navegadores de Desktop
- ✅ **Chrome 58+**: Soporte completo
- ✅ **Firefox 52+**: Soporte completo  
- ✅ **Safari 10+**: Soporte completo
- ✅ **Edge 79+**: Soporte completo

### Navegadores Móviles
- ✅ **iOS Safari 10+**: iPhone/iPad compatible
- ✅ **Chrome Android 81+**: Soporte completo
- ✅ **Firefox Android 68+**: Soporte completo
- ✅ **Samsung Internet 7+**: Compatible

### Capacidades por Plataforma
| Plataforma | Capacidad IndexedDB | Características |
|---|---|---|
| **Desktop** | 1GB - 10GB+ | Capacidad máxima, rendimiento óptimo |
| **Android** | 50MB - 2GB | Buena capacidad, rendimiento sólido |
| **iOS** | 50MB - 1GB | Capacidad moderada, limpieza automática |

## 🏗️ Arquitectura

### Flujo de Datos
```
Usuario → Frontend React → IndexedDB (local inmediato)
                        ↓
Usuario presiona "Sync" → Backend Express → Amazon S3
                        ↓
                   S3 Response → Frontend → UI actualizada
```

### Componentes Clave
- **Frontend (React)**: Interfaz de usuario y gestión de estado local
- **IndexedDB**: Almacenamiento local inmediato y persistente
- **Backend (Express)**: API REST para comunicación segura con AWS
- **Amazon S3**: Almacenamiento en la nube escalable y duradero

## 📚 Documentación Adicional

- **[JWT-AUTH.md](./JWT-AUTH.md)**: Guía completa del sistema de autenticación JWT
- **[CONCEPT-PERSISTENCE.md](./CONCEPT-PERSISTENCE.md)**: Conceptos de persistencia de URLs cortas
- **[backend/README.md](./backend/README.md)**: Documentación específica del backend
- **generate-jwt.cjs**: Script generador con `--help` para ver todas las opciones
- **demo-short-urls.sh**: Script de demo automático para URLs cortas

## 🚀 Enlaces Rápidos

### Para Empezar
```bash
# 1. Instalar dependencias
npm install && cd backend && npm install && cd ..

# 2. Configurar AWS (editar backend/.env)
cp backend/.env.example backend/.env

# 3. Generar token JWT
node generate-jwt.cjs -e 2h -u admin

# 4. Iniciar servidores
cd backend && npm run dev &
npm run dev
```

### URLs de Ejemplo
- **Sin token**: http://localhost:5173 (mostrará "Acceso Denegado")
- **Con token directo**: http://localhost:5173?token=tu_token_jwt_aqui
- **Con URL corta**: http://localhost:3001/s/abc12345 (redirige automáticamente)

### Demo Rápida de URLs Cortas
```bash
# Generar token, crear URL corta y probar todo automáticamente
./demo-short-urls.sh

# O manualmente paso a paso:
node generate-jwt.cjs -e 2h -u usuario     # 1. Generar JWT
# 2. Copiar token y crear URL corta:
curl -X POST http://localhost:3001/api/short-url \
  -H "Content-Type: application/json" \
  -d '{"token":"TU_TOKEN_AQUI","expiresIn":"2h"}'
# 3. Usar la shortUrl devuelta en el navegador
```

---

## 📄 Licencia

MIT License - Proyecto de código abierto

## 👨‍💻 Autor

Desarrollado como prueba de concepto para demostrar las capacidades avanzadas de **React + IndexedDB + AWS S3 + Autenticación JWT + URLs Cortas** con arquitectura de almacenamiento dual, sincronización manual y sistema de autenticación completo.

---

⭐ **¡Proyecto educativo para aprender gestión de estado, almacenamiento web moderno, integración con servicios en la nube, autenticación JWT y sistemas de URLs cortas!** ⭐
