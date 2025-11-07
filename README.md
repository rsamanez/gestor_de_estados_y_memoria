# 🗂️ Gestor de Estados y Archivos

Una aplicación React que demuestra gestión de estados y subida de archivos con persistencia en localStorage del navegador.

## 🚀 Características

- **4 Estados Distintos**: La aplicación maneja 4 estados diferentes entre los que puedes navegar
- **Subida de Archivos**: Sube archivos en cualquier estado con drag & drop o selección manual
- **Persistencia de Estado**: El estado actual se guarda en localStorage y se restaura al recargar
- **Persistencia de Archivos**: Los archivos se almacenan por estado en localStorage
- **Interfaz Moderna**: UI limpia y responsiva con navegación intuitiva
- **Gestión de Archivos**: Ver, descargar y eliminar archivos por estado

## 🛠️ Stack Tecnológico

- **React 18**: Framework de UI con hooks
- **Vite**: Herramienta de build rápida
- **localStorage**: Almacenamiento del navegador para persistencia
- **File API**: Para manejo de archivos
- **CSS3**: Estilos modernos con gradientes y animaciones

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── FileUpload.jsx        # Componente de subida de archivos
│   ├── FileUpload.css
│   ├── FileList.jsx          # Lista y gestión de archivos
│   ├── FileList.css
│   ├── StateNavigation.jsx   # Navegación entre estados
│   └── StateNavigation.css
├── hooks/
│   └── useLocalStorage.js    # Hook personalizado y utilidades
├── App.jsx                   # Componente principal
├── App.css
├── index.css                 # Estilos globales
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

### Gestión de Archivos
- Arrastra y suelta archivos o haz clic para seleccionar
- Vista previa de archivos con iconos según tipo
- Información de tamaño y fecha de subida
- Descarga y eliminación de archivos
- Archivos organizados por estado

### Persistencia
- El estado actual se guarda automáticamente
- Los archivos se almacenan por estado en localStorage
- Al recargar la página, se restaura el último estado usado
- Los archivos persisten entre sesiones del navegador

## 🎨 Características de UI

- Diseño responsivo para móviles y desktop
- Animaciones suaves y transiciones
- Indicadores visuales de estado activo
- Drag & drop con feedback visual
- Iconos emoji para mejor UX
- Gradientes y sombras modernas

## 🔧 Tecnologías Utilizadas

- **React Hooks**: useState, useEffect para gestión de estado
- **localStorage API**: Para persistencia de datos
- **File API**: Para lectura y manejo de archivos
- **CSS Grid/Flexbox**: Para layouts responsivos
- **CSS Custom Properties**: Para temas dinámicos

## 📱 Responsividad

La aplicación está optimizada para:
- 📱 Móviles (480px y menos)
- 📱 Tablets (768px y menos)
- 💻 Desktop (1200px y más)

## ⚡ Rendimiento

- Uso eficiente de localStorage
- Carga lazy de archivos grandes
- Optimización de re-renders con React hooks
- Compresión de archivos en base64
