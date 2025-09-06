const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'dividendos-data.json');

// Función para leer los datos del archivo
function getStoredData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      console.log('📖 Leyendo archivo de datos:', DATA_FILE);
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('📊 Datos leídos del archivo:', {
        lastUpdate: parsedData.lastUpdate,
        confirmados: parsedData.dividendos?.confirmados?.length || 0,
        previstos: parsedData.dividendos?.previstos?.length || 0
      });
      return parsedData;
    } else {
      console.log('📁 Archivo de datos no existe:', DATA_FILE);
    }
  } catch (error) {
    console.error('❌ Error leyendo archivo de datos:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
  
  // Devolver estructura por defecto si no existe el archivo
  console.log('🔄 Devolviendo estructura por defecto');
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
    const timestamp = new Date().toISOString();
    console.log('💾 Guardando datos en archivo...');
    console.log('📅 Timestamp a guardar:', timestamp);
    console.log('📊 Datos a guardar:', {
      confirmados: dividendosData?.confirmados?.length || 0,
      previstos: dividendosData?.previstos?.length || 0
    });
    
    const dataToSave = {
      dividendos: dividendosData,
      lastUpdate: timestamp,
      fromCache: false,
      updating: false
    };
    
    // Asegurar que el directorio existe
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creando directorio de datos:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    console.log('📝 Escribiendo archivo:', DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('✅ Datos guardados en archivo exitosamente');
    
    // Verificar que se guardó correctamente
    const savedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log('🔍 Verificación - lastUpdate guardado:', savedData.lastUpdate);
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando datos:', error.message);
    console.error('❌ Stack trace:', error.stack);
    return false;
  }
}

// Función para verificar si los datos son recientes (válidos indefinidamente)
function isDataRecent() {
  try {
    const data = getStoredData();
    console.log('🔍 Verificando datos almacenados...');
    console.log('📁 Archivo existe:', fs.existsSync(DATA_FILE));
    console.log('📊 Datos encontrados:', data ? 'Sí' : 'No');
    console.log('📅 Última actualización:', data.lastUpdate);
    
    if (!data.lastUpdate) {
      console.log('❌ No hay fecha de última actualización');
      return false;
    }
    
    // Verificar que hay datos válidos
    const hasValidData = data.dividendos && 
                        (data.dividendos.confirmados.length > 0 || data.dividendos.previstos.length > 0);
    
    if (!hasValidData) {
      console.log('❌ No hay datos válidos en el archivo');
      return false;
    }
    
    console.log('✅ Datos válidos encontrados (válidos indefinidamente)');
    return true; // Datos válidos indefinidamente
  } catch (error) {
    console.error('❌ Error verificando fecha de datos:', error.message);
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

// Función para limpiar archivo corrupto
function clearCorruptedData() {
  try {
    console.log('🧹 Limpiando archivo de datos corrupto...');
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
      console.log('🗑️ Archivo corrupto eliminado');
    }
    return true;
  } catch (error) {
    console.error('❌ Error limpiando archivo corrupto:', error.message);
    return false;
  }
}

module.exports = {
  getStoredData,
  saveData,
  isDataRecent,
  setUpdating,
  clearCorruptedData
};
