import { useState, useEffect } from 'react';

// Clave secreta (en producción debería venir del backend)
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Hook para manejar autenticación JWT
 */
export const useJWTAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  /**
   * Decodifica Base64URL
   */
  const base64UrlDecode = (str) => {
    // Añadir padding si es necesario
    const padding = str.length % 4;
    if (padding) {
      str += '='.repeat(4 - padding);
    }
    
    // Convertir de Base64URL a Base64
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      return JSON.parse(atob(base64));
    } catch (error) {
      throw new Error('Token malformado');
    }
  };

  /**
   * Valida la firma del JWT
   */
  const validateSignature = async (header, payload, signature, secret) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const key = encoder.encode(secret);
    
    try {
      // Importar clave para HMAC
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      // Crear firma
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      return computedSignature === signature;
    } catch (error) {
      console.error('Error validating signature:', error);
      return false;
    }
  };

  /**
   * Valida un token JWT completo
   */
  const validateJWT = async (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT debe tener 3 partes');
      }

      const [headerEncoded, payloadEncoded, signature] = parts;
      
      // Decodificar header y payload
      const header = base64UrlDecode(headerEncoded);
      const payload = base64UrlDecode(payloadEncoded);
      
      // Verificar header
      if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        throw new Error('Algoritmo o tipo de token no soportado');
      }
      
      // Verificar expiración
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        const expiredDate = new Date(payload.exp * 1000);
        throw new Error(`Token expirado el ${expiredDate.toLocaleString()}`);
      }
      
      // Verificar que es para esta aplicación
      if (payload.app !== 'file-manager') {
        throw new Error('Token no válido para esta aplicación');
      }
      
      // Validar firma
      const isSignatureValid = await validateSignature(
        headerEncoded, 
        payloadEncoded, 
        signature, 
        JWT_SECRET
      );
      
      if (!isSignatureValid) {
        throw new Error('Firma del token inválida');
      }
      
      return {
        valid: true,
        payload,
        header,
        expiresAt: new Date(payload.exp * 1000),
        issuedAt: new Date(payload.iat * 1000)
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  };

  /**
   * Obtiene el token de la URL
   */
  const getTokenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };

  /**
   * Limpia el token de la URL sin recargar la página
   */
  const cleanTokenFromURL = () => {
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());
  };

  /**
   * Guarda el token en sessionStorage
   */
  const saveToken = (token, tokenData) => {
    sessionStorage.setItem('jwt_token', token);
    sessionStorage.setItem('jwt_data', JSON.stringify(tokenData));
  };

  /**
   * Obtiene el token guardado
   */
  const getSavedToken = () => {
    const token = sessionStorage.getItem('jwt_token');
    const data = sessionStorage.getItem('jwt_data');
    return {
      token,
      data: data ? JSON.parse(data) : null
    };
  };

  /**
   * Limpia la autenticación
   */
  const clearAuth = () => {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_data');
    setIsAuthenticated(false);
    setUser(null);
    setTokenInfo(null);
    setAuthError(null);
  };

  /**
   * Inicializar autenticación
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // 1. Buscar token en URL
        let token = getTokenFromURL();
        let fromURL = false;
        
        if (token) {
          fromURL = true;
          console.log('🎫 Token encontrado en URL');
        } else {
          // 2. Buscar token guardado
          const saved = getSavedToken();
          token = saved.token;
          if (token) {
            console.log('🎫 Token encontrado en sessionStorage');
          }
        }
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }
        
        // 3. Validar token
        console.log('🔍 Validando token JWT...');
        const validation = await validateJWT(token);
        
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        // 4. Token válido
        console.log('✅ Token JWT válido');
        console.log('👤 Usuario:', validation.payload.user);
        console.log('⏰ Expira:', validation.expiresAt.toLocaleString());
        
        // 5. Guardar datos de autenticación
        setIsAuthenticated(true);
        setUser(validation.payload.user);
        setTokenInfo({
          expiresAt: validation.expiresAt,
          issuedAt: validation.issuedAt,
          permissions: validation.payload.permissions || []
        });
        
        // 6. Guardar token si viene de URL
        if (fromURL) {
          saveToken(token, validation);
          cleanTokenFromURL();
        }
        
      } catch (error) {
        console.error('❌ Error de autenticación:', error.message);
        setAuthError(error.message);
        setIsAuthenticated(false);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Verificar expiración periódicamente
   */
  useEffect(() => {
    if (!isAuthenticated || !tokenInfo) return;

    const checkExpiration = () => {
      if (tokenInfo.expiresAt && new Date() >= tokenInfo.expiresAt) {
        console.warn('⚠️ Token expirado, cerrando sesión');
        setAuthError('Token expirado');
        clearAuth();
      }
    };

    // Verificar cada minuto
    const interval = setInterval(checkExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, tokenInfo]);

  return {
    isAuthenticated,
    isLoading,
    authError,
    user,
    tokenInfo,
    clearAuth
  };
};
