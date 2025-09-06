console.log('🚀 Iniciando servidor con debugging...');
console.log(`📅 Fecha: ${new Date().toISOString()}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 Puerto: ${process.env.PORT || 3001}`);

// Probar cada dependencia individualmente
try {
  console.log('📦 Probando express...');
  const express = require('express');
  console.log('✅ Express cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando express:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando cors...');
  const cors = require('cors');
  console.log('✅ CORS cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando cors:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando axios...');
  const axios = require('axios');
  console.log('✅ Axios cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando axios:', error);
  process.exit(1);
}

// Cheerio comentado temporalmente por problemas de compatibilidad
// try {
//   console.log('📦 Probando cheerio...');
//   const cheerio = require('cheerio');
//   console.log('✅ Cheerio cargado correctamente');
// } catch (error) {
//   console.error('❌ Error cargando cheerio:', error);
//   process.exit(1);
// }

try {
  console.log('📦 Probando scraper-full-regex...');
  const { scrapeDividendosFullRegex } = require('./scraper-full-regex');
  console.log('✅ Scraper completo cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando scraper completo:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando dataManager...');
  const { getStoredData, saveData, isDataRecent, setUpdating } = require('./dataManager');
  console.log('✅ Data manager cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando data manager:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando updateManager...');
  const { getUpdateStatus, startUpdate, updateProgress, completeUpdate, setError } = require('./updateManager');
  console.log('✅ Update manager cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando update manager:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando scraper-async...');
  const { scrapeDividendosAsync } = require('./scraper-async');
  console.log('✅ Scraper asíncrono cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando scraper asíncrono:', error);
  process.exit(1);
}

// Si llegamos aquí, todas las dependencias están bien
console.log('🎉 Todas las dependencias cargadas correctamente');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`📡 Puerto: ${PORT}`);

// Configuración de CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

console.log('✅ Middleware configurado');

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API de Dividendos del Mercado Continuo Español' });
});

// Healthcheck simple
app.get('/api/health', (req, res) => {
  console.log('🔍 Healthcheck solicitado');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Healthcheck alternativo
app.get('/health', (req, res) => {
  console.log('🔍 Healthcheck alternativo solicitado');
  res.status(200).send('OK');
});

// Endpoint para obtener dividendos
app.get('/api/dividendos', async (req, res) => {
  console.log('📡 Petición recibida en /api/dividendos');
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    const { getStoredData, isDataRecent } = require('./dataManager');
    const { getUpdateStatus } = require('./updateManager');
    
    // Obtener estado de actualización
    const updateStatus = getUpdateStatus();
    console.log('🔄 Estado de actualización:', updateStatus);
    
    // Verificar si hay datos recientes en el archivo
    console.log('🔍 Verificando si hay datos recientes...');
    
    // Primero verificar si el archivo existe pero está corrupto
    const storedData = getStoredData();
    if (storedData.lastUpdate === null && (storedData.dividendos.confirmados.length === 0 && storedData.dividendos.previstos.length === 0)) {
      console.log('⚠️ Archivo de datos corrupto detectado, limpiando...');
      const { clearCorruptedData } = require('./dataManager');
      clearCorruptedData();
    }
    
    const hasRecentData = isDataRecent();
    
    if (hasRecentData) {
      console.log('✅ Usando datos del archivo (recientes)');
      const storedData = getStoredData();
      console.log('📊 Datos del archivo:', {
        confirmados: storedData.dividendos?.confirmados?.length || 0,
        previstos: storedData.dividendos?.previstos?.length || 0,
        lastUpdate: storedData.lastUpdate
      });
      
      // Agregar información de actualización si está en curso
      if (updateStatus.updating) {
        storedData.updating = true;
        storedData.updateProgress = updateStatus.progress;
        storedData.currentCompany = updateStatus.currentCompany;
        console.log('🔄 Agregando estado de actualización en curso');
      }
      
      return res.json(storedData);
    }
    
    console.log('🔄 Datos no recientes o no existen, obteniendo datos frescos...');
    const { scrapeDividendosFullRegex } = require('./scraper-full-regex');
    const { saveData } = require('./dataManager');
    
    const result = await scrapeDividendosFullRegex();
    
    // Guardar en archivo
    saveData(result);
    
    res.json({
      dividendos: result,
      lastUpdate: new Date().toISOString(),
      fromCache: false,
      updating: false
    });
  } catch (error) {
    console.error('❌ Error al obtener dividendos:', error);
    
    // Intentar devolver datos del archivo como fallback
    try {
      const { getStoredData } = require('./dataManager');
      const storedData = getStoredData();
      if (storedData.dividendos.confirmados.length > 0 || storedData.dividendos.previstos.length > 0) {
        console.log('📦 Devolviendo datos del archivo como fallback');
        return res.json(storedData);
      }
    } catch (fallbackError) {
      console.error('❌ Error accediendo al archivo:', fallbackError.message);
    }
    
    res.status(500).json({
      error: 'Error al obtener los datos',
      dividendos: { confirmados: [], previstos: [] },
      lastUpdate: null,
      fromCache: false,
      updating: false
    });
  }
});

// Ruta para forzar actualización de datos (ASÍNCRONA)
app.post('/api/dividendos/update', async (req, res) => {
  console.log('🔄 Petición de actualización forzada recibida');
  
  try {
    const { getUpdateStatus } = require('./updateManager');
    
    // Verificar si ya hay una actualización en curso
    const currentStatus = getUpdateStatus();
    if (currentStatus.updating) {
      console.log('⚠️ Ya hay una actualización en curso');
      return res.json({
        success: false,
        message: 'Ya hay una actualización en curso',
        updating: true,
        progress: currentStatus.progress,
        currentCompany: currentStatus.currentCompany
      });
    }
    
    // Iniciar scraping asíncrono en background
    console.log('🚀 Iniciando scraping asíncrono en background...');
    const { scrapeDividendosAsync } = require('./scraper-async');
    
    // Ejecutar en background (no esperar)
    scrapeDividendosAsync().catch(error => {
      console.error('❌ Error en scraping asíncrono:', error);
    });
    
    // Responder inmediatamente
    res.json({
      success: true,
      message: 'Actualización iniciada en background',
      updating: true,
      progress: 0,
      currentCompany: 'Iniciando...'
    });
    
  } catch (error) {
    console.error('❌ Error iniciando actualización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar la actualización',
      error: error.message
    });
  }
});

