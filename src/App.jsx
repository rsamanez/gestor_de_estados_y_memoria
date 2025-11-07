import { useState, useEffect } from 'react'
import { useLocalStorage, fileStorage } from './hooks/useLocalStorage'
import StateNavigation from './components/StateNavigation'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import './App.css'

function App() {
  // Estado actual (persistido en localStorage)
  const [currentState, setCurrentState] = useLocalStorage('currentAppState', 1);
  
  // Lista de archivos (se actualiza cuando cambia el estado o se suben/eliminan archivos)
  const [files, setFiles] = useState([]);

  // Cargar archivos al montar el componente o cambiar de estado
  useEffect(() => {
    loadFiles();
  }, [currentState]);

  const loadFiles = () => {
    const allFiles = fileStorage.getAllFiles();
    setFiles(allFiles);
  };

  const handleStateChange = (newState) => {
    setCurrentState(newState);
  };

  const handleFileUploaded = async (file) => {
    try {
      await fileStorage.saveFile(currentState, file);
      loadFiles(); // Recargar archivos después de subir
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDeleteFile = (fileId) => {
    try {
      fileStorage.deleteFile(currentState, fileId);
      loadFiles(); // Recargar archivos después de eliminar
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗂️ Gestor de Estados y Archivos</h1>
        <p className="app-description">
          Gestiona archivos en 4 estados diferentes con persistencia en localStorage
        </p>
        <div className="app-stats">
          <span className="stat">
            📁 Total de archivos: <strong>{getTotalFiles()}</strong>
          </span>
          <span className="stat">
            📂 En estado actual: <strong>{getCurrentStateFiles()}</strong>
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
          />
          
          <FileList 
            files={files}
            currentState={currentState}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>💾 Los datos se guardan automáticamente en localStorage</p>
        <p>🔄 El estado se restaura al recargar la página</p>
      </footer>
    </div>
  )
}

export default App
