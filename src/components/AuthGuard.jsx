import React from 'react';
import { useJWTAuth } from '../hooks/useJWTAuth';
import './AuthGuard.css';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading, authError, user, tokenInfo, clearAuth } = useJWTAuth();

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="auth-guard loading">
        <div className="auth-container">
          <div className="loading-spinner large"></div>
          <h2>🔐 Verificando autenticación...</h2>
          <p>Validando token JWT...</p>
        </div>
      </div>
    );
  }

  // Error de autenticación
  if (!isAuthenticated) {
    return (
      <div className="auth-guard error">
        <div className="auth-container">
          <div className="auth-error">
            <h1>🚫 Acceso Denegado</h1>
            <div className="error-message">
              <h3>Error de Autenticación:</h3>
              <p>{authError || 'Token JWT requerido'}</p>
            </div>
            
            <div className="auth-instructions">
              <h3>Para acceder a esta aplicación:</h3>
              <ol>
                <li>
                  <strong>Genera un token JWT:</strong>
                  <code>node generate-jwt.js</code>
                </li>
                <li>
                  <strong>Usa la URL generada o añade el token como parámetro:</strong>
                  <code>?token=tu_token_jwt_aqui</code>
                </li>
                <li>
                  <strong>Ejemplo:</strong>
                  <code>http://localhost:5173?token=eyJ0eXAiOiJKV1Q...</code>
                </li>
              </ol>
            </div>

            <div className="auth-help">
              <h4>Comandos útiles:</h4>
              <div className="command-examples">
                <div className="command">
                  <code>node generate-jwt.js --help</code>
                  <span>Ver todas las opciones</span>
                </div>
                <div className="command">
                  <code>node generate-jwt.js -e 1h</code>
                  <span>Token válido por 1 hora</span>
                </div>
                <div className="command">
                  <code>node generate-jwt.js -e 30m -u admin</code>
                  <span>Token para usuario 'admin' por 30 minutos</span>
                </div>
              </div>
            </div>

            <div className="auth-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="retry-button"
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado - mostrar información y la aplicación
  return (
    <div className="auth-guard authenticated">
      {/* Barra de información de usuario */}
      <div className="auth-status-bar">
        <div className="user-info">
          <span className="user-badge">
            👤 {user}
          </span>
          <span className="auth-indicator">
            🔐 Autenticado
          </span>
        </div>
        
        <div className="token-info">
          {tokenInfo && (
            <>
              <span className="expiration-info" title={`Expira: ${tokenInfo.expiresAt.toLocaleString()}`}>
                ⏰ Expira: {tokenInfo.expiresAt.toLocaleTimeString()}
              </span>
              <button 
                onClick={clearAuth}
                className="logout-button"
                title="Cerrar sesión"
              >
                🚪 Salir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Aplicación protegida */}
      <div className="protected-content">
        {children}
      </div>
    </div>
  );
};

export default AuthGuard;
