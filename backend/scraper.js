const puppeteer = require('puppeteer');

async function scrapeDividendos() {
  console.log('Iniciando scraping de dividendos...');
  
  try {
    // Usar Puppeteer para el scraping dinámico
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configurar user agent para evitar bloqueos
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navegar a la página de dividendos
    console.log('Navegando a la página de dividendos...');
    await page.goto('https://www.eleconomista.es/mercados-cotizaciones/ecodividendo/calendario.php', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Esperar a que se cargue la tabla de dividendos
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Extraer datos de ambas tablas (confirmados y previstos)
    const { dividendosConfirmados, dividendosPrevistos } = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const dividendosConfirmados = [];
      const dividendosPrevistos = [];
      
      // Procesar cada tabla
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
          try {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
              const empresa = cells[0]?.textContent?.trim() || '';
              const fecha = cells[1]?.textContent?.trim() || '';
              const importe = cells[2]?.textContent?.trim() || '';
              const rentabilidad = cells[3]?.textContent?.trim() || '';
              
              // Buscar el enlace directo a la empresa en la primera celda
              const empresaLink = cells[0]?.querySelector('a')?.href || '';
              
              if (empresa && fecha) {
                const dividendo = {
                  empresa,
                  fecha,
                  importe,
                  rentabilidad,
                  empresaLink,
                  recomendacion: '-',
                  precioObjetivo: '-',
                  precioAnterior: '-',
                  potencial: '-'
                };
                
                // Determinar si es confirmado o previsto basándose en la tabla
                if (tableIndex === 0) {
                  // Primera tabla - Dividendos confirmados
                  dividendosConfirmados.push(dividendo);
                } else if (tableIndex === 1) {
                  // Segunda tabla - Dividendos previstos
                  dividendosPrevistos.push(dividendo);
                }
              }
            }
          } catch (error) {
            console.log(`Error procesando fila ${index} de tabla ${tableIndex}:`, error);
          }
        });
      });
      
      return { dividendosConfirmados, dividendosPrevistos };
    });
    
    console.log(`Encontrados ${dividendosConfirmados.length} dividendos confirmados`);
    console.log(`Encontrados ${dividendosPrevistos.length} dividendos previstos`);
    
    // Obtener información adicional de empresas (limitado a 10 por tipo)
    const dividendosConfirmadosCompletos = await obtenerInfoEmpresas(dividendosConfirmados.slice(0, 10), page, 'confirmados');
    const dividendosPrevistosCompletos = await obtenerInfoEmpresas(dividendosPrevistos.slice(0, 10), page, 'previstos');
    
    await browser.close();
    
    console.log('Scraping completado. Enviando dividendos 📊');
    console.log('Primeros 10 dividendos:', dividendosConfirmadosCompletos.slice(0, 10));
    
    return {
      confirmados: dividendosConfirmadosCompletos,
      previstos: dividendosPrevistosCompletos
    };
    
  } catch (error) {
    console.error('Error en scraping:', error);
    throw error;
  }
}

