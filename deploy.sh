#!/bin/bash

echo "🚀 Iniciando despliegue de Dividendos App..."
echo "=============================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que Git está configurado
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: No se detectó un repositorio Git. Inicializa Git primero."
    exit 1
fi

# Verificar que hay cambios para commit
if git diff-index --quiet HEAD --; then
    echo "⚠️ No hay cambios para commit. ¿Quieres continuar de todas formas? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Despliegue cancelado."
        exit 1
    fi
fi

# Commit y push de cambios
echo "📝 Haciendo commit de cambios..."
git add .
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo ""
echo "✅ Cambios enviados a GitHub"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. 🚂 Desplegar Backend en Railway:"
echo "   - Ve a https://railway.app"
echo "   - Crea nuevo proyecto"
echo "   - Conecta tu repositorio"
echo "   - Selecciona la carpeta 'backend'"
echo "   - Configura las variables de entorno (ver deploy-railway.md)"
echo ""
echo "2. 🌐 Desplegar Frontend en Vercel:"
echo "   - Ve a https://vercel.com"
echo "   - Crea nuevo proyecto"
echo "   - Conecta tu repositorio"
echo "   - Selecciona la carpeta 'frontend'"
echo "   - Configura REACT_APP_API_URL con la URL de Railway"
echo ""
echo "3. 🔗 Conectar Frontend y Backend:"
echo "   - Copia la URL de Railway"
echo "   - Añádela como variable de entorno en Vercel"
echo "   - Redespliega el frontend"
echo ""
echo "📚 Para más detalles, consulta:"
echo "   - deploy-railway.md"
echo "   - deploy-vercel.md"
echo ""
echo "🎉 ¡Tu aplicación estará disponible en internet!"
