#!/bin/bash

# Script para crear URLs cortas en el proyecto desplegado en Vercel
# Uso: ./create-vercel-short-url.sh

set -e

VERCEL_URL="https://prueba-1es5iooo3-rsamanezs-projects.vercel.app"

echo "🚀 CREAR URL CORTA EN VERCEL"
echo "============================="
echo "🌐 Proyecto: $VERCEL_URL"
echo ""

# Verificar si el parámetro JWT se pasó como argumento
if [ -z "$1" ]; then
    echo "🎫 Generando JWT token local..."
    JWT_OUTPUT=$(node generate-jwt.cjs -e 8h -u vercel-user)
    JWT_TOKEN=$(echo "$JWT_OUTPUT" | grep "Token:" -A 1 | tail -1)
    echo "✅ Token generado (8h de duración)"
    echo "   Token: ${JWT_TOKEN:0:50}..."
else
    JWT_TOKEN="$1"
    echo "🎫 Usando token proporcionado: ${JWT_TOKEN:0:50}..."
fi

echo ""

# Duración de la URL corta (default 6h)
EXPIRES_IN="${2:-6h}"
echo "⏱️  Duración de URL corta: $EXPIRES_IN"
echo ""

# Crear URL corta
echo "🔗 Creando URL corta en Vercel..."
echo "   Endpoint: $VERCEL_URL/api/short"

SHORT_URL_RESPONSE=$(curl -s -X POST "$VERCEL_URL/api/short" \
  -H "Content-Type: application/json" \
  -H "User-Agent: URL-Shortener-Script/1.0" \
  -d "{\"token\":\"$JWT_TOKEN\",\"expiresIn\":\"$EXPIRES_IN\"}")

# Verificar si la respuesta es HTML (protección de Vercel)
if echo "$SHORT_URL_RESPONSE" | grep -q "<!doctype html>"; then
    echo "❌ ERROR: El proyecto está protegido por Vercel Authentication"
    echo ""
    echo "🔧 SOLUCIÓN:"
    echo "   1. Ve a Vercel Dashboard: https://vercel.com/rsamanezs-projects/prueba/settings"
    echo "   2. Navega a 'Deployment Protection'"
    echo "   3. Desactiva la protección para testing público"
    echo "   4. O usa el bypass token si lo tienes"
    echo ""
    echo "📋 Comando alternativo con bypass:"
    echo "   export BYPASS_TOKEN='tu_bypass_token'"
    echo "   curl -X POST \"$VERCEL_URL/api/urls/create?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=\$BYPASS_TOKEN\""
    echo ""
    exit 1
fi

# Verificar si la respuesta es JSON válida
if echo "$SHORT_URL_RESPONSE" | jq . >/dev/null 2>&1; then
    SHORT_CODE=$(echo "$SHORT_URL_RESPONSE" | jq -r '.shortCode // empty')
    SHORT_URL=$(echo "$SHORT_URL_RESPONSE" | jq -r '.shortUrl // empty')
    EXPIRES_AT=$(echo "$SHORT_URL_RESPONSE" | jq -r '.expiresAt // empty')
    
    if [ -n "$SHORT_CODE" ] && [ -n "$SHORT_URL" ]; then
        echo "✅ URL CORTA CREADA EXITOSAMENTE!"
        echo ""
        echo "📊 INFORMACIÓN:"
        echo "   Código: $SHORT_CODE"
        echo "   URL Corta: $SHORT_URL"
        echo "   Expira: $EXPIRES_AT"
        echo ""
        echo "🔗 PARA USAR:"
        echo "   Directa: $VERCEL_URL?token=$JWT_TOKEN"
        echo "   Corta: $SHORT_URL"
        echo ""
        echo "📋 COMANDOS ÚTILES:"
        echo "   # Ver estadísticas"
        echo "   curl \"$VERCEL_URL/api/short?c=$SHORT_CODE&stats=true\""
        echo ""
        echo "   # Crear otra URL"
        echo "   ./create-vercel-short-url.sh \"$JWT_TOKEN\" \"4h\""
        echo ""
        echo "✨ ¡Abre la URL corta en tu navegador!"
    else
        echo "❌ Error: Respuesta inesperada del servidor"
        echo "Respuesta: $SHORT_URL_RESPONSE"
    fi
else
    echo "❌ Error: Respuesta no es JSON válido"
    echo "Respuesta: $SHORT_URL_RESPONSE"
fi