// Función para obtener información adicional de cada empresa
async function obtenerInfoEmpresas(dividendos, page, tipo) {
  console.log(`Obteniendo información adicional de empresas (${tipo})...`);
  
  const dividendosCompletos = [];
  
  for (let i = 0; i < Math.min(dividendos.length, 10); i++) { // Limitar a 10 empresas
    const dividendo = dividendos[i];
          console.log(`Procesando empresa ${i + 1}/${Math.min(dividendos.length, 10)} (${tipo}): ${dividendo.empresa}`);
    
    try {
      // Si tenemos el enlace directo, usarlo directamente
      if (dividendo.empresaLink && dividendo.empresaLink.includes('/empresa/')) {
        console.log(`  Enlace directo encontrado: ${dividendo.empresaLink}`);
        
        // Navegar directamente a la página de la empresa
        await page.goto(dividendo.empresaLink, { waitUntil: 'networkidle2', timeout: 15000 });
        
        // Extraer recomendación, precio objetivo y precio anterior
        const infoEmpresa = await page.evaluate(() => {
          let recomendacion = '-';
          let precioObjetivo = '-';
          let precioAnterior = '-';
          
          // Buscar recomendación
          const recomendacionSelectors = [
            'td[data-heading="Recomendaciones de compra"] + td span',
            'td[data-heading="Recomendaciones de compra"] + td',
            '.footable-first-visible[data-heading="Recomendaciones de compra"] + td',
            '.footable-first-visible[data-heading="Recomendaciones de compra"] + .footable-last-visible'
          ];
          
          for (const selector of recomendacionSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              recomendacion = element.textContent.trim();
              console.log(`Recomendación encontrada con selector: ${selector}`);
              break;
            }
          }
          
          // Buscar precio objetivo
          const precioSelectors = [
            'td[data-heading="Precio objetivo"] + td span.h4',
            'td[data-heading="Precio objetivo"] + td span',
            'td[data-heading="Precio objetivo"] + td',
            '.footable-first-visible[data-heading="Precio objetivo"] + td',
            '.footable-first-visible[data-heading="Precio objetivo"] + .footable-last-visible'
          ];
          
          for (const selector of precioSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              precioObjetivo = element.textContent.trim();
              console.log(`Precio objetivo encontrado con selector: ${selector}`);
              break;
            }
          }
          
          // Buscar precio anterior
          const anteriorSelectors = [
            'td[data-heading="Anterior"] + td',
            '.footable-first-visible[data-heading="Anterior"] + td',
            '.footable-first-visible[data-heading="Anterior"] + .footable-last-visible'
          ];
          
          for (const selector of anteriorSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              precioAnterior = element.textContent.trim();
              console.log(`Precio anterior encontrado con selector: ${selector}`);
              break;
            }
          }
          
          return { recomendacion, precioObjetivo, precioAnterior };
        });
        
        // Calcular potencial
        let potencial = '-';
        if (infoEmpresa.precioObjetivo !== '-' && infoEmpresa.precioAnterior !== '-') {
          try {
            // Limpiar los valores (quitar € y espacios)
            const precioObj = parseFloat(infoEmpresa.precioObjetivo.replace(/[€\s]/g, '').replace(',', '.'));
            const precioAnt = parseFloat(infoEmpresa.precioAnterior.replace(/[€\s]/g, '').replace(',', '.'));
            
            if (!isNaN(precioObj) && !isNaN(precioAnt) && precioAnt > 0) {
              const porcentaje = ((precioObj - precioAnt) / precioAnt) * 100;
              potencial = `${porcentaje.toFixed(2)}%`;
            }
          } catch (error) {
            console.log(`Error calculando potencial para ${dividendo.empresa}:`, error.message);
          }
        }
        
        dividendo.recomendacion = infoEmpresa.recomendacion;
        dividendo.precioObjetivo = infoEmpresa.precioObjetivo;
        dividendo.precioAnterior = infoEmpresa.precioAnterior;
        dividendo.potencial = potencial;
        
        console.log(`  ✅ Datos extraídos para ${dividendo.empresa} (${tipo}):`);
        console.log(`    - Recomendación: "${infoEmpresa.recomendacion}"`);
        console.log(`    - Precio objetivo: "${infoEmpresa.precioObjetivo}"`);
        console.log(`    - Precio anterior: "${infoEmpresa.precioAnterior}"`);
        console.log(`    - Potencial: "${potencial}"`);
      } else {
        console.log(`  ❌ No se encontró enlace para ${dividendo.empresa} (${tipo})`);
      }
      
      dividendosCompletos.push(dividendo);
      
      // Pausa entre requests para evitar bloqueos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error procesando empresa ${dividendo.empresa} (${tipo}):`, error.message);
      dividendosCompletos.push(dividendo);
    }
  }
  
  return dividendosCompletos;
}

module.exports = { scrapeDividendos };
