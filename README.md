# 🗂️ Gestor de Estados y Archivos

Una aplicación React avanzada que demuestra gestión de estados y subida de archivos con persistencia en IndexedDB del navegador.

## 🚀 Características

- **4 Estados Distintos**: La aplicación maneja 4 estados diferentes entre los que puedes navegar
- **Subida de Archivos Avanzada**: Sube archivos grandes con drag & drop o selección manual
- **Persistencia de Estado**: El estado actual se guarda en IndexedDB y se restaura al recargar
- **Persistencia de Archivos**: Los archivos se almacenan por estado en IndexedDB con mayor capacidad
- **Interfaz Moderna**: UI limpia y responsiva con navegación intuitiva y estados de carga
- **Gestión de Archivos**: Ver, descargar y eliminar archivos por estado con vista previa
- **Monitoreo de Almacenamiento**: Visualización en tiempo real del uso de espacio
- **Validación de Espacio**: Prevención automática de subidas cuando no hay suficiente espacio

## 🛠️ Stack Tecnológico

- **React 18**: Framework de UI con hooks y estado asíncrono
- **Vite**: Herramienta de build rápida y optimizada
- **IndexedDB**: Base de datos del navegador para almacenamiento robusto
- **File API**: Para manejo avanzado de archivos
- **CSS3**: Estilos modernos con gradientes, animaciones y componentes de carga

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── FileUpload.jsx        # Componente de subida con validación de espacio
│   ├── FileUpload.css        # Estilos con barra de almacenamiento
│   ├── FileList.jsx          # Lista y gestión de archivos
│   ├── FileList.css
│   ├── StateNavigation.jsx   # Navegación entre estados
│   └── StateNavigation.css
├── hooks/
│   ├── useLocalStorage.js    # Hook legacy (localStorage)
│   └── useIndexedDB.js       # Hook principal para IndexedDB
├── App.jsx                   # Componente principal con estados de carga
├── App.css                   # Estilos con componentes de loading
├── index.css                 # Estilos globales optimizados
└── main.jsx                  # Punto de entrada

```

## 🚀 Instalación y Uso

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## 💡 Funcionalidades

### Estados
- **Estado 1 (🔴)**: Estado inicial por defecto
- **Estado 2 (🟢)**: Estado alternativo
- **Estado 3 (🔵)**: Tercer estado
- **Estado 4 (🟡)**: Cuarto estado

### Gestión de Archivos Avanzada
- **Drag & Drop**: Arrastra archivos directamente al área de subida
- **Selección múltiple**: Sube varios archivos a la vez
- **Vista previa inteligente**: Iconos dinámicos según tipo de archivo
- **Información detallada**: Tamaño, fecha de subida y metadatos
- **Descarga directa**: Botón de descarga para cada archivo
- **Eliminación segura**: Confirmación visual para eliminar archivos
- **Organización por estado**: Cada estado mantiene su propia colección

### Persistencia Robusta (IndexedDB)
- **Almacenamiento masivo**: Hasta varios GB de capacidad
- **Operaciones asíncronas**: No bloquea la interfaz de usuario
- **Transacciones ACID**: Garantiza integridad de datos
- **Estado persistente**: Se restaura automáticamente al recargar
- **Compatibilidad universal**: Funciona en desktop y móviles

### Monitoreo de Almacenamiento
- **Visualización en tiempo real**: Barra de progreso del uso de espacio
- **Estadísticas detalladas**: Espacio usado, disponible y total
- **Validación preventiva
- **Alertas inteligentes**: Notificaciones cuando se acerca al límite

## 🎨 Características de UI

### Diseño Moderno
- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **Loading States**: Spinners y estados de carga elegantes
- **Animaciones fluidas**: Transiciones suaves y micro-interacciones
- **Feedback visual**: Indicadores de drag & drop y estados activos
- **Iconografía intuitiva**: Emojis y iconos para mejor UX
- **Gradientes dinámicos**: Colores modernos y atractivos

### Componentes Avanzados
- **Barra de almacenamiento**: Visualización gráfica del espacio usado
- **Estados de carga**: Feedback inmediato durante operaciones
- **Navegación por estados**: Botones temáticos con colores únicos
- **Área de drag & drop**: Zona interactiva con respuesta visual
- **Lista de archivos**: Cards organizadas con acciones rápidas

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18**: Hooks avanzados con useState, useEffect y custom hooks
- **IndexedDB API**: Base de datos robusta del navegador
- **File API**: Lectura y procesamiento avanzado de archivos
- **Storage API**: Monitoreo de cuotas y uso de almacenamiento
- **CSS Grid/Flexbox**: Layouts responsivos y modernos
- **CSS Custom Properties**: Variables dinámicas para temas

### Herramientas de Desarrollo
- **Vite**: Build tool optimizado con HMR
- **ESLint**: Linting y calidad de código
- **Modern JavaScript**: ES6+, async/await, Promises

## 📱 Responsividad

La aplicación está optimizada para:
- 📱 Móviles (480px y menos)
- 📱 Tablets (768px y menos)
- 💻 Desktop (1200px y más)

## ⚡ Rendimiento y Optimizaciones

### Almacenamiento Eficiente
- **IndexedDB**: Operaciones asíncronas que no bloquean la UI
- **Gestión de memoria**: Carga bajo demanda de archivos grandes
- **Transacciones optimizadas**: Operaciones batch para mejor rendimiento
- **Compresión inteligente**: Almacenamiento en base64 con metadatos mínimos

### Optimizaciones de React
- **Custom Hooks**: Lógica reutilizable y optimizada
- **Estados de carga**: Prevención de renders innecesarios
- **Manejo de errores**: Recovery automático y feedback al usuario
- **Componentización**: Separación de responsabilidades para mejor mantenimiento

### Experiencia de Usuario
- **Feedback inmediato**: Estados de carga y confirmaciones visuales
- **Validación preventiva**: Verificación de espacio antes de subir archivos
- **Recuperación de errores**: Manejo graceful de fallos de red o almacenamiento
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla

## 🔒 Seguridad y Privacidad

- **Almacenamiento local**: Los datos nunca salen del dispositivo del usuario
- **Aislamiento por dominio**: IndexedDB aislado por origen de la aplicación
- **No tracking**: Sin cookies ni seguimiento de terceros  
- **Validación de archivos**: Verificación de tipos y tamaños permitidos
- **Sanitización**: Manejo seguro de nombres de archivos y metadatos

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

## 🚀 Instalación Avanzada

### Prerrequisitos
- **Node.js 18+**: Para desarrollo óptimo
- **npm 9+** o **yarn 1.22+**: Gestión de dependencias
- **Navegador moderno**: Con soporte para IndexedDB

### Configuración de Desarrollo
```bash
# Clonar el repositorio
git clone <repository-url>
cd prueba

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo con hot reload
npm run dev

