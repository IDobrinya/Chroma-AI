import React from 'react';

type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

interface ResultPanelProps {
  label?: string;
  confidence?: number;
  isAiActive?: boolean;
  onToggleAI?: () => void;
  serverStatus?: 'connected' | 'disconnected' | 'checking' | 'error';
  serverAddress?: string;
  visionMode?: VisionMode;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  label = 'No object detected', 
  confidence = 0,
  isAiActive = false,
  onToggleAI,
  serverStatus = 'disconnected',
  serverAddress = '',
  visionMode = 'normal'
}) => {
  // Format confidence as percentage
  const formattedConfidence = `${Math.round(confidence * 100)}%`;
  
  // Get background color based on label, status, and vision mode
  const getBackgroundColor = () => {
    if (!isAiActive) return 'bg-black';
    
    if (serverStatus === 'disconnected') {
      return 'bg-red-900';
    }
    
    // Base colors for normal vision
    let greenClass = 'bg-green-700';
    let redClass = 'bg-red-700';
    let yellowClass = 'bg-yellow-600';
    
    // Adjust colors for different vision modes
    switch (visionMode) {
      case 'protanomaly': // Red-weak
        greenClass = 'bg-cyan-600'; // More blue in green
        redClass = 'bg-rose-400'; // Lighter, more visible red
        yellowClass = 'bg-yellow-400'; // Brighter yellow
        break;
      case 'deuteranomaly': // Green-weak
        greenClass = 'bg-blue-600'; // More blue than green
        redClass = 'bg-red-600'; // Standard red
        yellowClass = 'bg-yellow-400'; // Brighter yellow
        break;
      case 'tritanomaly': // Blue-yellow weakness
        greenClass = 'bg-emerald-500'; // Clearer green
        redClass = 'bg-red-600'; // Standard red
        yellowClass = 'bg-white'; // White instead of yellow
        break;
      case 'achromatopsia': // No color vision
        greenClass = 'bg-white'; // White
        redClass = 'bg-gray-600'; // Dark gray
        yellowClass = 'bg-gray-300'; // Light gray
        break;
      default:
        // Use standard colors
        break;
    }
    
    switch (label) {
      case 'Зелёный': return greenClass;
      case 'Красный': return redClass;
      case 'Жёлтый': return yellowClass;
      default: return 'bg-black';
    }
  };

  return (
    <div 
      className={`w-full h-full ${getBackgroundColor()} text-white flex flex-col items-center justify-center p-4 cursor-pointer transition-colors duration-300`} 
      onClick={onToggleAI}
    >
      {isAiActive ? (
        serverStatus === 'connected' ? (
          <>
            <div className="font-mono text-4xl text-center mb-2 truncate max-w-full">
              {label}
            </div>
            <div className="font-mono text-4xl text-center text-blue-400">
              {formattedConfidence}
            </div>
          </>
        ) : serverStatus === 'checking' ? (
          <div className="font-mono text-3xl text-center text-yellow-400">
            Подключение...
          </div>
        ) : (
          <div className="font-mono text-3xl text-center text-red-400">
            Ошибка
          </div>
        )
      ) : serverAddress && serverAddress.length > 0 ? (
        <div className="font-mono text-3xl text-center text-gray-400">
          Нажмите для запуска
        </div>
      ) : (
        <div className="font-mono text-3xl text-center text-yellow-400">
          Настройте сервер
        </div>
      )}
    </div>
  );
};

export default ResultPanel;