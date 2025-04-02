import React, { useState, useEffect } from 'react';

type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

interface NavigationViewProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect?: (mode: VisionMode) => void;
  currentMode?: VisionMode;
  serverAddress?: string;
  onServerAddressChange?: (address: string) => void;
  serverStatus?: 'connected' | 'disconnected' | 'checking';
}

const NavigationView: React.FC<NavigationViewProps> = ({
  isOpen,
  onModeSelect,
  currentMode = 'normal',
  serverAddress = '',
  serverStatus = 'disconnected'
}) => {
  const [isAddressInputVisible, setIsAddressInputVisible] = useState(false);
  const [tempServerAddress, setTempServerAddress] = useState(serverAddress);

  // Update temp address when prop changes
  useEffect(() => {
    setTempServerAddress(serverAddress);
  }, [serverAddress]);

  // Handle mode selection
  const handleModeSelect = (mode: VisionMode) => {
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  // Get status indicator color
  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'bg-green-500';
      case 'checking': return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
      default: return 'bg-red-500';
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out w-64 z-20
       ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Настройки</h2>
      </div>

      {/* Server settings section */}
      <div className="border-b border-gray-700">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="min-w-0 mr-2 flex-1">
            <h3 className="text-sm font-semibold">Сервер</h3>
            <p className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">{serverAddress || 'Не настроен'}</p>
          </div>
          <div className="flex items-center flex-shrink-0">
            <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
            <button
              className="text-sm bg-gray-700 py-1 px-2 rounded hover:bg-gray-600 whitespace-nowrap"
              onClick={() => setIsAddressInputVisible(!isAddressInputVisible)}
            >
              Изменить
            </button>
          </div>
        </div>

        {isAddressInputVisible && (
          <div className="px-4 py-2 bg-gray-700">
            <input
              type="text"
              value={tempServerAddress}
              onChange={(e) => setTempServerAddress(e.target.value)}
              placeholder="Адрес сервера"
              className="w-full p-2 mb-2 bg-gray-900 border border-gray-600 text-white text-sm rounded"
            />
            <div className="flex justify-end">
              <button
                className="text-xs bg-gray-600 py-1 px-2 rounded mr-2 hover:bg-gray-500"
                onClick={() => setIsAddressInputVisible(false)}
              >
                Отмена
              </button>
              <button
                className="text-xs bg-blue-600 py-1 px-2 rounded hover:bg-blue-500"
                onClick={() => setIsAddressInputVisible(false)}
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-sm text-gray-400 italic border-b border-gray-700">
        Выберите режим цветовой слепоты
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