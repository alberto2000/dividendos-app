console.log('🚀 Iniciando servidor con debugging...');

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

try {
  console.log('📦 Probando cheerio...');
  const cheerio = require('cheerio');
  console.log('✅ Cheerio cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando cheerio:', error);
  process.exit(1);
}

try {
  console.log('📦 Probando scraper-axios...');
  const { scrapeDividendosAxios } = require('./scraper-axios');
  console.log('✅ Scraper cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando scraper:', error);
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

console.log('✅ Rutas configuradas');

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
