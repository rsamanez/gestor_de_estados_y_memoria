#!/bin/bash

echo "🧪 Testing API Endpoints"
echo "========================="

BASE_URL="http://localhost:3001"

echo ""
echo "1. 🔍 Testing Health Check..."
curl -s "$BASE_URL/api/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health"

echo ""
echo ""
echo "2. 📁 Testing File List (State 1)..."
curl -s "$BASE_URL/api/files/state/1" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/files/state/1"

echo ""
echo ""
echo "3. 🔗 Testing URL Creation..."
curl -s -X POST "$BASE_URL/api/urls/create" \
  -H "Content-Type: application/json" \
  -d '{"token":"test-jwt-token","expiresIn":"1h"}' | jq '.' 2>/dev/null || \
curl -s -X POST "$BASE_URL/api/urls/create" \
  -H "Content-Type: application/json" \
  -d '{"token":"test-jwt-token","expiresIn":"1h"}'

echo ""
echo ""
echo "4. 📊 Testing File Upload (requires multipart/form-data)..."
echo "   Note: File upload requires form data, test manually or with frontend"

echo ""
echo ""
echo "✅ API Testing Complete!"
echo "🌐 Open frontend: http://localhost:5173"
echo "🔧 API docs: http://localhost:3001/api/health"