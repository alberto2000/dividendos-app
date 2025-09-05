import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const DividendTable = ({ dividendos, visibleColumns }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para convertir fecha del formato "26-Ago" a un número comparable
  const parseDate = (dateStr) => {
    if (!dateStr) return 0;
    
    const months = {
      'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
    };
    
    const parts = dateStr.split('-');
    if (parts.length !== 2) return 0;
    
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    
    if (isNaN(day) || !month) return 0;
    
    // Usar 2024 como año base para la comparación
    return new Date(2024, month - 1, day).getTime();
  };

  const sortedDividendos = useMemo(() => {
    if (!sortConfig.key) return dividendos;

    return [...dividendos].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Ordenación especial para fechas
      if (sortConfig.key === 'fecha') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenación especial para importes (quitar € y convertir a número)
      if (sortConfig.key === 'importe') {
        aValue = parseFloat(aValue.replace(/[€\s]/g, '').replace(',', '.')) || 0;
        bValue = parseFloat(bValue.replace(/[€\s]/g, '').replace(',', '.')) || 0;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenación especial para rentabilidad (quitar % y convertir a número)
      if (sortConfig.key === 'rentabilidad') {
        aValue = parseFloat(aValue.replace(/[%\s]/g, '').replace(',', '.')) || 0;
        bValue = parseFloat(bValue.replace(/[%\s]/g, '').replace(',', '.')) || 0;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenación especial para precio objetivo (quitar € y convertir a número)
      if (sortConfig.key === 'precioObjetivo') {
        aValue = parseFloat(aValue.replace(/[€\s]/g, '').replace(',', '.')) || 0;
        bValue = parseFloat(bValue.replace(/[€\s]/g, '').replace(',', '.')) || 0;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenación especial para potencial (quitar % y convertir a número)
      if (sortConfig.key === 'potencial') {
        aValue = parseFloat(aValue.replace(/[%\s]/g, '').replace(',', '.')) || 0;
        bValue = parseFloat(bValue.replace(/[%\s]/g, '').replace(',', '.')) || 0;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenación normal para texto
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'es', { numeric: true })
          : bValue.localeCompare(aValue, 'es', { numeric: true });
      }

      // Ordenación por defecto
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dividendos, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const getRecomendacionColor = (recomendacion) => {
    // Si es un string de números con guiones (ej: "1-2-5-0-2")
    if (/^\d+-\d+-\d+-\d+-\d+$/.test(recomendacion)) {
      return 'text-blue-600 bg-blue-50';
    }
    
    const lower = recomendacion.toLowerCase();
    if (lower.includes('compra') || lower.includes('buy')) return 'text-success-600 bg-success-50';
    if (lower.includes('mantener') || lower.includes('hold')) return 'text-warning-600 bg-warning-50';
    if (lower.includes('vender') || lower.includes('sell')) return 'text-danger-600 bg-danger-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRecomendacionTooltip = (recomendacion) => {
    // Si es un string de números con guiones (ej: "1-2-5-0-2")
    if (/^\d+-\d+-\d+-\d+-\d+$/.test(recomendacion)) {
      const [compra, compraModerada, mantener, ventaModerada, venta] = recomendacion.split('-');
      return `Compra: ${compra} | Compra Moderada: ${compraModerada} | Mantener: ${mantener} | Venta Moderada: ${ventaModerada} | Venta: ${venta}`;
    }
    return recomendacion;
  };

  const columnConfig = {
    empresa: { label: 'Empresa', sortable: true },
    fecha: { label: 'Fecha Dividendo', sortable: true },
    importe: { label: 'Importe', sortable: true },
    rentabilidad: { label: 'Rentabilidad', sortable: true },
    recomendacion: { label: 'Recomendación', sortable: true },
    precioObjetivo: { label: 'Precio Objetivo', sortable: true },
    potencial: { label: 'Potencial', sortable: true }
  };

  if (dividendos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-500">No se encontraron dividendos próximos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Leyenda de recomendaciones */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Leyenda de Recomendaciones</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Formato:</strong> Compra | Compra Moderada | Mantener | Venta Moderada | Venta</p>
          <p><strong>Ejemplo:</strong> "1-2-5-0-2" = 1 Compra, 2 Compra Moderada, 5 Mantener, 0 Venta Moderada, 2 Venta</p>
          <p><em>Pasa el cursor sobre los números para ver el desglose completo</em></p>
        </div>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.entries(columnConfig).map(([key, config]) => {
              if (!visibleColumns[key]) return null;
              
              return (
                <th
                  key={key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    config.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => config.sortable && handleSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{config.label}</span>
                    {config.sortable && getSortIcon(key)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedDividendos.map((dividendo, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {visibleColumns.empresa && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {dividendo.empresaLink ? (
                      <a 
                        href={dividendo.empresaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {dividendo.empresa}
                      </a>
                    ) : (
                      <span className="text-gray-900">{dividendo.empresa}</span>
                    )}
                  </div>
                </td>
              )}
              
              {visibleColumns.fecha && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {dividendo.fecha}
                  </div>
                </td>
              )}
              
              {visibleColumns.importe && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    {dividendo.importe}
                  </div>
                </td>
              )}
              
              {visibleColumns.rentabilidad && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {dividendo.rentabilidad}
                  </div>
                </td>
              )}
              
              {visibleColumns.recomendacion && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-help ${getRecomendacionColor(dividendo.recomendacion)}`}
                    title={getRecomendacionTooltip(dividendo.recomendacion)}
                  >
                    {dividendo.recomendacion}
                  </span>
                </td>
              )}
              
              {visibleColumns.precioObjetivo && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">
                    {dividendo.precioObjetivo}
                  </div>
                </td>
              )}

              {visibleColumns.potencial && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-purple-600">
                    {dividendo.potencial}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DividendTable;
