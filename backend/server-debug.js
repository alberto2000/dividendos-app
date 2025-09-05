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
  console.log('📦 Probando scraper-simple-axios...');
  const { scrapeDividendosSimpleAxios } = require('./scraper-simple-axios');
  console.log('✅ Scraper simple cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando scraper simple:', error);
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
