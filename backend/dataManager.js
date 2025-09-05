const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'dividendos-data.json');

// Función para leer los datos del archivo
function getStoredData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error leyendo archivo de datos:', error.message);
  }
  
  // Devolver estructura por defecto si no existe el archivo
  return {
    dividendos: {
      confirmados: [],
      previstos: []
    },
    lastUpdate: null,
    fromCache: false,
    updating: false
  };
}

// Función para guardar los datos en el archivo
function saveData(dividendosData) {
  try {
    const dataToSave = {
      dividendos: dividendosData,
      lastUpdate: new Date().toISOString(),
      fromCache: false,
      updating: false
    };
    
    // Asegurar que el directorio existe
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('✅ Datos guardados en archivo');
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error.message);
    return false;
  }
}

// Función para verificar si los datos son recientes (menos de 1 hora)
function isDataRecent() {
  try {
    const data = getStoredData();
    if (!data.lastUpdate) return false;
    
    const lastUpdate = new Date(data.lastUpdate);
    const now = new Date();
    const diffHours = (now - lastUpdate) / (1000 * 60 * 60);
    
    return diffHours < 1; // Datos válidos por 1 hora
  } catch (error) {
    console.error('Error verificando fecha de datos:', error.message);
    return false;
  }
}

// Función para marcar que se está actualizando
function setUpdating(updating) {
  try {
    const data = getStoredData();
    data.updating = updating;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error actualizando estado:', error.message);
  }
}

module.exports = {
  getStoredData,
  saveData,
  isDataRecent,
  setUpdating
};
