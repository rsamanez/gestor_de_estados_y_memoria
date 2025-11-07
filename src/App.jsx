import { useState, useEffect } from 'react'
import { useIndexedDBSafe, fileStorageDB } from './hooks/useIndexedDB'
import { useS3Upload, useS3Sync, s3FileAPI } from './hooks/useS3Upload'
import AuthGuard from './components/AuthGuard'
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
  
  // Hooks para S3
  const { uploadToS3, isUploading, uploadProgress } = useS3Upload();
  const { syncToS3, isSyncing, syncStatus } = useS3Sync();
  
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
      // 1. Guardar en IndexedDB primero (almacenamiento inmediato)
      const localFile = await fileStorageDB.saveFile(currentState, file);
      await loadFiles();
      await loadStorageInfo();

      // 2. Subir a S3 en segundo plano si está conectado
      if (s3Connected) {
        try {
          console.log('🚀 Starting background upload to S3...');
          const s3File = await uploadToS3(file, currentState);
          console.log('✅ S3 upload completed:', s3File);
        } catch (s3Error) {
          console.warn('⚠️ S3 upload failed, file saved locally:', s3Error.message);
        }
      } else {
        console.log('📱 S3 not connected, file saved locally only');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await fileStorageDB.deleteFile(fileId);
      await loadFiles();
      await loadStorageInfo();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error al eliminar el archivo. Por favor intente nuevamente.');
    }
  };

  const handleSyncToS3 = async () => {
    if (!s3Connected) {
      alert('No hay conexión con S3. Verifica la configuración del backend.');
      return;
    }

    try {
      const localFiles = files.filter(f => f.stateId === currentState);
      
      if (localFiles.length === 0) {
        alert('No hay archivos en este estado para sincronizar.');
        return;
      }

      console.log(`🚀 Starting sync of ${localFiles.length} files from state ${currentState}...`);
      
      const result = await syncToS3(localFiles, currentState);
      
      if (result.success) {
        alert(`✅ Sincronización completada!\n\n📤 Subidos: ${result.uploaded}\n❌ Fallidos: ${result.failed}\n📁 Total: ${result.total}`);
      } else {
        alert(`⚠️ Sincronización parcial:\n\n📤 Subidos: ${result.uploaded}\n❌ Fallidos: ${result.failed}\n📁 Total: ${result.total}\n\nRevisa la consola para detalles de errores.`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert(`❌ Error durante la sincronización: ${error.message}\n\nRevisa la consola para más detalles.`);
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
    <AuthGuard>
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
          
          {/* Botón de sincronización */}
          {s3Connected && (
            <div className="sync-controls">
              <button 
                className="sync-button"
                onClick={handleSyncToS3}
                disabled={isSyncing}
              >
                {isSyncing ? '🔄 Sincronizando...' : '☁️ Sincronizar con S3'}
              </button>
            </div>
          )}
          
          {/* Estado de upload S3 */}
          <S3UploadStatus 
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isSyncing={isSyncing}
            syncStatus={syncStatus}
            s3Connected={s3Connected}
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
    </AuthGuard>
  )
}

export default App
