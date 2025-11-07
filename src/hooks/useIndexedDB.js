import { useState, useEffect } from 'react';

// Configuración de la base de datos
const DB_NAME = 'FileManagerDB';
const DB_VERSION = 1;
const STORES = {
  FILES: 'files',
  APP_STATE: 'appState'
};

// Clase para manejar IndexedDB
class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  // Inicializar la base de datos
  async init() {
    console.log('🔧 Initializing IndexedDB...');
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para archivos
        if (!db.objectStoreNames.contains(STORES.FILES)) {
          const filesStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
          filesStore.createIndex('stateId', 'stateId', { unique: false });
          filesStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }

        // Store para estado de la aplicación
        if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
          db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
        }

        console.log('IndexedDB stores created');
      };
    });
  }

  // Guardar archivo
  async saveFile(stateId, file) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
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

        const transaction = this.db.transaction([STORES.FILES], 'readwrite');
        const store = transaction.objectStore(STORES.FILES);
        const request = store.add(fileData);

        request.onsuccess = () => {
          console.log('File saved to IndexedDB:', fileData.name);
          resolve(fileData);
        };

        request.onerror = () => {
          console.error('Error saving file:', request.error);
          reject(request.error);
        };
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // Obtener archivos por estado
  async getFilesByState(stateId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FILES], 'readonly');
      const store = transaction.objectStore(STORES.FILES);
      const index = store.index('stateId');
      const request = index.getAll(stateId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error getting files:', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener todos los archivos
  async getAllFiles() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FILES], 'readonly');
      const store = transaction.objectStore(STORES.FILES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error getting all files:', request.error);
        reject(request.error);
      };
    });
  }

  // Eliminar archivo
  async deleteFile(fileId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FILES], 'readwrite');
      const store = transaction.objectStore(STORES.FILES);
      const request = store.delete(fileId);

      request.onsuccess = () => {
        console.log('File deleted from IndexedDB:', fileId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Error deleting file:', request.error);
        reject(request.error);
      };
    });
  }

  // Guardar estado de la aplicación
  async saveAppState(key, value) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.APP_STATE], 'readwrite');
      const store = transaction.objectStore(STORES.APP_STATE);
      const request = store.put({ key, value, updatedAt: new Date().toISOString() });

      request.onsuccess = () => {
        resolve(value);
      };

      request.onerror = () => {
        console.error('Error saving app state:', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener estado de la aplicación
  async getAppState(key, defaultValue = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.APP_STATE], 'readonly');
      const store = transaction.objectStore(STORES.APP_STATE);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };

      request.onerror = () => {
        console.error('Error getting app state:', request.error);
        resolve(defaultValue); // En caso de error, devolver valor por defecto
      };
    });
  }

  // Obtener información de almacenamiento (si está disponible)
  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota - estimate.usage,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
      }
    }
    return null;
  }
}

// Instancia singleton
const dbManager = new IndexedDBManager();

// Hook personalizado para usar IndexedDB
export const useIndexedDB = (key, initialValue) => {
  console.log('🔧 useIndexedDB hook called with:', key, initialValue);
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useIndexedDB useEffect triggered for key:', key);
    const loadValue = async () => {
      try {
        console.log('📥 Loading value from IndexedDB for key:', key);
        const value = await dbManager.getAppState(key, initialValue);
        console.log('✅ Value loaded:', value);
        setStoredValue(value);
      } catch (error) {
        console.error(`❌ Error loading value for key "${key}":`, error);
        setStoredValue(initialValue);
      } finally {
        console.log('🏁 Setting isLoading to false for key:', key);
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key, initialValue]);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await dbManager.saveAppState(key, valueToStore);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
};

// Hook mejorado con manejo de errores
export const useIndexedDBSafe = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 Safe IndexedDB hook loading for key:', key);
    
    const loadValue = async () => {
      try {
        console.log('🔧 Initializing database...');
        await dbManager.init();
        console.log('✅ Database initialized');
        
        console.log('📥 Getting app state for key:', key);
        const value = await dbManager.getAppState(key, initialValue);
        console.log('✅ Value retrieved:', value);
        
        setStoredValue(value);
        setError(null);
      } catch (error) {
        console.error(`❌ Error in safe hook for key "${key}":`, error);
        setStoredValue(initialValue);
        setError(error);
      } finally {
        console.log('🏁 Setting loading to false for key:', key);
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key, initialValue]);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (!error) {
        await dbManager.saveAppState(key, valueToStore);
        console.log('💾 Safe hook saved:', key, valueToStore);
      } else {
        console.warn('⚠️ IndexedDB not available, using in-memory storage only');
      }
    } catch (error) {
      console.error(`❌ Error setting value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading, error];
};

// Hook simplificado para debugging
export const useSimpleIndexedDB = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Simple hook loading for key:', key);
    
    // Simular carga async
    setTimeout(() => {
      console.log('✅ Simple hook loaded for key:', key);
      setIsLoading(false);
    }, 100);
  }, [key]);

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    console.log('💾 Simple hook saved:', key, valueToStore);
  };

  return [storedValue, setValue, isLoading];
};

// Exportar utilidades para archivos
export const fileStorageDB = {
  // Guardar archivo en un estado específico
  saveFile: async (stateId, file) => {
    try {
      return await dbManager.saveFile(stateId, file);
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Obtener archivos de un estado específico
  getFiles: async (stateId) => {
    try {
      return await dbManager.getFilesByState(stateId);
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  },

  // Obtener todos los archivos
  getAllFiles: async () => {
    try {
      return await dbManager.getAllFiles();
    } catch (error) {
      console.error('Error getting all files:', error);
      return [];
    }
  },

  // Eliminar archivo
  deleteFile: async (fileId) => {
    try {
      return await dbManager.deleteFile(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Obtener información de almacenamiento
  getStorageInfo: async () => {
    try {
      return await dbManager.getStorageInfo();
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
};

export default dbManager;
