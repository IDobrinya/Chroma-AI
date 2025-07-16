import React, {useEffect, useState} from 'react';

type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

type TokenStatus = 'valid' | 'invalid' | 'not_set';

interface NavigationViewProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect?: (mode: VisionMode) => void;
  currentMode?: VisionMode;
  serverToken?: string;
  tokenStatus?: TokenStatus;
  onServerTokenChange?: (token: string) => void;
  onDisconnect?: () => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({
  isOpen,
  onModeSelect,
  onServerTokenChange,
  onDisconnect,
  currentMode = 'normal',
  serverToken = '',
  tokenStatus = 'not_set',
}) => {
  const [isTokenInputVisible, setIsTokenInputVisible] = useState(false);
  const [tempServerToken, setTempServerToken] = useState(serverToken);

  useEffect(() => {
    if (tokenStatus === 'valid'){
      setTempServerToken(serverToken);
    }
  }, [serverToken]);

  // Handle mode selection
  const handleModeSelect = (mode: VisionMode) => {
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out w-64 z-[60] overflow-y-auto
       ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Настройки</h2>
      </div>

      {/* Server settings section */}

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold mb-2">Токен сервера</h3>
        <div className="flex gap-2">
          <button
            className="text-sm bg-gray-700 py-1 px-2 rounded hover:bg-gray-600 w-full"
            onClick={() => setIsTokenInputVisible(!isTokenInputVisible)}
          >
            Изменить
          </button>
          <button
              onClick={() => {
                onDisconnect?.();
                if (onServerTokenChange) {
                  onServerTokenChange('');
                }
                setTempServerToken("")
                setIsTokenInputVisible(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Отключиться
          </button>
        </div>
    </div>

      {isTokenInputVisible && (
        <div className="px-4 py-2 bg-gray-700">
          <input
            type="text"
            value={tempServerToken}
            onChange={(e) => setTempServerToken(e.target.value)}
            placeholder="Токен"
            className="w-full p-2 mb-2 bg-gray-900 border border-gray-600 text-white text-sm rounded"
          />
          <div className="flex justify-end">
            <button
              className="text-xs bg-gray-600 py-1 px-2 rounded mr-2 hover:bg-gray-500"
              onClick={() => {
                setTempServerToken(serverToken);
                setIsTokenInputVisible(false);
              }}
            >
              Отмена
            </button>
            <button
              className="text-xs bg-blue-600 py-1 px-2 rounded hover:bg-blue-500"
              onClick={() => {
                if (onServerTokenChange) {
                  onServerTokenChange(tempServerToken);
                }
                setTempServerToken(tempServerToken);
                setIsTokenInputVisible(false);
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      <div className={
        `px-4 py-2 text-sm rounded mb-2 ${
            tokenStatus === 'valid'
                ? 'bg-green-100 text-green-800'
                : tokenStatus === 'invalid'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
        }`
      }>
        {tokenStatus === 'valid' && 'Токен валиден'}
        {tokenStatus === 'invalid' && 'Токен невалиден'}
        {tokenStatus === 'not_set' && 'Не установлен'}
      </div>

      <div className="h-4 italic border-b border-gray-700" />

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