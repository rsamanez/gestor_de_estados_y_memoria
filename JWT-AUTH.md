# 🔐 Sistema de Autenticación JWT

## Descripción

Este sistema añade autenticación JWT a la aplicación de gestión de archivos. Solo los usuarios con un token JWT válido pueden acceder a la aplicación.

## 🚀 Uso Rápido

### 1. Generar Token JWT
```bash
# Token básico válido por 24 horas
node generate-jwt.cjs

# Token válido por 1 hora
node generate-jwt.cjs -e 1h

# Token para usuario específico válido por 30 minutos
node generate-jwt.cjs -e 30m -u admin

# Ver todas las opciones
node generate-jwt.cjs --help
```

### 2. Usar el Token
El script generará una URL completa que puedes usar directamente:
```
http://localhost:5173?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Acceder a la Aplicación
- Copia y pega la URL generada en tu navegador
- La aplicación validará automáticamente el token
- Si el token es válido, accederás a la aplicación
- Si el token es inválido o ha expirado, verás un mensaje de error

## 📋 Características

### ✅ Seguridad
- **Tokens firmados**: Cada token está firmado criptográficamente
- **Expiración configurable**: Los tokens expiran automáticamente
- **Validación de aplicación**: Solo tokens generados para esta app son válidos
- **No almacenamiento inseguro**: Los tokens se almacenan en sessionStorage

### ✅ Experiencia de Usuario
- **URL limpia**: El token se remueve de la URL después de la validación
- **Persistencia de sesión**: El token se mantiene durante la sesión del navegador
- **Verificación automática**: Verifica la expiración cada minuto
- **Información visible**: Muestra usuario y tiempo de expiración

### ✅ Flexibilidad
- **Múltiples usuarios**: Genera tokens para diferentes usuarios
- **Tiempos variables**: Desde minutos hasta semanas
- **Fácil regeneración**: Genera nuevos tokens cuando expiren

## 🔧 Comandos Útiles

```bash
# Desarrollo - token de 1 hora
node generate-jwt.cjs -e 1h -u developer

# Testing - token de 30 minutos
node generate-jwt.cjs -e 30m -u tester

# Demo - token de 5 minutos
node generate-jwt.cjs -e 5m -u demo

# Producción - token de 8 horas
node generate-jwt.cjs -e 8h -u admin

# Guardar token en archivo
node generate-jwt.cjs -e 2h -u admin -o admin-token.json
```

## 🛡️ Configuración de Seguridad

### Cambiar Clave Secreta (Recomendado)
1. Edita `generate-jwt.cjs` línea 6:
   ```javascript
   const DEFAULT_SECRET = 'tu-clave-super-secreta-aqui';
   ```

2. Edita `src/hooks/useJWTAuth.js` línea 4:
   ```javascript
   const JWT_SECRET = 'tu-clave-super-secreta-aqui';
   ```

⚠️ **IMPORTANTE**: En producción, la clave secreta debería venir del backend, no estar en el frontend.

## 🔍 Validaciones

El sistema valida:
- ✅ Formato correcto del JWT (3 partes)
- ✅ Algoritmo de firma (HS256)
- ✅ Firma criptográfica válida
- ✅ Token no expirado
- ✅ Token generado para esta aplicación
- ✅ Estructura de payload correcta

## 🚨 Mensajes de Error

| Error | Causa | Solución |
|-------|-------|----------|
| "No se encontró token" | Sin parámetro `?token=` en URL | Genera un nuevo token |
| "Token expirado" | Token pasó su fecha de expiración | Genera un nuevo token |
| "Firma inválida" | Token modificado o clave incorrecta | Verifica la clave secreta |
| "Token malformado" | JWT con formato incorrecto | Usa el script generador |

## 📱 Flujo de Uso

```
┌─────────────────┐
│ 1. Generar JWT  │
│ $ node gen...   │
└─────┬───────────┘
      │
      v
┌─────────────────┐
│ 2. Abrir URL    │
│ con ?token=...  │
└─────┬───────────┘
      │
      v
┌─────────────────┐
│ 3. Validación   │
│ automática      │
└─────┬───────────┘
      │
      v
┌─────────────────┐
│ 4. Acceso o     │
│ Error según     │
│ validación      │
└─────────────────┘
```

## 🧪 Testing

```bash
# Token de prueba de 1 minuto para testing rápido
node generate-jwt.cjs -e 1m -u test

# Esperar 1 minuto y recargar para probar expiración
# Debería mostrar "Token expirado"
```

## 💡 Tips

- **Desarrollo**: Usa tokens de 1-2 horas para no tener que regenerar constantemente
- **Testing**: Usa tokens cortos (5-30 min) para probar flujos de expiración
- **Demo**: Usa tokens de 1 día para demostraciones largas
- **Seguridad**: Cambia la clave secreta antes de usar en producción
- **Compartir**: Solo comparte URLs con tokens a usuarios autorizados

¡El sistema está listo para usar! 🚀
