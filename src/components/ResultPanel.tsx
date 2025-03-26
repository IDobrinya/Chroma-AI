import React from 'react';

interface ResultPanelProps {
  label?: string;
  confidence?: number;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  label = 'No object detected', 
  confidence = 0 
}) => {
  // Format confidence as percentage
  const formattedConfidence = `${Math.round(confidence * 100)}%`;
  
  return (
    <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="font-mono text-4xl text-center mb-2 truncate max-w-full">
        {label}
      </div>
      <div className="font-mono text-4xl text-center text-blue-400">
        {formattedConfidence}
      </div>
    </div>
  );
};

export default ResultPanel;