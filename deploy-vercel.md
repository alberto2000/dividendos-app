# 🌐 Guía de Despliegue en Vercel

## Paso 1: Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub
3. Crea un nuevo proyecto

## Paso 2: Conectar tu repositorio
1. En Vercel, haz clic en "New Project"
2. Importa tu repositorio de GitHub
3. Selecciona la carpeta `frontend` como directorio raíz
4. Vercel detectará automáticamente que es un proyecto React

## Paso 3: Configurar variables de entorno
En Vercel, ve a "Settings" > "Environment Variables" y añade:

```
REACT_APP_API_URL=https://tu-backend.railway.app
```

**Importante:** Reemplaza `tu-backend.railway.app` con la URL real de tu backend en Railway.

## Paso 4: Configurar build settings
En Vercel, configura:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

## Paso 5: Desplegar
1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Obtendrás una URL como: `https://tu-app.vercel.app`

## Paso 6: Configurar dominio personalizado (opcional)
1. En Vercel, ve a "Settings" > "Domains"
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## Notas importantes:
- Vercel proporcionará automáticamente HTTPS
- Cada push a la rama principal desplegará automáticamente
- Puedes configurar preview deployments para otras ramas
- Vercel incluye CDN global para mejor rendimiento

## Troubleshooting:
- Si hay errores de build, revisa los logs en Vercel
- Asegúrate de que la variable `REACT_APP_API_URL` esté configurada correctamente
- Verifica que el backend en Railway esté funcionando
