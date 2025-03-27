'use client';

import React, { useState, useEffect } from 'react';
import NavigationView from '../components/NavigationView';
import GuideLine from '../components/GuideLine';
import CameraView from '../components/CameraView';
import ResultPanel from '../components/ResultPanel';

// Vision modes from settings.xml
type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

export default function Home() {
  // State
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(70); // Initial position at 70%
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [detectedObject, setDetectedObject] = useState<{ label: string; confidence: number }>({
    label: 'No detection',
    confidence: 0
  });
  
  // Toggle the navigation drawer
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  
  // Toggle the AI processing
  const toggleAI = () => {
    setIsAiActive(!isAiActive);
  };
  
  // Handle vision mode change
  const handleVisionModeChange = (mode: VisionMode) => {
    setVisionMode(mode);
    setIsNavOpen(false); // Close the nav drawer after selection
  };
  
  // Handle image capture from camera
  const handleImageCapture = (imageData: string) => {
    // This would normally send the image to an AI service
    // For now, we'll just simulate a detection
    
    // Simulate processing delay
    setTimeout(() => {
      const mockObjects = [
        { label: 'Person', confidence: 0.95 },
        { label: 'Cat', confidence: 0.87 },
        { label: 'Dog', confidence: 0.92 },
        { label: 'Car', confidence: 0.88 },
        { label: 'Tree', confidence: 0.78 }
      ];
      
      const randomIndex = Math.floor(Math.random() * mockObjects.length);
      setDetectedObject(mockObjects[randomIndex]);
    }, 500);
  };
  
  // We no longer need this effect as the CameraView component now handles 
  // the frame capture interval when isActive is true
  
  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Top section with camera/image */}
      <div 
        className="relative flex-grow overflow-hidden"
        style={{ height: `${guideLinePosition}%` }}
      >
        {/* Navigation drawer overlay - closes drawer when clicking outside */}
        {isNavOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsNavOpen(false)}
          />
        )}

        {/* Navigation view */}
        <NavigationView 
          isOpen={isNavOpen} 
          onClose={() => setIsNavOpen(false)} 
          onModeSelect={handleVisionModeChange}
          currentMode={visionMode}
        />

        {/* Camera view component */}
        <CameraView 
          isActive={isAiActive} 
          onImageCapture={handleImageCapture} 
        />

        {/* Image overlay for vision modes */}
        {visionMode !== 'normal' && (
          <div 
            className="absolute inset-0 z-5 mix-blend-multiply pointer-events-none"
            style={{
              filter: 
                visionMode === 'protanomaly' ? 'saturate(0.8) sepia(0.2) hue-rotate(-10deg)' :
                visionMode === 'deuteranomaly' ? 'saturate(0.8) sepia(0.2) hue-rotate(10deg)' :
                visionMode === 'tritanomaly' ? 'saturate(0.7) sepia(0.2) hue-rotate(60deg)' :
                visionMode === 'achromatopsia' ? 'grayscale(1)' : 'none',
              backgroundColor: 
                visionMode === 'protanomaly' ? 'rgba(255, 230, 230, 0.3)' :
                visionMode === 'deuteranomaly' ? 'rgba(230, 255, 230, 0.3)' :
                visionMode === 'tritanomaly' ? 'rgba(230, 230, 255, 0.3)' :
                visionMode === 'achromatopsia' ? 'rgba(220, 220, 220, 0.2)' : 'transparent'
            }}
          />
        )}

        {/* Bottom controls for top section */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 z-20">
          {/* Settings button */}
          <button 
            className="bg-gray-800 text-white text-xs px-3 py-1 rounded"
            onClick={toggleNav}
          >
            Settings
          </button>

          {/* Live button */}
          <button 
            className={`px-3 py-1 rounded text-xs ${isAiActive ? 'bg-green-600' : 'bg-red-600'} text-white`}
            onClick={toggleAI}
          >
            {isAiActive ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Guide line */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <GuideLine 
          initialPosition={guideLinePosition} 
          onPositionChange={setGuideLinePosition}
          minPosition={40}
          maxPosition={80}
        />
      </div>

      {/* Bottom section with results */}
      <div 
        className="bg-black z-30"
        style={{ height: `${100 - guideLinePosition}%` }}
      >
        <ResultPanel
          label={detectedObject.label}
          confidence={detectedObject.confidence}
        />
      </div>
    </div>
  );
}