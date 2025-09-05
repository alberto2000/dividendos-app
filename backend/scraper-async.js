const axios = require('axios');
const { saveData } = require('./dataManager');
const { startUpdate, updateProgress, completeUpdate, setError } = require('./updateManager');

async function scrapeDividendosAsync() {
  console.log('🚀 Iniciando scraping asíncrono de dividendos...');
  
  try {
    // Configurar axios con headers para evitar bloqueos
    const client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    console.log('📡 Obteniendo página de dividendos...');
    const response = await client.get('https://www.eleconomista.es/mercados-cotizaciones/ecodividendo/calendario.php');
    
    const html = response.data;
    const dividendosConfirmados = [];
    const dividendosPrevistos = [];
    
    console.log('🔍 Procesando tablas de dividendos...');
    
    // Buscar tablas en el HTML
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tables = html.match(tableRegex) || [];
    
    tables.forEach((table, tableIndex) => {
      // Buscar filas en cada tabla
      const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
      const rows = table.match(rowRegex) || [];
      
      rows.forEach((row) => {
        // Buscar celdas en cada fila con regex más robusto
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells = [];
        let match;
        
        while ((match = cellRegex.exec(row)) !== null) {
          // Limpiar el contenido de la celda
          let cellContent = match[1]
            .replace(/<[^>]*>/g, '') // Remover tags HTML
            .replace(/&nbsp;/g, ' ') // Reemplazar &nbsp;
            .replace(/&amp;/g, '&') // Reemplazar &amp;
            .replace(/&lt;/g, '<') // Reemplazar &lt;
            .replace(/&gt;/g, '>') // Reemplazar &gt;
            .trim();
          cells.push(cellContent);
        }
        
        if (cells.length >= 4) {
          const empresa = cells[0] || '';
          const fecha = cells[1] || '';
          const importe = cells[2] || '';
          const rentabilidad = cells[3] || '';
          
          if (empresa && fecha) {
            // Buscar enlace de la empresa en la primera celda
            const linkMatch = row.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
            const empresaLink = linkMatch ? linkMatch[1] : '';
            const empresaLinkCompleto = empresaLink ? `https://www.eleconomista.es${empresaLink}` : '';
            
            const dividendo = {
              empresa,
              fecha,
              importe,
              rentabilidad,
              empresaLink: empresaLinkCompleto,
              recomendacion: '-',
              precioObjetivo: '-',
              precioAnterior: '-',
              potencial: '-'
            };
            
            // Determinar si es confirmado o previsto basándose en la tabla
            if (tableIndex === 0) {
              dividendosConfirmados.push(dividendo);
            } else if (tableIndex === 1) {
              dividendosPrevistos.push(dividendo);
            }
          }
        }
      });
    });
    
    console.log(`📊 Encontrados ${dividendosConfirmados.length} dividendos confirmados`);
    console.log(`📊 Encontrados ${dividendosPrevistos.length} dividendos previstos`);
    
    // Calcular total de empresas a procesar
    const totalCompanies = dividendosConfirmados.length + dividendosPrevistos.length;
    console.log(`🎯 Total de empresas a procesar: ${totalCompanies}`);
    
    // Iniciar el estado de actualización
    startUpdate(totalCompanies);
    
    // Procesar todas las empresas confirmadas
    const dividendosConfirmadosCompletos = await obtenerInfoEmpresasAsync(
      dividendosConfirmados, 
      client, 
      'confirmados',
      0
    );
    
    // Procesar todas las empresas previstas
    const dividendosPrevistosCompletos = await obtenerInfoEmpresasAsync(
      dividendosPrevistos, 
      client, 
      'previstos',
      dividendosConfirmados.length
    );
    
    // Guardar datos finales
    const finalData = {
      confirmados: dividendosConfirmadosCompletos,
      previstos: dividendosPrevistosCompletos
    };
    
    saveData(finalData);
    completeUpdate();
    
    console.log('✅ Scraping asíncrono completado exitosamente');
    return finalData;
    
  } catch (error) {
    console.error('❌ Error en scraping asíncrono:', error.message);
    setError(error.message);
    throw error;
  }
}

