const puppeteer = require('puppeteer');

async function scrapeDividendosSimple() {
  console.log('Iniciando scraping simplificado de dividendos...');
  
  try {
    // Configuración optimizada para Railway
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      protocolTimeout: 120000, // 2 minutos
      timeout: 120000
    });
    
    const page = await browser.newPage();
    
    // Configurar timeouts más largos
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
    
    // Configurar user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Deshabilitar imágenes y CSS para mejorar rendimiento
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    console.log('Navegando a la página de dividendos...');
    await page.goto('https://www.eleconomista.es/mercados-cotizaciones/ecodividendo/calendario.php', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Esperar a que se cargue la tabla
    await page.waitForSelector('table', { timeout: 30000 });
    
    // Extraer solo datos básicos sin información adicional
    const dividendos = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const dividendosConfirmados = [];
      const dividendosPrevistos = [];
      
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach((row) => {
          try {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
              const empresa = cells[0]?.textContent?.trim() || '';
              const fecha = cells[1]?.textContent?.trim() || '';
              const importe = cells[2]?.textContent?.trim() || '';
              const rentabilidad = cells[3]?.textContent?.trim() || '';
              
              if (empresa && fecha) {
                const dividendo = {
                  empresa,
                  fecha,
                  importe,
                  rentabilidad,
                  recomendacion: '-',
                  precioObjetivo: '-',
                  precioAnterior: '-',
                  potencial: '-'
                };
                
                if (tableIndex === 0) {
                  dividendosConfirmados.push(dividendo);
                } else if (tableIndex === 1) {
                  dividendosPrevistos.push(dividendo);
                }
              }
            }
          } catch (error) {
            console.log('Error procesando fila:', error);
          }
        });
      });
      
      return { dividendosConfirmados, dividendosPrevistos };
    });
    
    await browser.close();
    
    console.log(`Scraping completado: ${dividendos.dividendosConfirmados.length} confirmados, ${dividendos.dividendosPrevistos.length} previstos`);
    
    return {
      confirmados: dividendos.dividendosConfirmados,
      previstos: dividendos.dividendosPrevistos
    };
    
  } catch (error) {
    console.error('Error en scraping simplificado:', error);
    throw error;
  }
}

module.exports = { scrapeDividendosSimple };