# Construir para producción
npm run build

# Vista previa de la build de producción  
npm run preview
```

### Scripts Disponibles
- `npm run dev`: Servidor de desarrollo con HMR
- `npm run build`: Build optimizada para producción
- `npm run preview`: Vista previa de la build
- `npm run lint`: Verificación de código con ESLint

## 📖 Ejemplos de Uso

### Flujo Básico de Trabajo
1. **Iniciar aplicación**: Se carga en el Estado 1 por defecto
2. **Subir archivos**: Arrastra imágenes, documentos o cualquier archivo
3. **Cambiar estado**: Haz clic en Estado 2, 3 o 4 para organizaciones diferentes
4. **Gestionar archivos**: Descarga o elimina archivos según necesites
5. **Persistencia automática**: Cierra y reabre - todo se mantiene

### Casos de Uso Comunes
- **📊 Organización de documentos**: Un estado por proyecto o categoría
- **🎨 Gestión de assets**: Separar imágenes, videos, documentos
- **📁 Backup temporal**: Almacenamiento local antes de subir a la nube
- **🔄 Estados de workflow**: Borradores, en revisión, aprobados, publicados

### Límites Recomendados
- **Archivo individual**: Máximo 50MB para mejor rendimiento
- **Total por estado**: Hasta 500MB recomendado
- **Tipos de archivo**: Todos soportados (imágenes, videos, documentos, código)

## 🛠️ Troubleshooting

### Problemas Comunes

#### ❌ "Error inicializando IndexedDB"
**Solución:**
- Verifica que el navegador soporte IndexedDB
- Revisa que no esté en modo incógnito (algunos navegadores limitan IndexedDB)
- Limpia caché y cookies del sitio

#### ❌ "No hay suficiente espacio disponible"
**Solución:**
- Elimina archivos antiguos de otros estados
- Usa archivos más pequeños (comprime imágenes/videos)
- Verifica espacio en disco del dispositivo

#### ❌ "Error al subir archivo"
**Solución:**
- Verifica que el archivo no esté corrupto
- Intenta con un archivo más pequeño
- Recarga la página y vuelve a intentar

### Performance Tips
- **Archivos grandes**: Sube de a uno para mejor feedback
- **Muchos archivos**: Agrupa en lotes pequeños
- **Almacenamiento lleno**: Limpia regularmente archivos no usados
- **Navegadores antiguos**: Actualiza para mejor compatibilidad

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- 🔍 **Búsqueda y filtros**: Buscar archivos por nombre, tipo o fecha
- 📊 **Analytics**: Estadísticas de uso y almacenamiento  
- 🎨 **Temas personalizables**: Dark mode y colores customizables
- 📤 **Export/Import**: Respaldo y restauración de configuraciones
- 🔄 **Sincronización**: Integración con servicios de nube

---

## 📄 Licencia

MIT License - Proyecto de código abierto

## 👨‍💻 Autor

Desarrollado como prueba de concepto para demostrar las capacidades avanzadas de **React + IndexedDB**.

---

⭐ **¡Proyecto educativo para aprender gestión de estado y almacenamiento web!** ⭐
