# 🗂️ Gestor de Estados y Archivos con Sincronización S3 y Autenticación JWT

Una aplicación React avanzada que demuestra gestión de estados y subida de archivos con persistencia dual: **IndexedDB local** y **Amazon S3 en la nube** con sincronización manual. Incluye un sistema completo de **autenticación JWT** con tokens de tiempo configurable.

## 🚀 Característi## 🛠️ Scripts Disponibles

### Frontend
- `npm run dev`: Servidor de desarrollo con HMR (puerto 5173)
- `npm run build`: Build optimizada para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Verificación de código con ESLint

### Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon (puerto 3001)
npm start        # Producción con node
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
```s

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

### � Sistema de Autenticación JWT
- **Tokens Seguros**: Autenticación basada en JWT con firma criptográfica HMAC-SHA256
- **Expiración Configurable**: Tokens desde minutos hasta semanas (1m, 30m, 1h, 24h, 7d, etc.)
- **Generador Incluido**: Script `generate-jwt.cjs` para crear tokens con usuarios personalizados
- **Validación Completa**: Verificación de formato, firma, expiración y permisos de aplicación
- **Experiencia Fluida**: URLs limpias, persistencia de sesión y logout automático al expirar
- **Protección Total**: Toda la aplicación protegida - sin token válido no hay acceso

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
- **Node.js + Express**: API REST para comunicación con S3
- **AWS SDK v2**: Integración oficial con servicios de Amazon Web Services
- **Multer**: Middleware para manejo de uploads multipart/form-data
- **CORS**: Configuración de seguridad para peticiones cross-origin
- **dotenv**: Gestión segura de variables de entorno

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
├── backend/                  # API Backend
│   ├── server.js                 # Servidor Express con endpoints S3
│   ├── package.json              # Dependencias del backend
│   ├── .env.example              # Variables de entorno de ejemplo
│   ├── .env                      # Configuración AWS (no incluido en git)
│   └── README.md                 # Documentación específica del backend
├── generate-jwt.cjs          # Script generador de tokens JWT
├── JWT-AUTH.md               # Documentación del sistema de autenticación
├── package.json              # Dependencias del frontend
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

### 2. Configuración del Backend
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias del backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales AWS:
# AWS_ACCESS_KEY_ID=tu_access_key
# AWS_SECRET_ACCESS_KEY=tu_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=tu-bucket-name

# Ejecutar el servidor backend
npm run dev
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
```bash
# Terminal 1: Backend (puerto 3001)
cd backend && npm run dev

# Terminal 2: Frontend (puerto 5173)
npm run dev

# Terminal 3: Generar token y usar URL completa
node generate-jwt.cjs -e 2h -u admin
# Copiar y pegar la URL generada en el navegador
```

### 6. Acceder a la Aplicación
1. **Generar token**: El script mostrará una URL completa como:
   ```
   http://localhost:5173?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Usar la URL**: Copia y pega la URL completa en tu navegador

3. **Acceso automático**: La aplicación validará el token y te dará acceso

4. **Sin token**: Si accedes a `http://localhost:5173` sin el parámetro `?token=`, verás una pantalla de "Acceso Denegado" con instrucciones

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

## 🎨 Características de UI

### Diseño Moderno
- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **Loading States**: Spinners y estados de carga elegantes
- **Animaciones fluidas**: Transiciones suaves y micro-interacciones
- **Feedback visual**: Indicadores de drag & drop y estados activos
- **Iconografía intuitiva**: Emojis y iconos para mejor UX
- **Gradientes dinámicos**: Colores modernos y atractivos

### Componentes Avanzados
- **Barra de almacenamiento**: Visualización gráfica del espacio usado local
- **Estados de carga**: Feedback inmediato durante operaciones locales y S3
- **Navegación por estados**: Botones temáticos con colores únicos
- **Área de drag & drop**: Zona interactiva con respuesta visual
- **Lista de archivos**: Cards organizadas con indicadores de sincronización y acciones rápidas
- **S3UploadStatus**: Componente dedicado para mostrar estado de conexión y progreso
- **Botón de Sincronización**: Control manual para sincronizar archivos locales con S3
- **Indicadores de Estado**: Iconos que muestran si el archivo está solo local, solo en S3, o sincronizado

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18**: Hooks avanzados con useState, useEffect y custom hooks
- **IndexedDB API**: Base de datos robusta del navegador para almacenamiento local
- **File API**: Lectura y procesamiento avanzado de archivos
- **Fetch API**: Comunicación con el backend para operaciones S3
- **Storage API**: Monitoreo de cuotas y uso de almacenamiento local
- **CSS Grid/Flexbox**: Layouts responsivos y modernos
- **CSS Custom Properties**: Variables dinámicas para temas

### Backend
- **Express.js**: Framework web rápido y minimalista para Node.js
- **AWS SDK v2**: SDK oficial de Amazon para integración con servicios AWS
- **Multer**: Middleware para manejo de uploads multipart/form-data
- **CORS**: Middleware para configuración de Cross-Origin Resource Sharing
- **UUID**: Generación de identificadores únicos para archivos
- **dotenv**: Carga de variables de entorno desde archivos .env

### Infraestructura y Servicios
- **Amazon S3**: Almacenamiento de objetos escalable y duradero
- **AWS IAM**: Gestión de identidad y acceso para permisos S3
- **Node.js**: Runtime de JavaScript del lado del servidor