// Endpoint para consultar el estado de actualización
app.get('/api/dividendos/status', (req, res) => {
  console.log('📊 Consulta de estado de actualización');
  
  try {
    const { getUpdateStatus } = require('./updateManager');
    const status = getUpdateStatus();
    
    res.json({
      updating: status.updating,
      progress: status.progress,
      totalCompanies: status.totalCompanies,
      processedCompanies: status.processedCompanies,
      currentCompany: status.currentCompany,
      startedAt: status.startedAt,
      completedAt: status.completedAt,
      error: status.error
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      error: 'Error al obtener el estado de actualización'
    });
  }
});

// Endpoint de debug para ver archivos de datos (TEMPORAL)
app.get('/api/debug/files', (req, res) => {
  console.log('🔍 Consulta de archivos de debug');
  
  try {
    const { getStoredData } = require('./dataManager');
    const { getUpdateStatus } = require('./updateManager');
    
    const dividendosData = getStoredData();
    const updateStatus = getUpdateStatus();
    
    res.json({
      dividendosData: {
        lastUpdate: dividendosData.lastUpdate,
        confirmadosCount: dividendosData.dividendos?.confirmados?.length || 0,
        previstosCount: dividendosData.dividendos?.previstos?.length || 0,
        sampleConfirmados: dividendosData.dividendos?.confirmados?.slice(0, 2) || [],
        samplePrevistos: dividendosData.dividendos?.previstos?.slice(0, 2) || []
      },
      updateStatus: updateStatus,
      files: {
        dividendosDataExists: true,
        updateStatusExists: true
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo archivos de debug:', error);
    res.status(500).json({
      error: 'Error al obtener archivos de debug'
    });
  }
});

// Endpoint para verificar el estado del sistema de datos
app.get('/api/debug/data-status', (req, res) => {
  try {
    const { getStoredData, isDataRecent } = require('./dataManager');
    const { getUpdateStatus } = require('./updateManager');
    
    const storedData = getStoredData();
    const hasRecentData = isDataRecent();
    const updateStatus = getUpdateStatus();
    
    res.json({
      hasRecentData,
      storedData: {
        lastUpdate: storedData.lastUpdate,
        confirmados: storedData.dividendos?.confirmados?.length || 0,
        previstos: storedData.dividendos?.previstos?.length || 0,
        fromCache: storedData.fromCache,
        updating: storedData.updating
      },
      updateStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para limpiar archivo corrupto manualmente
app.post('/api/debug/clear-corrupted-data', (req, res) => {
  try {
    const { clearCorruptedData } = require('./dataManager');
    const success = clearCorruptedData();
    
    res.json({
      success,
      message: success ? 'Archivo corrupto eliminado' : 'Error eliminando archivo corrupto',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para descargar el archivo de datos completo
app.get('/api/debug/download-data', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const dataFile = path.join(__dirname, 'data', 'dividendos-data.json');
    
    if (!fs.existsSync(dataFile)) {
      return res.status(404).json({ error: 'Archivo de datos no encontrado' });
    }
    
    const data = fs.readFileSync(dataFile, 'utf8');
    const parsedData = JSON.parse(data);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="dividendos-data.json"');
    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log('✅ Rutas configuradas');

// Iniciar servidor
console.log('🚀 Iniciando servidor...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  console.log(`🌐 Disponible en: http://0.0.0.0:${PORT}`);
  console.log(`🔍 Healthcheck: http://0.0.0.0:${PORT}/api/health`);
  console.log('🎉 Servidor funcionando correctamente');
});

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
  process.exit(1);
});

// Manejar errores
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

// Mantener el proceso vivo
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

console.log('🔄 Servidor configurado, esperando conexiones...');
