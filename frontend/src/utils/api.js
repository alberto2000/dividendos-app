import axios from 'axios';

// Usar el proxy configurado en package.json
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tu-app.railway.app';

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Aumentar timeout a 60 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Error config:', error.config);
    console.error('Error response:', error.response);
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const message = error.response.data?.error || error.response.data?.message || 'Error del servidor';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Request was made but no response received:', error.request);
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'));
    } else {
      // Algo pasó al configurar la petición
      return Promise.reject(new Error('Error al configurar la petición.'));
    }
  }
);

// Función para obtener dividendos
export const fetchDividendos = async () => {
  try {
    const url = '/api/dividendos';
    console.log('🔍 Solicitando dividendos desde:', url);
    console.log('🔍 API Base URL:', API_BASE_URL);
    console.log('🔍 URL completa:', `${API_BASE_URL}${url}`);

    const response = await fetch(`${API_BASE_URL}${url}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🔍 Respuesta completa de la API:', data);
    console.log('🔍 Tipo de respuesta:', typeof data);
    console.log('🔍 Tiene propiedad dividendos:', 'dividendos' in data);
    console.log('🔍 Tiene propiedad confirmados:', data.dividendos && 'confirmados' in data.dividendos);
    console.log('🔍 Tiene propiedad previstos:', data.dividendos && 'previstos' in data.dividendos);

    // Siempre devolver la estructura completa, no solo el array
    if (data && data.dividendos) {
      if (data.dividendos.confirmados && data.dividendos.previstos) {
        console.log(`✅ Recibidos ${data.dividendos.confirmados.length} confirmados y ${data.dividendos.previstos.length} previstos`);
      } else if (Array.isArray(data.dividendos)) {
        console.log(`✅ Recibidos ${data.dividendos.length} dividendos en formato array`);
      } else {
        console.log(`✅ Recibidos estructura de dividendos:`, data.dividendos);
      }
      return data; // Devolver la estructura completa
    } else {
      console.warn('⚠️ Respuesta inesperada del servidor:', data);
      return { dividendos: { confirmados: [], previstos: [] }, lastUpdate: null, fromCache: false, updating: false };
    }
  } catch (error) {
    console.error('❌ Error al obtener dividendos:', error);
    throw error;
  }
};

// Función para forzar actualización de dividendos
export const updateDividendos = async () => {
  try {
    const url = '/api/dividendos/update';
    console.log('🔄 Solicitando actualización desde:', url);
    console.log('🔍 URL completa:', `${API_BASE_URL}${url}`);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🔄 Respuesta de actualización:', data);
    
    // Siempre devolver la estructura completa
    if (data && data.dividendos) {
      if (data.dividendos.confirmados && data.dividendos.previstos) {
        console.log(`✅ Actualización completada: ${data.dividendos.confirmados.length} confirmados y ${data.dividendos.previstos.length} previstos`);
      } else if (Array.isArray(data.dividendos)) {
        console.log(`✅ Actualización completada: ${data.dividendos.length} dividendos en formato array`);
      }
      return data; // Devolver la estructura completa
    } else {
      console.warn('⚠️ Respuesta de actualización inesperada:', data);
      return { dividendos: { confirmados: [], previstos: [] }, lastUpdate: null, fromCache: false, updating: false };
    }
  } catch (error) {
    console.error('❌ Error al actualizar dividendos:', error);
    throw error;
  }
};

// Función para verificar el estado del servidor
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error('Servidor no disponible');
  }
};

// Función de prueba para verificar conectividad básica
export const testBasicConnection = async () => {
  try {
    console.log('🧪 Probando conexión básica con el backend...');
    console.log('🔍 URL de prueba:', `${API_BASE_URL}/api/health`);
    
    const response = await fetch(`${API_BASE_URL}/api/health`);
    console.log('✅ Respuesta del fetch:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      return data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error de conexión básica:', error);
    throw error;
  }
};

// Función para obtener información de una empresa específica
export const fetchEmpresaInfo = async (empresa) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/empresa/${encodeURIComponent(empresa)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export default api;
