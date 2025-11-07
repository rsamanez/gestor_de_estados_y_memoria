// Test específico para verificar importaciones
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Testing imports...');

try {
  const { AWS } = await import('./lib/aws-config.js');
  console.log('✅ AWS config imported successfully');
} catch (error) {
  console.log('❌ AWS config import failed:', error.message);
}

try {
  const { getStore } = await import('./lib/storage.js');
  console.log('✅ Storage imported successfully');
} catch (error) {
  console.log('❌ Storage import failed:', error.message);
}