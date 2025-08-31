const express = require('express');
const cors = require('cors');
const { scrapeDividendosAxios } = require('./scraper-axios');
const CacheManager = require('./cacheManager');

const app = express();
const PORT = process.env.PORT || 3001;

// Sistema de caché físico
const cacheManager = new CacheManager();
let isUpdating = false;

// Configuración mejorada de CORS
const corsOptions = {
  origin: true, // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Middleware para manejar peticiones OPTIONS
app.options('*', cors(corsOptions));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log(`🔍 Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`🔍 User-Agent: ${req.headers['user-agent'] || 'No user-agent'}`);
  next();
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API de Dividendos del Mercado Continuo Español' });
});

// Endpoint para obtener dividendos (solo desde caché, sin scraping automático)
app.get('/api/dividendos', async (req, res) => {
  console.log('📡 Petición recibida en /api/dividendos');
  
  try {
    // Solo cargar desde archivo, NO hacer scraping automático
    console.log('📂 Cargando datos desde archivo...');
    const cacheManager = new CacheManager();
    const cachedData = await cacheManager.loadCache();
    
    console.log('🔍 Datos cargados del archivo:', JSON.stringify(cachedData, null, 2));
    
    if (cachedData && cachedData.dividendos) {
      console.log('✅ Datos cargados desde archivo');
      console.log(`📊 Confirmados: ${cachedData.dividendos.confirmados?.length || 0}`);
      console.log(`📊 Previstos: ${cachedData.dividendos.previstos?.length || 0}`);
      
      res.json({
        dividendos: cachedData.dividendos,
        lastUpdate: cachedData.lastUpdate,
        fromCache: true,
        updating: false
      });
    } else {
      console.log('⚠️ No hay datos en archivo, devolviendo estructura vacía');
      res.json({
        dividendos: { confirmados: [], previstos: [] },
        lastUpdate: null,
        fromCache: true,
        updating: false
      });
    }
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    res.status(500).json({
      error: 'Error al cargar los datos',
      dividendos: { confirmados: [], previstos: [] },
      lastUpdate: null,
      fromCache: false,
      updating: false
    });
  }
});

// Ruta para forzar actualización de datos
app.post('/api/dividendos/update', async (req, res) => {
  try {
    console.log('🔄 Petición de actualización forzada recibida');
    
    const result = await updateDividendosData();
    
    res.json({
      dividendos: result.data,
      lastUpdate: result.lastUpdate,
      fromCache: result.fromCache,
      updating: result.updating
    });
  } catch (error) {
    console.error('❌ Error en actualización forzada:', error);
    res.status(500).json({ 
      error: 'Error al actualizar datos de dividendos',
      details: error.message 
    });
  }
});

// Ruta para obtener información del caché
app.get('/api/cache/info', async (req, res) => {
  try {
    const cacheInfo = await cacheManager.getCacheInfo();
    res.json(cacheInfo);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener información del caché',
      details: error.message 
    });
  }
});

// Ruta para limpiar el caché
app.delete('/api/cache/clear', async (req, res) => {
  try {
    const success = await cacheManager.clearCache();
    if (success) {
      res.json({ message: 'Caché limpiado correctamente' });
    } else {
      res.status(500).json({ error: 'No se pudo limpiar el caché' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al limpiar el caché',
      details: error.message 
    });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Función para obtener datos (caché o scraping)
async function getDividendosData() {
  try {
    // Intentar cargar datos del caché
    const cachedData = await cacheManager.loadCache();
    
    if (cachedData.dividendos && cachedData.dividendos.confirmados && cachedData.dividendos.previstos && cachedData.lastUpdate) {
      console.log('📋 Devolviendo datos del caché físico');
      return {
        data: cachedData.dividendos,
        lastUpdate: cachedData.lastUpdate,
        fromCache: true
      };
    }
    
    // Si no hay caché válido, hacer scraping
    console.log('🔄 No hay caché válido, iniciando scraping...');
    return await updateDividendosData();
  } catch (error) {
    console.error('❌ Error cargando caché:', error);
    return await updateDividendosData();
  }
}

// Función para actualizar datos (hacer scraping)
async function updateDividendosData() {
  if (isUpdating) {
    console.log('⏳ Ya hay una actualización en curso...');
    try {
      const cachedData = await cacheManager.loadCache();
      return {
        data: cachedData.dividendos || { confirmados: [], previstos: [] },
        lastUpdate: cachedData.lastUpdate,
        fromCache: true,
        updating: true
      };
    } catch (error) {
      return {
        data: { confirmados: [], previstos: [] },
        lastUpdate: null,
        fromCache: false,
        updating: true
      };
    }
  }
  
  isUpdating = true;
  
  try {
    console.log('🚀 Iniciando actualización de datos...');
    
    // Usar scraper axios (más confiable en servidores)
    console.log('🏭 Usando scraper axios...');
    result = await scrapeDividendosAxios();
    
    // Guardar en caché físico
    const lastUpdate = new Date().toISOString();
    await cacheManager.saveCache(result, lastUpdate);
    
    console.log(`✅ Datos actualizados y guardados en caché físico.`);
    console.log(`   - Confirmados: ${result.confirmados.length} dividendos`);
    console.log(`   - Previstos: ${result.previstos.length} dividendos`);
    
    return {
      data: result,
      lastUpdate: lastUpdate,
      fromCache: false,
      updating: false
    };
  } catch (error) {
    console.error('❌ Error actualizando datos:', error);
    isUpdating = false;
    throw error;
  } finally {
    isUpdating = false;
  }
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}`);
});
