import React, { useState } from 'react';

type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

interface NavigationViewProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect?: (mode: VisionMode) => void;
  currentMode?: VisionMode;
}

const NavigationView: React.FC<NavigationViewProps> = ({ 
  isOpen, 
  onClose,
  onModeSelect,
  currentMode = 'normal'
}) => {
  // Handle mode selection
  const handleModeSelect = (mode: VisionMode) => {
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };
  
  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out w-64 z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Настройки</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer flex items-center ${currentMode === 'normal' ? 'bg-gray-700' : ''}`}
            onClick={() => handleModeSelect('normal')}
          >
            {currentMode === 'normal' && (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className={currentMode === 'normal' ? 'font-bold' : ''}>Здоровый</span>
          </li>
          <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer flex items-center ${currentMode === 'protanomaly' ? 'bg-gray-700' : ''}`}
            onClick={() => handleModeSelect('protanomaly')}
          >
            {currentMode === 'protanomaly' && (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className={currentMode === 'protanomaly' ? 'font-bold' : ''}>Протаномалия</span>
          </li>
          <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer flex items-center ${currentMode === 'deuteranomaly' ? 'bg-gray-700' : ''}`}
            onClick={() => handleModeSelect('deuteranomaly')}
          >
            {currentMode === 'deuteranomaly' && (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className={currentMode === 'deuteranomaly' ? 'font-bold' : ''}>Деутераномалия</span>
          </li>
          <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer flex items-center ${currentMode === 'tritanomaly' ? 'bg-gray-700' : ''}`}
            onClick={() => handleModeSelect('tritanomaly')}
          >
            {currentMode === 'tritanomaly' && (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className={currentMode === 'tritanomaly' ? 'font-bold' : ''}>Тританомалия</span>
          </li>
          <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer flex items-center ${currentMode === 'achromatopsia' ? 'bg-gray-700' : ''}`}
            onClick={() => handleModeSelect('achromatopsia')}
          >
            {currentMode === 'achromatopsia' && (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className={currentMode === 'achromatopsia' ? 'font-bold' : ''}>Ахроматопсия</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavigationView;