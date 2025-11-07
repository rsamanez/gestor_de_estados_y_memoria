import { useState, useEffect } from 'react'
import { useIndexedDBSafe, fileStorageDB } from './hooks/useIndexedDB'
import { useS3Upload, useAutoSync, s3FileAPI } from './hooks/useS3Upload'
import StateNavigation from './components/StateNavigation'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import S3UploadStatus from './components/S3UploadStatus'
import './App.css'

function App() {
  console.log('🚀 App component is rendering...');
  
  // Estado actual (persistido en IndexedDB con hook seguro)
  const [indexedDBState, setIndexedDBState, isIndexedDBLoading, indexedDBError] = useIndexedDBSafe('currentAppState', 1);
  const [fallbackState, setFallbackState] = useState(1);
  
  // Usar IndexedDB si está disponible, sino fallback
  const currentState = isIndexedDBLoading ? fallbackState : indexedDBState;
  const isStateLoading = isIndexedDBLoading;
  
  // Lista de archivos y estados de la aplicación
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [storageInfo, setStorageInfo] = useState(null);
  const [s3Connected, setS3Connected] = useState(false);
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);
  const [justUploadedFile, setJustUploadedFile] = useState(false);
  
  // Hooks para S3
  const { uploadToS3, isUploading, uploadProgress } = useS3Upload();
  const { isSyncing: isAutoSyncing, syncStatus, lastSyncTime, autoSync, autoDeleteFromS3 } = useAutoSync();
  
  // Cargar archivos al montar el componente o cambiar de estado
  useEffect(() => {
    if (!isStateLoading) {
      loadFiles();
      loadStorageInfo();
      checkS3Connection();
    }
  }, [currentState, isStateLoading]);

  // Verificar conexión con S3 cada 30 segundos
  useEffect(() => {
    const interval = setInterval(checkS3Connection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sincronización automática segura (solo upload) cuando cambia el estado o se conecta S3
  useEffect(() => {
    if (!isStateLoading && s3Connected && files.length > 0 && !isLocalSyncing && !isAutoSyncing && !justUploadedFile) {
      const performSafeAutoSync = async () => {
        try {
          await syncLocalFilesToS3();
        } catch (error) {
          console.error('❌ Safe auto sync failed:', error);
        }
      };

      // Sincronizar después de un delay para evitar múltiples llamadas
      const syncTimeout = setTimeout(performSafeAutoSync, 2000);
      return () => clearTimeout(syncTimeout);
    }
  }, [currentState, s3Connected, files.length, isStateLoading, isLocalSyncing, isAutoSyncing, justUploadedFile]);

  // Función de sincronización automática segura (solo upload de archivos locales a S3)
  const syncLocalFilesToS3 = async () => {
    if (!s3Connected || isLocalSyncing || isAutoSyncing) {
      console.log('⏸️ Sync skipped - S3 connected:', s3Connected, 'isLocalSyncing:', isLocalSyncing, 'isAutoSyncing:', isAutoSyncing);
      return;
    }

    setIsLocalSyncing(true);
    try {
      console.log('🔄 Starting safe auto sync (upload only)...');
      console.log('📊 Current state:', currentState);
      console.log('📁 Total files:', files.length);
      
      // Obtener archivos del estado actual que tengan datos y NO estén ya sincronizados
      const localFilesWithData = files.filter(f => 
        f.stateId === currentState && 
        f.content && 
        f.content.length > 0 &&
        !f.source && // Solo archivos locales, no los de S3
        !f.syncedToS3 // No sincronizados previamente
      );

      console.log(`🔍 Files in current state (${currentState}):`, files.filter(f => f.stateId === currentState).length);
      console.log(`💾 Local files pending sync:`, localFilesWithData.length);

      if (localFilesWithData.length === 0) {
        console.log('📭 No local files pending sync');
        return;
      }

      console.log(`📤 Found ${localFilesWithData.length} local files to upload to S3`);

      let uploadedCount = 0;
      
      for (const localFile of localFilesWithData) {
        try {
          console.log('📤 Uploading to S3:', localFile.name);
          
          // Recrear File object desde los datos base64 almacenados
          const response = await fetch(localFile.content);
          const blob = await response.blob();
          const fileObj = new File([blob], localFile.name, { type: localFile.type });
          
          await uploadToS3(fileObj, currentState);
          
          // Marcar como sincronizado en IndexedDB
          await fileStorageDB.markAsSynced(localFile.id);
          
          uploadedCount++;
          console.log('✅ Uploaded to S3 and marked as synced:', localFile.name);
          
        } catch (error) {
          console.error(`❌ Failed to upload ${localFile.name}:`, error.message);
        }
      }

      if (uploadedCount > 0) {
        console.log(`✅ Safe auto sync completed: ${uploadedCount} files uploaded to S3`);
        // Recargar archivos para actualizar el estado de sincronización
        await loadFiles();
      } else {
        console.log('ℹ️ Safe auto sync completed: No files needed uploading');
      }

    } catch (error) {
      console.error('❌ Safe auto sync failed:', error);
    } finally {
      setIsLocalSyncing(false);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const allFiles = await fileStorageDB.getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await fileStorageDB.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const checkS3Connection = async () => {
    try {
      const isHealthy = await s3FileAPI.checkHealth();
      setS3Connected(isHealthy);
    } catch (error) {
      console.error('S3 connection check failed:', error);
      setS3Connected(false);
    }
  };

  const handleFileUploaded = async (file) => {
    try {
      console.log('📁 Uploading file:', file.name);
      
      // Evitar sincronización automática temporalmente
      setJustUploadedFile(true);

      // 1. Guardar en IndexedDB primero (almacenamiento inmediato)
      const localFile = await fileStorageDB.saveFile(currentState, file);
      console.log('✅ File saved to IndexedDB:', localFile.name);

      // 2. Subir automáticamente a S3 en segundo plano si está conectado
      if (s3Connected) {
        try {
          console.log('☁️ Auto uploading to S3 immediately:', file.name);
          const s3File = await uploadToS3(file, currentState);
          console.log('✅ Auto S3 upload completed:', file.name, s3File);
          
          // Marcar inmediatamente como sincronizado para evitar doble upload
          await fileStorageDB.markAsSynced(localFile.id);
          console.log('✅ File marked as synced immediately:', file.name);
          
        } catch (s3Error) {
          console.warn('⚠️ Auto S3 upload failed, file saved locally:', s3Error.message);
        }
      } else {
        console.log('📱 S3 not connected, file saved locally only');
      }
      
      // 3. Recargar archivos y storage info UNA sola vez al final
      await loadFiles();
      await loadStorageInfo();
      
      // 4. Permitir sincronización automática después de un delay
      setTimeout(() => {
        setJustUploadedFile(false);
      }, 3000); // 3 segundos de gracia
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      setJustUploadedFile(false); // Reset en caso de error
      throw error;
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      // Encontrar información del archivo antes de eliminarlo
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (!fileToDelete) {
        console.error('File not found for deletion:', fileId);
        return;
      }

      console.log('🗑️ Deleting file:', fileToDelete.name);

      // 1. Eliminar de IndexedDB primero
      await fileStorageDB.deleteFile(fileId);

      // 2. Si está conectado a S3, eliminar también de allí
      if (s3Connected) {
        try {
          // Construir la clave de S3 correcta
          const s3Key = `state-${fileToDelete.stateId}/${fileToDelete.name}`;
          console.log('🗑️ Also deleting from S3:', s3Key);
          
          await autoDeleteFromS3(s3Key, fileToDelete.name);
          console.log('✅ File deleted from both local and S3');
        } catch (s3Error) {
          console.warn('⚠️ Failed to delete from S3 but deleted locally:', s3Error.message);
        }
      }

      // 3. Actualizar la UI
      await loadFiles();
      await loadStorageInfo();
      
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      alert('Error al eliminar el archivo. Por favor intente nuevamente.');
    }
  };



  const getTotalFiles = () => {
    return files.length;
  };

  const getCurrentStateFiles = () => {
    return files.filter(file => file.stateId === currentState).length;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStateChange = (newState) => {
    if (isIndexedDBLoading) {
      setFallbackState(newState);
    } else {
      setIndexedDBState(newState);
    }
  };
  
  // Mostrar loading si IndexedDB está cargando
  if (isStateLoading) {
    return (
      <div className="app loading-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Inicializando IndexedDB...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>🗂️ Gestor de Estados y Archivos</h1>
        <p className="app-description">
          Gestiona archivos en 4 estados diferentes con persistencia en IndexedDB
        </p>
        <div className="app-stats">
          <span className="stat">
            📁 Total de archivos: <strong>{getTotalFiles()}</strong>
          </span>
          <span className="stat">
            📂 En estado actual ({currentState}): <strong>{getCurrentStateFiles()}</strong>
          </span>
          {storageInfo && (
            <span className="stat">
              💾 IndexedDB: <strong>{formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}</strong> ({storageInfo.percentage}%)
            </span>
          )}
          <span className="stat">
            {s3Connected ? '☁️ S3 Conectado' : '⚠️ S3 Desconectado'}
          </span>
        </div>
      </header>

      <main className="app-main">
        <StateNavigation 
          currentState={currentState} 
          onStateChange={handleStateChange} 
        />
        
        <div className="app-content">
          <FileUpload 
            currentState={currentState}
            onFileUploaded={handleFileUploaded}
            storageInfo={storageInfo}
          />
          

          
          {/* Estado de sincronización automática */}
          <S3UploadStatus 
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isSyncing={isLocalSyncing || isAutoSyncing}
            syncStatus={syncStatus}
            s3Connected={s3Connected}
            lastSyncTime={lastSyncTime}
            autoSync={true}
          />
          
          {isLoadingFiles ? (
            <div className="loading-files">
              <div className="loading-spinner small"></div>
              <p>Cargando archivos...</p>
            </div>
          ) : (
            <FileList 
              files={files}
              currentState={currentState}
              onDeleteFile={handleDeleteFile}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>🛠️ Los datos se guardan automáticamente en IndexedDB</p>
        <p>🔄 El estado se restaura al recargar la página</p>
        <p>📊 Mayor capacidad de almacenamiento que localStorage</p>
        {storageInfo && (
          <p>💾 Espacio disponible: {formatBytes(storageInfo.available)}</p>
        )}
      </footer>
    </div>
  )
}

export default App
