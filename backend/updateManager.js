const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, 'data', 'updating-status.json');

// Función para leer el estado de actualización
function getUpdateStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error leyendo estado de actualización:', error.message);
  }
  
  // Devolver estado por defecto
  return {
    updating: false,
    startedAt: null,
    completedAt: null,
    totalCompanies: 0,
    processedCompanies: 0,
    currentCompany: "",
    error: null,
    progress: 0
  };
}

// Función para actualizar el estado
function updateStatus(statusUpdate) {
  try {
    const currentStatus = getUpdateStatus();
    const newStatus = { ...currentStatus, ...statusUpdate };
    
    // Asegurar que el directorio existe
    const dataDir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(STATUS_FILE, JSON.stringify(newStatus, null, 2));
    return true;
  } catch (error) {
    console.error('Error actualizando estado:', error.message);
    return false;
  }
}

// Función para iniciar actualización
function startUpdate(totalCompanies) {
  return updateStatus({
    updating: true,
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalCompanies: totalCompanies,
    processedCompanies: 0,
    currentCompany: "",
    error: null,
    progress: 0
  });
}

// Función para actualizar progreso
function updateProgress(processedCompanies, currentCompany) {
  const status = getUpdateStatus();
  const progress = status.totalCompanies > 0 ? Math.round((processedCompanies / status.totalCompanies) * 100) : 0;
  
  return updateStatus({
    processedCompanies: processedCompanies,
    currentCompany: currentCompany,
    progress: progress
  });
}

// Función para completar actualización
function completeUpdate() {
  return updateStatus({
    updating: false,
    completedAt: new Date().toISOString()
  });
}

// Función para marcar error
function setError(errorMessage) {
  return updateStatus({
    updating: false,
    error: errorMessage,
    completedAt: new Date().toISOString()
  });
}

// Función para limpiar estado (opcional)
function clearStatus() {
  return updateStatus({
    updating: false,
    startedAt: null,
    completedAt: null,
    totalCompanies: 0,
    processedCompanies: 0,
    currentCompany: "",
    error: null,
    progress: 0
  });
}

module.exports = {
  getUpdateStatus,
  updateStatus,
  startUpdate,
  updateProgress,
  completeUpdate,
  setError,
  clearStatus
};
