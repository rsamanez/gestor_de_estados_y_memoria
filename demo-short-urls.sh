#!/bin/bash

# Demo de URLs cortas para el sistema JWT
# Uso: ./demo-short-urls.sh

set -e  # Salir si hay errores

echo "🔗 DEMO DE URLs CORTAS JWT - File Manager"
echo "=========================================="
echo ""

# Verificar que el backend esté corriendo
echo "🔍 Verificando backend..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Backend no está corriendo en puerto 3001"
    echo "   Ejecuta: npm run test-server"
    exit 1
fi
echo "✅ Backend está activo"
echo ""

# Generar token JWT
echo "🎫 Generando token JWT..."
JWT_OUTPUT=$(node generate-jwt.cjs -e 4h -u demo-user)
JWT_TOKEN=$(echo "$JWT_OUTPUT" | grep "Token:" -A 1 | tail -1)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Error generando token JWT"
    exit 1
fi

echo "✅ Token generado para usuario 'demo-user' (4h de duración)"
echo "   Token: ${JWT_TOKEN:0:50}..."
echo ""

# Crear URL corta
echo "🔗 Creando URL corta..."
SHORT_URL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/urls/create \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$JWT_TOKEN\",\"expiresIn\":\"4h\"}")

if [ $? -ne 0 ]; then
    echo "❌ Error creando URL corta"
    exit 1
fi

SHORT_CODE=$(echo "$SHORT_URL_RESPONSE" | grep -o '"shortCode":"[^"]*"' | cut -d'"' -f4)
SHORT_URL=$(echo "$SHORT_URL_RESPONSE" | grep -o '"shortUrl":"[^"]*"' | cut -d'"' -f4)

echo "✅ URL corta creada:"
echo "   Código: $SHORT_CODE"
echo "   URL: $SHORT_URL"
echo ""

# Mostrar estadísticas iniciales
echo "📊 Estadísticas iniciales:"
curl -s http://localhost:3001/api/urls/stats/$SHORT_CODE | \
  jq -r '"   Código: " + .shortCode + "\n   Creado: " + .createdAt + "\n   Expira: " + .expiresAt + "\n   Clicks: " + (.clicks|tostring) + "\n   Expirado: " + (.isExpired|tostring)'
echo ""

# Simular acceso (redirección)
echo "🌐 Simulando acceso a URL corta..."
REDIRECT_RESPONSE=$(curl -s -I "$SHORT_URL")
REDIRECT_URL=$(echo "$REDIRECT_RESPONSE" | grep "Location:" | cut -d' ' -f2 | tr -d '\r\n')

if [ -n "$REDIRECT_URL" ]; then
    echo "✅ Redirección exitosa:"
    echo "   Redirige a: ${REDIRECT_URL:0:80}..."
else
    echo "❌ Error en redirección"
    exit 1
fi
echo ""

# Mostrar estadísticas después del acceso
echo "📊 Estadísticas después del acceso:"
curl -s http://localhost:3001/api/urls/stats/$SHORT_CODE | \
  jq -r '"   Código: " + .shortCode + "\n   Clicks: " + (.clicks|tostring) + " (debería ser 1+)\n   Expirado: " + (.isExpired|tostring)'
echo ""

# Instrucciones finales
echo "🎉 DEMO COMPLETADA EXITOSAMENTE"
echo ""
echo "🔗 URLs para probar manualmente:"
echo "   Directa: $REDIRECT_URL"
echo "   Corta:   $SHORT_URL"
echo ""
echo "📖 Comandos útiles:"
echo "   # Ver estadísticas"
echo "   curl http://localhost:3001/api/urls/stats/$SHORT_CODE"
echo ""
echo "   # Crear otra URL corta"
echo "   curl -X POST http://localhost:3001/api/urls/create \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"token\":\"$JWT_TOKEN\",\"expiresIn\":\"2h\"}'"
echo ""
echo "✨ Abre la URL corta en tu navegador para ver la aplicación!"
