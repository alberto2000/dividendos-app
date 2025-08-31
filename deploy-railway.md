# 🚀 Guía de Despliegue en Railway

## Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Crea un nuevo proyecto

## Paso 2: Conectar tu repositorio
1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio de GitHub
4. Selecciona la carpeta `backend` como directorio raíz

## Paso 3: Configurar variables de entorno
En Railway, ve a la pestaña "Variables" y añade:

```
NODE_ENV=production
CORS_ORIGIN=https://tu-app.vercel.app
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Paso 4: Desplegar
1. Railway detectará automáticamente que es un proyecto Node.js
2. El despliegue comenzará automáticamente
3. Una vez completado, obtendrás una URL como: `https://tu-app.railway.app`

## Paso 5: Configurar dominio personalizado (opcional)
1. En Railway, ve a "Settings" > "Domains"
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## Notas importantes:
- Railway proporcionará automáticamente HTTPS
- El servicio se reiniciará automáticamente si falla
- Puedes ver los logs en tiempo real en Railway
