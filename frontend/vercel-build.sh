#!/bin/bash

echo "🚀 Iniciando build para Vercel..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

echo "✅ Build completado!"
