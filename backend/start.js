#!/usr/bin/env node

console.log('🚀 Iniciando servidor de dividendos...');
console.log(`📅 Fecha: ${new Date().toISOString()}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 Puerto: ${process.env.PORT || 3001}`);

// Verificar dependencias críticas
try {
  require('express');
  require('axios');
  require('cheerio');
  console.log('✅ Todas las dependencias están disponibles');
} catch (error) {
  console.error('❌ Error cargando dependencias:', error.message);
  process.exit(1);
}

// Iniciar el servidor
try {
  require('./server.js');
  console.log('✅ Servidor iniciado correctamente');
} catch (error) {
  console.error('❌ Error iniciando servidor:', error);
  process.exit(1);
}