### Herramientas de Desarrollo
- **Vite**: Build tool optimizado con HMR para el frontend
- **Nodemon**: Reinicio automático del servidor durante desarrollo
- **ESLint**: Linting y calidad de código
- **Modern JavaScript**: ES6+, async/await, Promises en frontend y backend

## 📱 Responsividad

La aplicación está optimizada para:
- 📱 Móviles (480px y menos)
- 📱 Tablets (768px y menos)
- 💻 Desktop (1200px y más)

## ⚡ Rendimiento y Optimizaciones

### Almacenamiento Eficiente Dual
- **IndexedDB Local**: Operaciones asíncronas que no bloquean la UI
- **Amazon S3**: Almacenamiento escalable con CDN global de AWS
- **Gestión de memoria**: Carga bajo demanda de archivos grandes
- **Transacciones optimizadas**: Operaciones batch para mejor rendimiento local
- **Streaming de archivos**: Upload directo a S3 sin almacenamiento temporal en servidor
- **Compresión inteligente**: Almacenamiento local en base64 con metadatos mínimos

### Optimizaciones de Backend
- **Multer en memoria**: Procesamiento de archivos sin escritura a disco
- **AWS SDK optimizado**: Conexiones reutilizables y configuración de regiones
- **Middleware eficiente**: CORS y parsing JSON optimizados
- **Manejo de errores robusto**: Respuestas estructuradas y logging detallado

### Optimizaciones de React
- **Custom Hooks**: Lógica reutilizable para IndexedDB y S3
- **Estados de carga duales**: Separación entre operaciones locales y de red
- **Manejo de errores**: Recovery automático y feedback al usuario
- **Componentización**: Separación de responsabilidades para mejor mantenimiento
- **Prevención de re-renders**: Optimización de dependencias en useEffect

### Experiencia de Usuario Mejorada
- **Feedback inmediato**: Estados de carga para operaciones locales y de red
- **Validación preventiva**: Verificación de espacio antes de subir archivos
- **Recuperación de errores**: Manejo graceful de fallos de red, S3 o almacenamiento local
- **Indicadores de conexión**: Estado visual de conectividad con S3
- **Sincronización manual**: Control del usuario sobre cuándo sincronizar
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla

## 🔒 Seguridad y Privacidad

### Seguridad de Autenticación JWT
- **Tokens firmados**: Cada token está firmado criptográficamente con HMAC-SHA256
- **Validación completa**: Verifica formato, firma, expiración y aplicación específica
- **Expiración automática**: Los tokens expiran automáticamente según configuración
- **No persistencia permanente**: Tokens se almacenan solo en sessionStorage
- **Clave secreta**: Sistema de clave secreta compartida entre generador y validador
- **Limpieza automática**: URLs se limpian automáticamente después de validación

### Seguridad del Backend
- **Variables de entorno**: Credenciales AWS almacenadas de forma segura
- **CORS configurado**: Solo origins permitidos pueden acceder a la API
- **Validación de archivos**: Verificación de tipos, tamaños y metadatos
- **AWS IAM**: Permisos granulares para operaciones S3 específicas
- **Sanitización**: Limpieza de nombres de archivos y paths para prevenir ataques

### Seguridad del Frontend
- **Protección JWT**: Toda la aplicación protegida por autenticación JWT
- **Almacenamiento local seguro**: IndexedDB aislado por origen de la aplicación
- **No exposición de credenciales**: Las credenciales AWS nunca llegan al frontend
- **Validación dual**: Verificación tanto en frontend como backend
- **Manejo seguro de archivos**: Procesamiento en memoria sin persistencia temporal
- **Guard de rutas**: Componente AuthGuard protege toda la aplicación

### Privacidad
- **Control del usuario**: Los archivos solo se sincronizan cuando el usuario lo decide
- **Autenticación requerida**: Solo usuarios con tokens válidos pueden acceder
- **No tracking**: Sin cookies ni seguimiento de terceros
- **Datos privados**: Los archivos permanecen en el control del usuario (local + su bucket S3)
- **Transparencia**: Estado visible de dónde están almacenados los archivos y quién está autenticado
- **Sesiones controladas**: Los tokens expiran automáticamente según configuración

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

## �️ Scripts Disponibles

### Frontend
- `npm run dev`: Servidor de desarrollo con HMR (puerto 5173)
- `npm run build`: Build optimizada para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Verificación de código con ESLint

### Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon (puerto 3001)
npm start        # Producción con node
```

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
- � **Dashboard S3**: Vista detallada de uso y costos de S3
- �🔄 **Sincronización bidireccional**: Detectar cambios en S3 y sincronizar hacia local

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

---

## 📄 Licencia

MIT License - Proyecto de código abierto

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

## � Documentación Adicional

- **[JWT-AUTH.md](./JWT-AUTH.md)**: Guía completa del sistema de autenticación JWT
- **[backend/README.md](./backend/README.md)**: Documentación específica del backend
- **generate-jwt.cjs**: Script generador con `--help` para ver todas las opciones

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
- **Con token**: http://localhost:5173?token=tu_token_jwt_aqui

## �👨‍💻 Autor

Desarrollado como prueba de concepto para demostrar las capacidades avanzadas de **React + IndexedDB + AWS S3 + Autenticación JWT** con arquitectura de almacenamiento dual, sincronización manual y sistema de autenticación completo.

---

⭐ **¡Proyecto educativo para aprender gestión de estado, almacenamiento web moderno, integración con servicios en la nube y autenticación JWT!** ⭐