// Función para obtener información adicional de cada empresa usando regex (versión asíncrona)
async function obtenerInfoEmpresasAsync(dividendos, client, tipo, offset = 0) {
  console.log(`🔄 Procesando ${dividendos.length} empresas (${tipo})...`);
  
  const dividendosCompletos = [];
  
  for (let i = 0; i < dividendos.length; i++) {
    const dividendo = dividendos[i];
    const currentIndex = offset + i;
    
    console.log(`📈 Procesando empresa ${currentIndex + 1}/${offset + dividendos.length} (${tipo}): ${dividendo.empresa}`);
    
    // Actualizar progreso
    updateProgress(currentIndex, dividendo.empresa);
    
    try {
      // Si tenemos el enlace directo, usarlo directamente
      if (dividendo.empresaLink && dividendo.empresaLink.includes('/empresa/')) {
        console.log(`  🔗 Enlace directo encontrado: ${dividendo.empresaLink}`);
        
        // Hacer request a la página de la empresa
        const empresaResponse = await client.get(dividendo.empresaLink);
        const html = empresaResponse.data;
        
        let recomendacion = '-';
        let precioObjetivo = '-';
        let precioAnterior = '-';
        
        // Buscar todas las recomendaciones con sus números
        const recomendaciones = {
          compra: 0,
          compraModerada: 0,
          mantener: 0,
          ventaModerada: 0,
          venta: 0
        };
        
        // Patrones para cada tipo de recomendación
        const recomendacionPatterns = [
          { key: 'compra', pattern: /data-heading="Recomendaciones de compra"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi },
          { key: 'compraModerada', pattern: /data-heading="Recomendaciones de compra moderada"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi },
          { key: 'mantener', pattern: /data-heading="Recomendaciones de mantener"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi },
          { key: 'ventaModerada', pattern: /data-heading="Recomendaciones de venta moderada"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi },
          { key: 'venta', pattern: /data-heading="Recomendaciones de venta"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi }
        ];
        
        // Extraer números para cada tipo de recomendación
        recomendacionPatterns.forEach(({ key, pattern }) => {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            const numero = parseInt(match[1].trim());
            if (!isNaN(numero)) {
              recomendaciones[key] = numero;
              console.log(`  ${key}: ${numero}`);
            }
          }
        });
        
        // Crear string concatenado con guiones
        const recomendacionString = `${recomendaciones.compra}-${recomendaciones.compraModerada}-${recomendaciones.mantener}-${recomendaciones.ventaModerada}-${recomendaciones.venta}`;
        recomendacion = recomendacionString;
        console.log(`  ✅ Recomendación concatenada: "${recomendacion}"`);
        
        // Buscar precio objetivo con regex
        const precioPatterns = [
          /data-heading="Precio objetivo"[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<span[^>]*class="[^"]*h4[^"]*"[^>]*>([^<]+)<\/span>/i,
          /data-heading="Precio objetivo"[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
          /data-heading="Precio objetivo"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/i,
          /Precio objetivo[\s\S]*?<td[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
          /Precio objetivo[\s\S]*?<td[^>]*>([^<]+)<\/td>/i
        ];
        
        for (const pattern of precioPatterns) {
          const match = html.match(pattern);
          if (match && match[1] && match[1].trim()) {
            const precioText = match[1].trim();
            // Verificar que sea un precio válido (contiene € o es un número)
            if (precioText.includes('€') || /^\d+[,.]?\d*$/.test(precioText.replace(/[€\s]/g, ''))) {
              precioObjetivo = precioText;
              console.log(`  ✅ Precio objetivo encontrado: "${precioObjetivo}"`);
              break;
            } else {
              console.log(`  ⚠️ Precio objetivo inválido (parece fecha): "${precioText}"`);
            }
          }
        }
        
        // Buscar precio anterior con regex
        const anteriorPatterns = [
          /data-heading="Anterior"[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>/i,
          /Anterior[\s\S]*?<td[^>]*>([^<]+)<\/td>/i
        ];
        
        for (const pattern of anteriorPatterns) {
          const match = html.match(pattern);
          if (match && match[1] && match[1].trim()) {
            precioAnterior = match[1].trim();
            console.log(`  ✅ Precio anterior encontrado: "${precioAnterior}"`);
            break;
          }
        }
        
        // Calcular potencial
        let potencial = '-';
        if (precioObjetivo !== '-' && precioAnterior !== '-') {
          try {
            // Limpiar los valores (quitar € y espacios)
            const precioObj = parseFloat(precioObjetivo.replace(/[€\s]/g, '').replace(',', '.'));
            const precioAnt = parseFloat(precioAnterior.replace(/[€\s]/g, '').replace(',', '.'));
            
            if (!isNaN(precioObj) && !isNaN(precioAnt) && precioAnt > 0) {
              const porcentaje = ((precioObj - precioAnt) / precioAnt) * 100;
              potencial = `${porcentaje.toFixed(2)}%`;
            }
          } catch (error) {
            console.log(`  ⚠️ Error calculando potencial para ${dividendo.empresa}:`, error.message);
          }
        }
        
        dividendo.recomendacion = recomendacion;
        dividendo.precioObjetivo = precioObjetivo;
        dividendo.precioAnterior = precioAnterior;
        dividendo.potencial = potencial;
        
        console.log(`  🎯 Datos completos para ${dividendo.empresa} (${tipo}):`);
        console.log(`    - Recomendación: "${recomendacion}"`);
        console.log(`    - Precio objetivo: "${precioObjetivo}"`);
        console.log(`    - Precio anterior: "${precioAnterior}"`);
        console.log(`    - Potencial: "${potencial}"`);
      } else {
        console.log(`  ❌ No se encontró enlace para ${dividendo.empresa} (${tipo})`);
      }
      
      dividendosCompletos.push(dividendo);
      
      // Pausa entre requests para evitar bloqueos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error procesando empresa ${dividendo.empresa} (${tipo}):`, error.message);
      dividendosCompletos.push(dividendo);
    }
  }
  
  return dividendosCompletos;
}

module.exports = { scrapeDividendosAsync };
