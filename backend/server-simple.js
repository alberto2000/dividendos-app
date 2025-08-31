const express = require('express');
const cors = require('cors');
const { scrapeDividendosAxios } = require('./scraper-axios');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor completo...');
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

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API de Dividendos del Mercado Continuo Español' });
});

// Endpoint para obtener dividendos
app.get('/api/dividendos', async (req, res) => {
  console.log('📡 Petición recibida en /api/dividendos');
  
  try {
    console.log('🔄 Obteniendo datos de dividendos...');
    const result = await scrapeDividendosAxios();
    
    res.json({
      dividendos: result,
      lastUpdate: new Date().toISOString(),
      fromCache: false,
      updating: false
    });
  } catch (error) {
    console.error('❌ Error al obtener dividendos:', error);
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
  console.log('🔄 Petición de actualización recibida');
  
  try {
    const result = await scrapeDividendosAxios();
    
    res.json({
      dividendos: result,
      lastUpdate: new Date().toISOString(),
      fromCache: false,
      updating: false
    });
  } catch (error) {
    console.error('❌ Error en actualización:', error);
    res.status(500).json({
      error: 'Error al actualizar los datos',
      dividendos: { confirmados: [], previstos: [] },
      lastUpdate: null,
      fromCache: false,
      updating: false
    });
  }
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

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  console.log(`🌐 Disponible en: http://0.0.0.0:${PORT}`);
  console.log(`🔍 Healthcheck: http://0.0.0.0:${PORT}/api/health`);
});

// Manejar errores
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
