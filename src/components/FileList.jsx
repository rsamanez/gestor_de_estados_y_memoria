import React from 'react';
import './FileList.css';

const FileList = ({ files, currentState, onDeleteFile }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStateFiles = files.filter(file => file.stateId === currentState);

  if (currentStateFiles.length === 0) {
    return (
      <div className="file-list-container">
        <h3>Archivos en Estado {currentState}</h3>
        <div className="no-files">
          <div className="no-files-icon">📂</div>
          <p>No hay archivos en este estado</p>
          <p className="no-files-subtitle">Sube algunos archivos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <h3>Archivos en Estado {currentState} ({currentStateFiles.length})</h3>
      <div className="file-list">
        {currentStateFiles.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <div className="file-icon">
                {getFileIcon(file.type)}
              </div>
              <div className="file-details">
                <div className="file-name" title={file.name}>
                  {file.name}
                </div>
                <div className="file-meta">
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <span className="file-date">{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
            <div className="file-actions">
              <button 
                className="action-button download-button"
                onClick={() => handleDownload(file)}
                title="Descargar archivo"
              >
                ⬇️
              </button>
              <button 
                className="action-button delete-button"
                onClick={() => onDeleteFile(file.id)}
                title="Eliminar archivo"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
