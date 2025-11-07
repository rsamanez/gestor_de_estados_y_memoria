#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Configuración por defecto
const DEFAULT_EXPIRATION = '24h'; // 24 horas
const DEFAULT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Convierte tiempo legible a segundos
 * Acepta: '1h', '30m', '24h', '7d', etc.
 */
function parseTimeToSeconds(timeStr) {
  const units = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400,
    'w': 604800
  };
  
  const match = timeStr.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error('Formato de tiempo inválido. Use: 1h, 30m, 24h, 7d, etc.');
  }
  
  const [, number, unit] = match;
  return parseInt(number) * units[unit];
}

/**
 * Genera un token JWT simple sin librerías externas
 */
function generateJWT(payload, secret, expirationInSeconds) {
  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Payload con expiración
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now, // issued at
    exp: now + expirationInSeconds // expires at
  };
  
  // Encode Base64URL
  const base64UrlEncode = (obj) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  // Create signature
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(jwtPayload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Script principal
 */
function main() {
  const args = process.argv.slice(2);
  
  // Ayuda
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔐 Generador de JWT para Gestor de Archivos

Uso:
  node generate-jwt.js [opciones]

Opciones:
  --expiration, -e    Tiempo de expiración (default: 24h)
                      Ejemplos: 1h, 30m, 24h, 7d, 1w
  --secret, -s        Clave secreta (default: clave por defecto)
  --user, -u          Nombre de usuario (default: 'user')
  --output, -o        Archivo de salida (opcional)
  --help, -h          Mostrar esta ayuda

Ejemplos:
  node generate-jwt.js                           # Token válido por 24h
  node generate-jwt.js -e 1h                     # Token válido por 1 hora
  node generate-jwt.js -e 30m -u admin          # Token para 'admin' válido por 30 min
  node generate-jwt.js -o token.txt              # Guardar en archivo
  
Salida:
  - Token JWT
  - URL completa para usar en la aplicación
  - Información de expiración
`);
    return;
  }
  
  // Parsear argumentos
  let expiration = DEFAULT_EXPIRATION;
  let secret = DEFAULT_SECRET;
  let user = 'user';
  let outputFile = null;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--expiration':
      case '-e':
        expiration = args[++i];
        break;
      case '--secret':
      case '-s':
        secret = args[++i];
        break;
      case '--user':
      case '-u':
        user = args[++i];
        break;
      case '--output':
      case '-o':
        outputFile = args[++i];
        break;
    }
  }
  
  try {
    // Generar token
    const expirationSeconds = parseTimeToSeconds(expiration);
    const payload = {
      user: user,
      permissions: ['read', 'write', 'sync'],
      app: 'file-manager'
    };
    
    const token = generateJWT(payload, secret, expirationSeconds);
    const expirationDate = new Date(Date.now() + (expirationSeconds * 1000));
    
    // URLs de ejemplo
    const devUrl = `http://localhost:5173?token=${token}`;
    const prodUrl = `https://your-app.com?token=${token}`;
    
    // Resultado
    const result = `
🔐 TOKEN JWT GENERADO EXITOSAMENTE

📊 Información:
   Usuario: ${user}
   Expiración: ${expiration} (${expirationDate.toLocaleString()})
   Permisos: read, write, sync

🎫 Token:
${token}

🌐 URLs para usar:
   Desarrollo: ${devUrl}
   Producción: ${prodUrl}

⚠️  IMPORTANTE:
   - Guarda este token de forma segura
   - No lo compartas públicamente
   - El token expira automáticamente
   - Usa HTTPS en producción
`;

    console.log(result);
    
    // Guardar en archivo si se especifica
    if (outputFile) {
      const outputData = {
        token,
        user,
        expiration,
        expirationDate: expirationDate.toISOString(),
        generatedAt: new Date().toISOString(),
        urls: {
          development: devUrl,
          production: prodUrl
        }
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Token guardado en: ${outputFile}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export { generateJWT, parseTimeToSeconds };
