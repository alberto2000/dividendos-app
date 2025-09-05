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
  
  try {
    const { getStoredData, isDataRecent } = require('./dataManager');
    
    // Verificar si hay datos recientes en el archivo
    if (isDataRecent()) {
      console.log('📦 Usando datos del archivo (recientes)');
      const storedData = getStoredData();
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

// Ruta para forzar actualización de datos
app.post('/api/dividendos/update', async (req, res) => {
  console.log('🔄 Petición de actualización forzada recibida');
  
  try {
    const { scrapeDividendosFullRegex } = require('./scraper-full-regex');
    const { saveData, setUpdating } = require('./dataManager');
    
    // Marcar que se está actualizando
    setUpdating(true);
    
    console.log('🔄 Forzando actualización de datos...');
    const result = await scrapeDividendosFullRegex();
    
    // Guardar en archivo
    saveData(result);
    
    // Marcar que ya no se está actualizando
    setUpdating(false);
    
    res.json({
      dividendos: result,
      lastUpdate: new Date().toISOString(),
      fromCache: false,
      updating: false
    });
  } catch (error) {
    console.error('❌ Error en actualización:', error);
    
    // Marcar que ya no se está actualizando
    const { setUpdating } = require('./dataManager');
    setUpdating(false);
    
    res.status(500).json({
      error: 'Error al actualizar los datos',
      dividendos: { confirmados: [], previstos: [] },
      lastUpdate: null,
      fromCache: false,
      updating: false
    });
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
