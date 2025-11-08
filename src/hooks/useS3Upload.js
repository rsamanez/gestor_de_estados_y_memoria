import { useState, useCallback } from 'react';

// Usar rutas relativas que funcionen tanto en desarrollo como en producción
const API_BASE_URL = '/api';

// Hook para manejar uploads a S3
export const useS3Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const uploadToS3 = useCallback(async (file, stateId, onProgress) => {
    const fileId = Date.now() + Math.random();
    
    try {
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('stateId', stateId.toString());

      console.log('🚀 Starting upload to S3:', file.name);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Simular progreso (ya que fetch no soporta progress nativo)
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      console.log('✅ Upload successful:', result.data);
      
      // Limpiar progreso después de un momento
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);

      return result.data;

    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadToS3,
    isUploading,
    uploadProgress
  };
};

// API client para operaciones con archivos
export const s3FileAPI = {
  // Subir archivo
  uploadFile: async (file, stateId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stateId', stateId.toString());

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.data;
  },

  // Obtener archivos por estado
  getFilesByState: async (stateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${stateId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get files');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting files from S3:', error);
      return [];
    }
  },

  // Obtener todos los archivos
  getAllFiles: async () => {
    try {
      const allFiles = [];
      
      // Obtener archivos de los 4 estados
      for (let stateId = 1; stateId <= 4; stateId++) {
        const stateFiles = await s3FileAPI.getFilesByState(stateId);
        allFiles.push(...stateFiles);
      }
      
      return allFiles;
    } catch (error) {
      console.error('Error getting all files from S3:', error);
      return [];
    }
  },

  // Eliminar archivo
  deleteFile: async (fileId) => {
    const encodedFileId = encodeURIComponent(fileId);
    const response = await fetch(`${API_BASE_URL}/files/delete/${encodedFileId}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Delete failed');
    }

    return true;
  },

  // Obtener URL de descarga
  getDownloadUrl: async (fileId) => {
    const encodedFileId = encodeURIComponent(fileId);
    const response = await fetch(`${API_BASE_URL}/download/${encodedFileId}`);
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get download URL');
    }

    return result.downloadUrl;
  },

  // Verificar salud de la API y conexión S3
  checkHealth: async () => {
    try {
      // Verificar conexión S3 específicamente
      const response = await fetch(`${API_BASE_URL}/health?test=s3`);
      const result = await response.json();
      
      // Verificar que S3 esté conectado y configurado
      return result.success && result.bucket && result.envCheck?.AWS_ACCESS_KEY_ID;
    } catch (error) {
      console.error('S3 health check failed:', error);
      return false;
    }
  },

  // Convertir archivo base64 de IndexedDB a File y subirlo a S3
  syncIndexedDBFileToS3: async (indexedDBFile) => {
    try {
      // Convertir base64 a Blob
      const response = await fetch(indexedDBFile.content);
      const blob = await response.blob();
      
      // Crear File object
      const file = new File([blob], indexedDBFile.name, { 
        type: indexedDBFile.type 
      });

      // Llamar directamente a la API en lugar de s3FileAPI.uploadFile para evitar referencia circular
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stateId', indexedDBFile.stateId.toString());

      const apiResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.data;
    } catch (error) {
      console.error('Error syncing IndexedDB file to S3:', error);
      throw error;
    }
  },

  // Sincronizar todos los archivos de IndexedDB a S3
  syncAllIndexedDBToS3: async (indexedDBFiles, onProgress) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    console.log(`🔄 Starting sync of ${indexedDBFiles.length} files to S3...`);

    for (let i = 0; i < indexedDBFiles.length; i++) {
      const file = indexedDBFiles[i];
      
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: indexedDBFiles.length,
            fileName: file.name,
            status: 'uploading'
          });
        }

        await s3FileAPI.syncIndexedDBFileToS3(file);
        results.successful++;
        
        console.log(`✅ Synced: ${file.name}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          fileName: file.name,
          error: error.message
        });
        
        console.error(`❌ Failed to sync: ${file.name}`, error.message);
      }
    }

    console.log(`🏁 Sync completed: ${results.successful} successful, ${results.failed} failed`);
    
    return results;
  },

};

// Hook para sincronización entre IndexedDB y S3
export const useS3Sync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'

  const syncToS3 = useCallback(async (localFiles, stateId) => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      console.log(`🔄 Starting sync for state ${stateId}...`);

      // Obtener archivos remotos
      const remoteFiles = await s3FileAPI.getFilesByState(stateId);
      const remoteFileNames = remoteFiles.map(f => f.fileName);

      // Encontrar archivos locales que no están en S3
      const filesToUpload = localFiles.filter(localFile => 
        localFile.stateId === stateId && !remoteFileNames.includes(localFile.name)
      );

      console.log(`📤 Found ${filesToUpload.length} files to upload to S3`);

      if (filesToUpload.length === 0) {
        setSyncStatus('success');
        return {
          success: true,
          uploaded: 0,
          failed: 0,
          total: 0,
          message: 'All files are already synced'
        };
      }

      // Subir archivos usando la nueva función
      const result = await s3FileAPI.syncAllIndexedDBToS3(filesToUpload, (progress) => {
        console.log(`📤 Syncing: ${progress.current}/${progress.total} - ${progress.fileName}`);
      });

      setSyncStatus(result.failed > 0 ? 'error' : 'success');
      
      return {
        success: result.failed === 0,
        uploaded: result.successful,
        failed: result.failed,
        total: filesToUpload.length,
        errors: result.errors
      };

    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncStatus('error');
      throw error;
    } finally {
      setIsSyncing(false);
      
      // Reset status after a moment
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  }, []);

  return {
    syncToS3,
    isSyncing,
    syncStatus
  };
};
