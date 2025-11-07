import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un nombre único para el archivo
 */
export function generateFileName(originalName, stateId) {
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  const extension = originalName.split('.').pop();
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `state-${stateId}/${timestamp}-${uuid}-${cleanName}`;
}

/**
 * Valida que el archivo sea válido
 */
export function validateFile(file, maxSize = 100 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Sanitiza el nombre del archivo
 */
export function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}
