import React from 'react';
import './S3UploadStatus.css';

const S3UploadStatus = ({ 
  isUploading, 
  uploadProgress, 
  isSyncing, 
  syncStatus, 
  s3Connected,
  lastSyncTime,
  autoSync = false
}) => {
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString();
  };

  // Mostrar siempre si hay sincronización automática
  if (!isUploading && !isSyncing && !syncStatus && !autoSync) {
    return null;
  }

  return (
    <div className="s3-upload-status">
      {/* Estado de conexión con S3 */}
      <div className={`s3-connection-status ${s3Connected ? 'connected' : 'disconnected'}`}>
        <span className="status-icon">
          {s3Connected ? '☁️' : '⚠️'}
        </span>
        <span className="status-text">
          {s3Connected ? 'Sincronización Automática Activa' : 'Sin conexión a S3'}
        </span>
        {autoSync && lastSyncTime && (
          <span className="last-sync">
            Última sync: {formatTime(lastSyncTime)}
          </span>
        )}
      </div>

      {/* Upload en progreso */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-header">
            <span className="progress-icon">📤</span>
            <span className="progress-text">Subiendo a S3...</span>
          </div>
          
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="file-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Sincronización */}
      {(isSyncing || syncStatus !== 'idle') && (
        <div className={`sync-status ${syncStatus}`}>
          <div className="sync-header">
            <span className="sync-icon">
              {syncStatus === 'syncing' && '🔄'}
              {syncStatus === 'success' && '✅'}
              {syncStatus === 'error' && '❌'}
            </span>
            <span className="sync-text">
              {syncStatus === 'syncing' && 'Sincronizando con S3...'}
              {syncStatus === 'success' && 'Sincronización completada'}
              {syncStatus === 'error' && 'Error en sincronización'}
            </span>
          </div>
          
          {isSyncing && (
            <div className="sync-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default S3UploadStatus;
