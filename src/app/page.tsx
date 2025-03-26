'use client';

import React, { useState, useRef, useEffect } from 'react';
import NavigationView from '../components/NavigationView';
import GuideLine from '../components/GuideLine';

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(70); // Initial position at 70%
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Function to toggle camera
  const toggleCamera = async () => {
    try {
      if (!cameraActive && videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setCameraActive(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Start camera when AI is activated
  useEffect(() => {
    if (isAiActive && !cameraActive) {
      toggleCamera();
    } else if (!isAiActive && cameraActive) {
      toggleCamera();
    }
  }, [isAiActive, cameraActive]);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top section with camera/image */}
      <div 
        className="relative flex-grow overflow-hidden"
        style={{ height: `${guideLinePosition}%` }}
      >
        {/* Navigation drawer overlay */}
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
        />

        {/* Video preview */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Image overlay */}
        <div className="absolute inset-0 z-0 bg-transparent">
          {/* This div would hold any image processing overlay */}
        </div>

        {/* Bottom controls for top section */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2">
          {/* Settings button */}
          <button 
            className="bg-gray-800 text-white text-xs px-3 py-1 rounded"
            onClick={() => setIsNavOpen(true)}
          >
            Settings
          </button>

          {/* Slider area */}
          <div className="flex-grow mx-16 h-6">
            <div className="bg-gray-700 h-full rounded-full mx-4"></div>
          </div>

          {/* Live button */}
          <button 
            className={`px-3 py-1 rounded text-xs ${isAiActive ? 'bg-green-600' : 'bg-red-600'} text-white`}
            onClick={() => setIsAiActive(!isAiActive)}
          >
            {isAiActive ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Guide line */}
      <div className="absolute inset-0 pointer-events-none">
        <GuideLine 
          initialPosition={guideLinePosition} 
          onPositionChange={setGuideLinePosition}
          minPosition={40}
          maxPosition={80}
        />
      </div>

      {/* Bottom section with text */}
      <div 
        className="bg-black text-white flex flex-col items-center justify-center"
        style={{ height: `${100 - guideLinePosition}%` }}
      >
        <div className="text-4xl font-mono text-center">Label</div>
        <div className="text-4xl font-mono text-center">Confidence</div>
      </div>
    </div>
  );
}