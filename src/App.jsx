import { useState, useEffect } from 'react'
import { useIndexedDB, fileStorageDB } from './hooks/useIndexedDB'
import StateNavigation from './components/StateNavigation'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import './App.css'

function App() {
  // Estado actual (persistido en IndexedDB)
  const [currentState, setCurrentState, isStateLoading] = useIndexedDB('currentAppState', 1);
  
  // Lista de archivos (se actualiza cuando cambia el estado o se suben/eliminan archivos)
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [storageInfo, setStorageInfo] = useState(null);

  // Cargar archivos al montar el componente o cambiar de estado
  useEffect(() => {
    if (!isStateLoading) {
      loadFiles();
      loadStorageInfo();
    }
  }, [currentState, isStateLoading]);

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

  const handleStateChange = (newState) => {
    setCurrentState(newState);
  };

  const handleFileUploaded = async (file) => {
    try {
      await fileStorageDB.saveFile(currentState, file);
      await loadFiles(); // Recargar archivos después de subir
      await loadStorageInfo(); // Actualizar info de almacenamiento
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await fileStorageDB.deleteFile(fileId);
      await loadFiles(); // Recargar archivos después de eliminar
      await loadStorageInfo(); // Actualizar info de almacenamiento
    } catch (error) {
      console.error('Error deleting file:', error);
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

  // Mostrar loading mientras se cargan los datos iniciales
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
            📂 En estado actual: <strong>{getCurrentStateFiles()}</strong>
          </span>
          {storageInfo && (
            <span className="stat">
              💾 Almacenamiento: <strong>{formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}</strong> ({storageInfo.percentage}%)
            </span>
          )}
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
        <p>�️ Los datos se guardan automáticamente en IndexedDB</p>
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
