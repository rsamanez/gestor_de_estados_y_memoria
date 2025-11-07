import { useState, useEffect } from 'react';

// Hook personalizado para manejar localStorage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Utilidades para manejar archivos en localStorage
export const fileStorage = {
  // Guardar archivo en un estado específico
  saveFile: (stateId, file) => {
    try {
      const key = `files_state_${stateId}`;
      const existingFiles = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Convertir archivo a base64 para almacenamiento
      const reader = new FileReader();
      return new Promise ((resolve, reject) => {
        reader.onload = () => {
          const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result,
            uploadedAt: new Date().toISOString(),
            stateId: stateId
          };
          
          const updatedFiles = [...existingFiles, fileData];
          localStorage.setItem(key, JSON.stringify(updatedFiles));
          resolve(fileData);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Obtener archivos de un estado específico
  getFiles: (stateId) => {
    try {
      const key = `files_state_${stateId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  },

  // Eliminar archivo
  deleteFile: (stateId, fileId) => {
    try {
      const key = `files_state_${stateId}`;
      const existingFiles = JSON.parse(localStorage.getItem(key) || '[]');
      const updatedFiles = existingFiles.filter(file => file.id !== fileId);
      localStorage.setItem(key, JSON.stringify(updatedFiles));
      return updatedFiles;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Obtener todos los archivos de todos los estados
  getAllFiles: () => {
    const allFiles = [];
    for (let i = 1; i <= 4; i++) {
      const stateFiles = fileStorage.getFiles(i);
      allFiles.push(...stateFiles);
    }
    return allFiles;
  }
};
