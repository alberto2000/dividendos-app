import React, { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';

const ColumnSelector = ({ visibleColumns, onColumnToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const columns = [
    { key: 'empresa', label: 'Empresa' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'importe', label: 'Importe' },
    { key: 'rentabilidad', label: 'Rentabilidad' },
    { key: 'recomendacion', label: 'Recomendación' },
    { key: 'precioObjetivo', label: 'Precio Objetivo' },
    { key: 'potencial', label: 'Potencial' }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleColumnToggle = (column) => {
    onColumnToggle(column);
  };

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Settings className="w-4 h-4 mr-2" />
        Columnas ({visibleCount}/{Object.keys(visibleColumns).length})
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                Mostrar/Ocultar Columnas
              </div>
              
              {columns.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleColumnToggle(key)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    visibleColumns[key] ? 'text-gray-900' : 'text-gray-500'
                  }`}
                  role="menuitem"
                >
                  <span>{label}</span>
                  {visibleColumns[key] ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => {
                    Object.keys(visibleColumns).forEach(key => {
                      if (!visibleColumns[key]) onColumnToggle(key);
                    });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
                >
                  Mostrar Todas
                </button>
                
                <button
                  onClick={() => {
                    Object.keys(visibleColumns).forEach(key => {
                      if (visibleColumns[key]) onColumnToggle(key);
                    });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Ocultar Todas
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnSelector;
