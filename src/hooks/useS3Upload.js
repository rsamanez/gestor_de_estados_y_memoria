import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE_URL}/files/${encodedFileId}`, {
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

  // Verificar salud de la API
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('API health check failed:', error);
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

  // Eliminar archivo de S3
  deleteFromS3: async (fileId) => {
    try {
      console.log('🗑️ Deleting file from S3:', fileId);
      
      const response = await fetch(`${API_BASE_URL}/delete/${encodeURIComponent(fileId)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      console.log('✅ File deleted from S3:', fileId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting from S3:', error);
      throw error;
    }
  },

  // Listar archivos de S3
  listS3Files: async (stateId = null) => {
    try {
      console.log('📋 Listing S3 files for state:', stateId);
      
      const url = stateId 
        ? `${API_BASE_URL}/files?stateId=${stateId}`
        : `${API_BASE_URL}/files`;
        
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'List files failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'List files failed');
      }

      console.log(`✅ Found ${result.files.length} files in S3`);
      return result.files;
    } catch (error) {
      console.error('❌ Error listing S3 files:', error);
      throw error;
    }
  },

  // Sincronización bidireccional completa
  bidirectionalSync: async (localFiles, stateId) => {
    try {
      console.log('🔄 Starting bidirectional sync for state:', stateId);
      
      // 1. Obtener archivos de S3
      const s3Files = await s3FileAPI.listS3Files(stateId);
      
      // 2. Filtrar archivos locales por estado
      const localStateFiles = localFiles.filter(f => f.stateId === stateId);
      
      console.log('📊 Files comparison:', {
        localCount: localStateFiles.length,
        s3Count: s3Files.length,
        localFiles: localStateFiles.map(f => ({ id: f.id, name: f.name })),
        s3Files: s3Files.map(f => ({ id: f.id, name: f.name }))
      });
      
      // 3. Crear mapas para comparación más eficiente
      const localFilesByName = new Map(localStateFiles.map(f => [`${f.name}_${f.size}`, f]));
      const s3FilesByName = new Map(s3Files.map(f => [`${f.name}_${f.size}`, f]));
      
      // Archivos solo en local (necesitan subirse a S3)
      const filesToUpload = localStateFiles.filter(localFile => {
        const key = `${localFile.name}_${localFile.size}`;
        const notInS3 = !s3FilesByName.has(key);
        const hasFileData = localFile.fileData;
        const notSyncedToS3 = !localFile.syncedToS3; // Solo subir si NO está marcado como sincronizado
        
        console.log(`📋 File sync check - ${localFile.name}:`, {
          notInS3,
          hasFileData: !!hasFileData,
          notSyncedToS3,
          shouldUpload: notInS3 && hasFileData && notSyncedToS3
        });
        
        return notInS3 && hasFileData && notSyncedToS3;
      });
      
      // Archivos solo en S3 (necesitan registrarse localmente como metadata)
      const filesToDownload = s3Files.filter(s3File => {
        const key = `${s3File.name}_${s3File.size}`;
        return !localFilesByName.has(key);
      });
      
      // NO eliminar archivos de S3 automáticamente en sync bidireccional
      // Solo eliminar cuando sea una eliminación manual explícita
      const filesToDeleteFromS3 = [];

      console.log('📊 Sync analysis:', {
        toUpload: filesToUpload.length,
        toDownload: filesToDownload.length,
        toDeleteFromS3: filesToDeleteFromS3.length
      });

      const results = {
        uploaded: 0,
        downloaded: 0,
        deletedFromS3: 0,
        errors: []
      };

      // Upload archivos faltantes a S3
      for (const file of filesToUpload) {
        try {
          if (file.fileData) {
            // Recrear File object si tenemos los datos
            const blob = new Blob([new Uint8Array(file.fileData)], { type: file.type });
            const fileObj = new File([blob], file.name, { type: file.type });
            
            await s3FileAPI.uploadToS3(fileObj, stateId);
            results.uploaded++;
          }
        } catch (error) {
          console.error('❌ Upload error:', error);
          results.errors.push(`Upload ${file.name}: ${error.message}`);
        }
      }

      // NO eliminar archivos de S3 automáticamente durante sync bidireccional
      // Solo upload de archivos faltantes y download/registro de metadata
      console.log('ℹ️ Skipping S3 deletion in bidirectional sync - deletion only happens on manual delete');

      console.log('✅ Bidirectional sync completed:', results);
      
      return {
        success: results.errors.length === 0,
        results,
        filesToDownload // Para que el componente los procese
      };
      
    } catch (error) {
      console.error('❌ Bidirectional sync error:', error);
      throw error;
    }
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

// Hook para sincronización automática bidireccional
export const useAutoSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sincronización automática
  const autoSync = useCallback(async (localFiles, stateId, s3Connected) => {
    if (!s3Connected || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('Sincronizando...');
      
      console.log('🔄 Auto sync triggered for state:', stateId);
      
      const result = await s3FileAPI.bidirectionalSync(localFiles, stateId);
      
      if (result.success) {
        setSyncStatus(`✅ Sincronizado: ↑${result.results.uploaded} ↓${result.results.downloaded} 🗑️${result.results.deletedFromS3}`);
      } else {
        setSyncStatus(`⚠️ Sync parcial: ${result.results.errors.length} errores`);
      }
      
      setLastSyncTime(new Date());
      
      // Retornar archivos que necesitan ser agregados localmente
      return result.filesToDownload || [];
      
    } catch (error) {
      console.error('❌ Auto sync error:', error);
      setSyncStatus(`❌ Error: ${error.message}`);
      return [];
    } finally {
      setIsSyncing(false);
      
      // Limpiar estado después de 5 segundos
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
    }
  }, [isSyncing]);

  // Eliminar archivo de S3 automáticamente
  const autoDeleteFromS3 = useCallback(async (fileId, fileName) => {
    try {
      console.log('🗑️ Auto deleting from S3:', fileName);
      const result = await s3FileAPI.deleteFromS3(fileId);
      console.log('✅ Auto delete from S3 completed:', fileName);
      return result;
    } catch (error) {
      console.error('❌ Auto delete from S3 failed:', error, fileName);
      throw error; // Lanzar error para que el componente pueda manejarlo
    }
  }, []);

  return {
    isSyncing,
    syncStatus,
    lastSyncTime,
    autoSync,
    autoDeleteFromS3
  };
};
