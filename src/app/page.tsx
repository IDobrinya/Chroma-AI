'use client';

import React, {useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import NavigationView from '../components/NavigationView';
import GuideLine from '../components/GuideLine';
import CameraView from '../components/CameraView';
import ResultPanel from '../components/ResultPanel';
import {useRouter} from 'next/navigation';
import {useAuth, UserButton} from '@clerk/nextjs';
import { setCookie, getCookie } from '@/utils/cookies';

// Vision modes
type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

// Server connection status
type ServerStatus = 'connected' | 'disconnected' | 'checking';

// User settings interface
interface UserSettings {
  serverAddress: string;
  visionMode: VisionMode;
}

export default function Home() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isActive, setActive] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(70);
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverAddress, setServerAddress] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('disconnected');
  const socketRef = useRef<Socket | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [detectedObject, setDetectedObject] = useState<{ label: string; confidence: number }>({
    label: 'No detection',
    confidence: 0
  });
  // Removed auth message state as it's no longer needed
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Redirect to sign-in page if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);
  
  // Load user settings from cookies on initial load
  useEffect(() => {
    if (isSignedIn && isInitialLoad) {
      const savedSettings = getCookie('userSettings');
      
      if (savedSettings) {
        try {
          const settings: UserSettings = JSON.parse(savedSettings);
          
          // Apply saved settings
          if (settings.serverAddress) {
            setServerAddress(settings.serverAddress);
          }
          
          if (settings.visionMode) {
            setVisionMode(settings.visionMode);
          }
          
          // Don't auto-authenticate
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }

      setIsInitialLoad(false);
    }
  }, [isSignedIn, isInitialLoad]);
  
  // Save user settings to cookies when they change
  useEffect(() => {
    if (isSignedIn && !isInitialLoad) {
      const settings: UserSettings = {
        serverAddress,
        visionMode
      };
      
      setCookie('userSettings', JSON.stringify(settings));
    }
  }, [serverAddress, visionMode, isSignedIn, isInitialLoad]);
  
  // Auto-close navigation drawer when server connects successfully
  useEffect(() => {
    if (serverStatus === 'connected') {
      setIsNavOpen(false);
    }
  }, [serverStatus]);

  // Connect to socket server when server address changes or when AI is activated
  useEffect(() => {
    const connectToServer = async () => {
      if (!serverAddress || !isActive) {
        return;
      }

      try {
        setServerStatus('checking');
        
        // Close existing connection
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        
        // Get auth token 
        const token = await getToken();
        
        if (!token) {
          console.error('Authentication token not available');
          setServerStatus('disconnected');
          return;
        }

        try {
          // Perform authorization check instead of health check
          const response = await fetch(`${serverAddress}/Auth`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Ошибка авторизации: ${response.status}`);
          }
        } catch (error) {
          console.error('Authorization failed:', error);
          setServerStatus('disconnected');
          return;
        }
        
        const socket = io(serverAddress, {
          extraHeaders: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        socket.on('connect', () => {
          setServerStatus('connected');
          console.log('Connected to socket server');
        });
        
        socket.on('disconnect', () => {
          setServerStatus('disconnected');
          console.log('Disconnected from socket server');
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setServerStatus('disconnected');
        });
        
        socketRef.current = socket;
      } catch (error) {
        console.error('Error setting up socket connection:', error);
        setServerStatus('disconnected');
      }
    };
    
    void connectToServer();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverAddress, isActive, getToken]);

  // Toggle the navigation drawer
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  
  // Toggle the AI processing
  const toggleAI = () => {
    setActive(!isActive);
    
    if (!isActive && serverStatus === 'disconnected') {
      setIsNavOpen(true);
    }
  };

  // Handle server address change
  const handleServerAddressChange = (address: string) => {
    setServerAddress(address);
    
    // Save in settings cookie
    const settings: UserSettings = {
      serverAddress: address,
      visionMode
    };
    setCookie('userSettings', JSON.stringify(settings));
    
    // Don't activate AI automatically
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
    
    // Save in settings cookie
    const settings: UserSettings = {
      serverAddress,
      visionMode: mode
    };
    setCookie('userSettings', JSON.stringify(settings));
  };
  
  // Define the type for server response data
  interface DetectionItem extends Array<number> {
    0: number; // x1
    1: number; // y1
    2: number; // x2
    3: number; // y2
    4: number; // confidence
    5: number; // label (0, 1, 2)
  }

  // Handle socket result from server
  const handleSocketResult = (data: DetectionItem[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setDetectedObject({
        label: 'No detection',
        confidence: 0
      });
      setOverlayImage(null);
      return;
    }
    
    try {
      const firstItem = data[0];
      const label = firstItem[5];
      const confidence = firstItem[4];
      
      const labelText = ['GREEN', 'RED', 'YELLOW'][Math.floor(label)] || 'UNKNOWN';
      
      setDetectedObject({
        label: labelText,
        confidence: confidence
      });
      
      createOverlayImage(data);
    } catch (error) {
      console.error('Error processing result data:', error);
      setDetectedObject({
        label: 'Error',
        confidence: 0
      });
      setOverlayImage(null);
    }
  };
  
  // Create canvas overlay for bounding boxes
  const createOverlayImage = (data: DetectionItem[]) => {
    if (!data || data.length === 0) {
      setOverlayImage(null);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const width = window.innerWidth;
    const height = Math.floor(window.innerHeight * (guideLinePosition / 100));
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    const widthCoef = width / 640;
    const heightCoef = height / 640;
    
    data.forEach(item => {
      if (Array.isArray(item) && item.length === 6) {
        const x1 = item[0] * widthCoef;
        const y1 = item[1] * heightCoef;
        const x2 = item[2] * widthCoef;
        const y2 = item[3] * heightCoef;
        const label = item[5];
        
        const colors = ['green', 'red', 'yellow'];

        ctx.strokeStyle = colors[Math.floor(label)] || 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
    });
    
    const dataUrl = canvas.toDataURL('image/png');
    setOverlayImage(dataUrl);
  };
  
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
          serverAddress={serverAddress}
          onServerAddressChange={handleServerAddressChange}
          serverStatus={serverStatus}
        />

        {/* Camera view component */}
        <CameraView
          isActive={isActive}
          socket={isActive ? socketRef.current : null}
          onResult={handleSocketResult}
          serverStatus={serverStatus}
        />
        
        {/* Overlay for bounding boxes */}
        {overlayImage && (
          <div className="absolute inset-0 pointer-events-none z-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={overlayImage} 
              alt="Detection overlay" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

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
            className="bg-gray-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
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
          <div className="w-10 h-10 flex items-center justify-center">
            <UserButton />
          </div>
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
          isAiActive={isActive}
          onToggleAI={toggleAI}
          serverStatus={serverStatus}
          serverAddress={serverAddress}
        />
      </div>
    </div>
  );
}