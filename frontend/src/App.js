import React, { useState, useEffect } from 'react';
import DividendTable from './components/DividendTable';
import ColumnSelector from './components/ColumnSelector';
import Header from './components/Header';
import { fetchDividendos, testBasicConnection, startUpdateDividendos, getUpdateStatus } from './utils/api';

function App() {
  const [dividendosConfirmados, setDividendosConfirmados] = useState([]);
  const [dividendosPrevistos, setDividendosPrevistos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [currentCompany, setCurrentCompany] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    empresa: true,
    fecha: true,
    importe: true,
    rentabilidad: true,
    recomendacion: true,
    precioObjetivo: true,
    potencial: true
  });

  useEffect(() => {
    const loadDividendos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Solo cargar datos del archivo, NO hacer actualización automática
        console.log('📂 Cargando datos desde archivo...');
        const result = await fetchDividendos();
        
        console.log('🔍 Estructura de datos recibida:', result);
        
        // Separar dividendos confirmados y previstos
        if (result.dividendos && result.dividendos.confirmados && result.dividendos.previstos) {
          console.log('✅ Datos separados encontrados en result.dividendos');
          setDividendosConfirmados(result.dividendos.confirmados);
          setDividendosPrevistos(result.dividendos.previstos);
        } else if (result.confirmados && result.previstos) {
          console.log('✅ Datos separados encontrados en result raíz');
          setDividendosConfirmados(result.confirmados);
          setDividendosPrevistos(result.previstos);
        } else if (Array.isArray(result)) {
          console.log('⚠️ Datos en formato array (versión anterior)');
          setDividendosConfirmados(result);
          setDividendosPrevistos([]);
        } else {
          console.log('❌ Estructura de datos no reconocida:', result);
          setDividendosConfirmados([]);
          setDividendosPrevistos([]);
        }
        
        setLastUpdate(result.lastUpdate);
        setFromCache(result.fromCache);
        
        console.log('✅ Datos cargados desde archivo');
      } catch (err) {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
        console.error('Error loading dividendos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDividendos();
  }, []);

  const handleRefresh = async () => {
    setError(null);
    
    try {
      console.log('🔄 Iniciando actualización asíncrona...');
      
      // Iniciar la actualización
      const startResult = await startUpdateDividendos();
      console.log('🚀 Actualización iniciada:', startResult);
      
      if (startResult.success) {
        setUpdating(true);
        setUpdateProgress(0);
        setCurrentCompany('Iniciando...');
        
        // Monitorear el progreso
        const checkProgress = async () => {
          try {
            const status = await getUpdateStatus();
            console.log('📊 Estado actual:', status);
            
            setUpdateProgress(status.progress);
            setCurrentCompany(status.currentCompany || 'Procesando...');
            
            if (status.updating) {
              // Seguir monitoreando
              setTimeout(checkProgress, 2000); // Consultar cada 2 segundos
            } else {
              // Actualización completada
              setUpdating(false);
              setCurrentCompany('');
              
              if (status.error) {
                setError(`Error en la actualización: ${status.error}`);
              } else {
                // Recargar los datos
                console.log('✅ Actualización completada, recargando datos...');
                await loadDividendos();
              }
            }
          } catch (err) {
            console.error('Error monitoreando progreso:', err);
            setUpdating(false);
            setError('Error monitoreando el progreso de actualización');
          }
        };
        
        // Iniciar monitoreo
        setTimeout(checkProgress, 1000); // Empezar a monitorear después de 1 segundo
        
      } else if (startResult.updating) {
        // Ya hay una actualización en curso, monitorear esa
        console.log('⚠️ Ya hay una actualización en curso, monitoreando...');
        setUpdating(true);
        setUpdateProgress(startResult.progress || 0);
        setCurrentCompany(startResult.currentCompany || 'Procesando...');
        
        // Monitorear el progreso existente
        const checkProgress = async () => {
          try {
            const status = await getUpdateStatus();
            console.log('📊 Estado actual:', status);
            
            setUpdateProgress(status.progress);
            setCurrentCompany(status.currentCompany || 'Procesando...');
            
            if (status.updating) {
              // Seguir monitoreando
              setTimeout(checkProgress, 2000); // Consultar cada 2 segundos
            } else {
              // Actualización completada
              setUpdating(false);
              setCurrentCompany('');
              
              if (status.error) {
                setError(`Error en la actualización: ${status.error}`);
              } else {
                // Recargar los datos
                console.log('✅ Actualización completada, recargando datos...');
                await loadDividendos();
              }
            }
          } catch (err) {
            console.error('Error monitoreando progreso:', err);
            setUpdating(false);
            setError('Error monitoreando el progreso de actualización');
          }
        };
        
        // Iniciar monitoreo
        setTimeout(checkProgress, 1000); // Empezar a monitorear después de 1 segundo
        
      } else {
        setError(startResult.message || 'Error al iniciar la actualización');
      }
    } catch (err) {
      setError('Error al iniciar la actualización. Por favor, inténtalo de nuevo.');
      console.error('Error starting update:', err);
      setUpdating(false);
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={handleRefresh} loading={loading} updating={updating} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seguimiento de Dividendos
          </h1>
          <p className="text-gray-600">
            Mercado Continuo Español - Datos actualizados de dividendos próximos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Próximos Dividendos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {dividendosConfirmados.length + dividendosPrevistos.length} empresas encontradas
              </p>
              {lastUpdate && (
                <div className="text-xs text-gray-400 mt-1">
                  Última actualización: {new Date(lastUpdate).toLocaleString('es-ES')}
                  {fromCache && (
                    <span className="ml-2 text-blue-500">(desde caché)</span>
                  )}
                </div>
              )}
            </div>
            
            <ColumnSelector 
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando datos de dividendos...</p>
              </div>
            </div>
          ) : updating ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center max-w-md">
                <div className="loading-spinner mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Actualizando datos...</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${updateProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Progreso: {updateProgress}%
                </p>
                <p className="text-sm text-gray-500">
                  {currentCompany}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabla de Dividendos Confirmados */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dividendos Confirmados ({dividendosConfirmados.length})
                </h3>
                <DividendTable 
                  dividendos={dividendosConfirmados}
                  visibleColumns={visibleColumns}
                />
              </div>
              
              {/* Tabla de Dividendos Previstos */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dividendos Previstos ({dividendosPrevistos.length})
                </h3>
                <DividendTable 
                  dividendos={dividendosPrevistos}
                  visibleColumns={visibleColumns}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
