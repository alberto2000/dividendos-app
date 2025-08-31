# Dividendos Tracker - Mercado Continuo Español

Una aplicación web minimalista y moderna para el seguimiento de dividendos de empresas del mercado continuo español. La aplicación extrae datos de [eleconomista.es](https://www.eleconomista.es) y presenta la información de manera clara y organizada.

## 🚀 Características

- **Tabla de Dividendos**: Lista completa de empresas con dividendos próximos
- **Ordenamiento**: Todas las columnas son ordenables (ascendente/descendente)
- **Columnas Personalizables**: Mostrar/ocultar columnas según preferencias
- **Datos en Tiempo Real**: Actualización manual de datos desde la fuente
- **Diseño Responsivo**: Funciona perfectamente en dispositivos móviles y desktop
- **Interfaz Minimalista**: Diseño limpio y fácil de usar

## 📊 Columnas Disponibles

- **Empresa**: Nombre de la empresa
- **Fecha Dividendo**: Fecha del próximo dividendo
- **Importe**: Cantidad del dividendo
- **Rentabilidad**: Porcentaje de rentabilidad
- **Recomendación**: Recomendación de compra/venta/mantener
- **Precio Objetivo**: Precio objetivo de la empresa

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con **Express**
- **Puppeteer** para web scraping
- **Cheerio** para parsing HTML
- **Axios** para requests HTTP

### Frontend
- **React 18** con hooks
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Axios** para comunicación con API

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o yarn
- Navegador web moderno

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd dividendos-app
```

### 2. Instalar Dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar Dependencias del Frontend
```bash
cd ../frontend
npm install
```

### 4. Configuración del Backend
El backend se ejecuta por defecto en el puerto 3001. Puedes modificar la configuración en `backend/config.js`.

### 5. Configuración del Frontend
El frontend se ejecuta por defecto en el puerto 3000 y se conecta automáticamente al backend en localhost:3001.

## 🏃‍♂️ Ejecución

### Desarrollo Local

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

### Producción

#### Opción 1: Docker Compose (Local)
```bash
docker-compose up -d
```

#### Opción 2: Despliegue en la Nube (Recomendado)

**Despliegue Automático:**
```bash
./deploy.sh
```

**Despliegue Manual:**

1. **Backend en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu repositorio
   - Selecciona la carpeta `backend`
   - Configura variables de entorno (ver `deploy-railway.md`)

2. **Frontend en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio
   - Selecciona la carpeta `frontend`
   - Configura `REACT_APP_API_URL` con la URL de Railway

**Guías detalladas:**
- [Despliegue en Railway](deploy-railway.md)
- [Despliegue en Vercel](deploy-vercel.md)

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📡 API Endpoints

### GET /api/dividendos
Obtiene la lista completa de dividendos próximos.

**Respuesta:**
```json
[
  {
    "empresa": "Telefónica",
    "fecha": "2024-01-20",
    "importe": "0.30€",
    "rentabilidad": "3.2%",
    "recomendacion": "Mantener",
    "precioObjetivo": "12.80€"
  }
]
```

### GET /api/health
Verifica el estado del servidor.

## 🔧 Configuración Avanzada

### Variables de Entorno
Crea un archivo `.env` en la carpeta `backend`:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com
```

### Personalización de Estilos
Los estilos se pueden personalizar modificando `frontend/tailwind.config.js` y `frontend/src/index.css`.

## 🚨 Consideraciones Importantes

### Web Scraping
- La aplicación utiliza web scraping para obtener datos de eleconomista.es
- Respeta los términos de uso del sitio web
- Incluye delays entre requests para evitar sobrecarga
- Considera implementar rate limiting en producción

### Datos en Tiempo Real
- Los datos se actualizan manualmente al hacer clic en "Actualizar"
- El scraping puede tomar varios segundos dependiendo del número de empresas
- Los datos se obtienen directamente de la fuente en cada actualización

## 🐛 Solución de Problemas

### Error de Conexión al Backend
- Verifica que el backend esté ejecutándose en el puerto 3001
- Comprueba que no haya conflictos de puertos
- Revisa los logs del backend para errores

### Problemas de Scraping
- Verifica tu conexión a internet
- Comprueba que eleconomista.es esté accesible
- Revisa los logs del backend para errores específicos

### Problemas de Rendimiento
- El scraping inicial puede ser lento
- Considera implementar caché para datos estáticos
- Optimiza el número de empresas procesadas

## 🔮 Futuras Mejoras

- [ ] Caché de datos para mejorar rendimiento
- [ ] Filtros avanzados por empresa, sector, etc.
- [ ] Notificaciones de nuevos dividendos
- [ ] Exportación de datos a CSV/Excel
- [ ] Gráficos y análisis de tendencias
- [ ] Autenticación de usuarios
- [ ] Base de datos para persistencia

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de solución de problemas
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Nota**: Esta aplicación es para uso educativo y personal. Respeta siempre los términos de uso de los sitios web que consulta.
