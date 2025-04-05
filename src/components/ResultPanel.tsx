import React from 'react';

interface ResultPanelProps {
  label?: string;
  confidence?: number;
  isAiActive?: boolean;
  onToggleAI?: () => void;
  serverStatus?: 'connected' | 'disconnected' | 'checking' | 'error';
  serverAddress?: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  label = 'No object detected', 
  confidence = 0,
  isAiActive = false,
  onToggleAI,
  serverStatus = 'disconnected',
  serverAddress = ''
}) => {
  // Format confidence as percentage
  const formattedConfidence = `${Math.round(confidence * 100)}%`;
  
  // Get background color based on label or status
  const getBackgroundColor = () => {
    if (!isAiActive) return 'bg-black';
    
    if (serverStatus === 'disconnected') {
      return 'bg-red-900';
    }
    
    switch (label) {
      case 'Зелёный': return 'bg-green-700';
      case 'Красный': return 'bg-red-700';
      case 'Жёлтый': return 'bg-yellow-600';
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