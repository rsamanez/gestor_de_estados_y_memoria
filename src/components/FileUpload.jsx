import React, { useRef, useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ currentState, onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await onFileUploaded(file);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivo(s). Por favor intente nuevamente.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input-hidden"
          accept="*/*"
        />
        
        <div className="file-upload-content">
          {isUploading ? (
            <>
              <div className="upload-spinner"></div>
              <p>Subiendo archivo(s)...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <h3>Subir Archivos al Estado {currentState}</h3>
              <p>Arrastra archivos aquí o haz clic para seleccionar</p>
              <button type="button" className="upload-button">
                Seleccionar Archivos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
