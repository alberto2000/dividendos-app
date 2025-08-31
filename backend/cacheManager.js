const fs = require('fs').promises;
const path = require('path');

class CacheManager {
  constructor() {
    this.cacheDir = path.join(__dirname, 'data');
    this.cacheFile = path.join(this.cacheDir, 'dividendos-cache.json');
    this.backupFile = path.join(this.cacheDir, 'dividendos-backup.json');
  }

  // Cargar datos del caché desde archivo
  async loadCache() {
    try {
      console.log('📂 Cargando caché desde archivo...');
      const data = await fs.readFile(this.cacheFile, 'utf8');
      const cache = JSON.parse(data);
      
      // Validar estructura del caché (aceptar tanto array como objeto con confirmados/previstos)
      if (cache && cache.version) {
        if (Array.isArray(cache.dividendos)) {
          // Estructura antigua: array de dividendos
          console.log(`✅ Caché cargado (formato antiguo): ${cache.dividendos.length} dividendos, última actualización: ${cache.lastUpdate || 'Nunca'}`);
          return cache;
        } else if (cache.dividendos && cache.dividendos.confirmados && cache.dividendos.previstos) {
          // Estructura nueva: objeto con confirmados y previstos
          const totalDividendos = cache.dividendos.confirmados.length + cache.dividendos.previstos.length;
          console.log(`✅ Caché cargado (formato nuevo): ${cache.dividendos.confirmados.length} confirmados, ${cache.dividendos.previstos.length} previstos, última actualización: ${cache.lastUpdate || 'Nunca'}`);
          return cache;
        } else {
          console.log('⚠️ Estructura de caché inválida, creando nuevo caché');
          return this.createEmptyCache();
        }
      } else {
        console.log('⚠️ Caché sin versión, creando nuevo caché');
        return this.createEmptyCache();
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📂 Archivo de caché no existe, creando nuevo...');
        return this.createEmptyCache();
      } else {
        console.error('❌ Error cargando caché:', error.message);
        return this.createEmptyCache();
      }
    }
  }

  // Guardar datos en el caché
  async saveCache(dividendos, lastUpdate) {
    try {
      const cache = {
        dividendos,
        lastUpdate,
        version: '1.0',
        createdAt: new Date().toISOString()
      };

      // Crear backup antes de sobrescribir
      await this.createBackup();
      
      // Guardar nuevo caché
      await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2), 'utf8');
      
      console.log(`💾 Caché guardado: ${dividendos.length} dividendos, timestamp: ${lastUpdate}`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando caché:', error.message);
      return false;
    }
  }

  // Crear backup del caché actual
  async createBackup() {
    try {
      const currentCache = await this.loadCache();
      if (currentCache.dividendos && currentCache.dividendos.length > 0) {
        await fs.writeFile(this.backupFile, JSON.stringify(currentCache, null, 2), 'utf8');
        console.log('💾 Backup del caché creado');
      }
    } catch (error) {
      console.log('⚠️ No se pudo crear backup:', error.message);
    }
  }

  // Crear caché vacío
  createEmptyCache() {
    return {
      dividendos: {
        confirmados: [],
        previstos: []
      },
      lastUpdate: null,
      version: '1.0',
      createdAt: new Date().toISOString()
    };
  }

  // Obtener información del caché
  async getCacheInfo() {
    try {
      const stats = await fs.stat(this.cacheFile);
      const cache = await this.loadCache();
      
      let dividendosCount = 0;
      if (Array.isArray(cache.dividendos)) {
        // Estructura antigua
        dividendosCount = cache.dividendos.length;
      } else if (cache.dividendos && cache.dividendos.confirmados && cache.dividendos.previstos) {
        // Estructura nueva
        dividendosCount = cache.dividendos.confirmados.length + cache.dividendos.previstos.length;
      }
      
      return {
        fileSize: stats.size,
        lastModified: stats.mtime,
        dividendosCount,
        lastUpdate: cache.lastUpdate,
        version: cache.version
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  // Limpiar caché (eliminar archivo)
  async clearCache() {
    try {
      await fs.unlink(this.cacheFile);
      console.log('🗑️ Caché eliminado');
      return true;
    } catch (error) {
      console.error('❌ Error eliminando caché:', error.message);
      return false;
    }
  }
}

module.exports = CacheManager;
