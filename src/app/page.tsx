'use client';

import React, { useState, useEffect } from 'react';
import NavigationView from '../components/NavigationView';
import GuideLine from '../components/GuideLine';
import CameraView from '../components/CameraView';
import ResultPanel from '../components/ResultPanel';
import { useRouter } from 'next/navigation'
import { useAuth, UserButton } from '@clerk/nextjs';

// Vision modes from settings.xml
type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

export default function Home() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(70);
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectedObject, setDetectedObject] = useState<{ label: string; confidence: number }>({
    label: 'No detection',
    confidence: 0
  });

  // Redirect to sign-in page if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn]);

  // Toggle the navigation drawer
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  
  // Toggle the AI processing
  const toggleAI = () => {
    setIsAiActive(!isAiActive);
  };

  // Enter fullscreen mode
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    }
  };

  // Check fullscreen status on mount and exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
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

        {/* Settings button - positioned at the top left with animation */}
        <div className={`absolute top-2 left-2 z-40 transition-transform duration-300 ${isNavOpen ? 'translate-x-64 rotate-90' : ''}`}>
          <button
            className="bg-gray-800 text-white p-2 rounded-full flex items-center justify-center"
            onClick={toggleNav}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        {/* User button - positioned at the top right */}
        <div className="absolute top-2 right-2 z-40">
          <UserButton/>
        </div>

        {/* Fullscreen prompt */}
        {!isFullscreen && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-black bg-opacity-70 p-2 rounded">
            <button
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center"
              onClick={enterFullscreen}
            >
              <span>Полноэкранный режим</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path>
              </svg>
            </button>
          </div>
        )}
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
          isAiActive={isAiActive}
          onToggleAI={toggleAI}
        />
      </div>
    </div>
  );
}