'use client';

import React, { useEffect, useRef, useState } from 'react';
import NavigationView from '../components/NavigationView';
import GuideLine from '../components/GuideLine';
import CameraView from '../components/CameraView';
import ResultPanel from '../components/ResultPanel';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';
import { setCookie } from '@/utils/cookies';
import { serverRegistryAPI } from '@/utils/serverRegistry';
import { useOrientation } from '@/hooks/useOrientation';

// Vision modes
type VisionMode = 'normal' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia';

// Server connection status
type ServerStatus = 'connected' | 'disconnected' | 'checking' | 'error';

// Token status for navigationView
type TokenStatus = 'valid' | 'invalid' | 'not_set';

// User settings interface
interface UserSettings {
  serverToken: string;
  visionMode: VisionMode;
}

export default function Home() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isActive, setActive] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(67);
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverToken, setServerToken] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('not_set');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('disconnected');
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);
  const manualDisconnectRef = useRef<boolean>(false);
  const attemptRef = useRef<number>(0);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [detectedObject, setDetectedObject] = useState<{ label: string; confidence: number }>({
    label: 'Ничего',
    confidence: 0
  });

  useEffect(() => {
    if (isSignedIn === false) {
      router.push('/sign-in');
      return;
    }
    if (isSignedIn === undefined) {
      return;
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const registerUser = async () => {
      if (isSignedIn && userId) {
        try {
          const result = await serverRegistryAPI.createUser(userId);
          if (!result.success) {
            console.warn('User registration failed:', result.message);
          }
        } catch (error) {
          console.error('Error during user registration:', error);
        }
      }
    };

    registerUser().then(() => null);
  }, [isSignedIn, userId]);

  // Save user settings to cookies when they change
  useEffect(() => {
    if (isSignedIn) {
      const settings: UserSettings = {
        serverToken,
        visionMode
      };
      setCookie('userSettings', JSON.stringify(settings));
    }
  }, [serverToken, visionMode, isSignedIn]);

  // Connect to WebSocket server when server token changes or when AI is activated
  useEffect(() => {
    const connectToServer = async () => {
      if (!serverToken || !isActive || !userId) {
        return;
      }

      try {
        setServerStatus('checking');
        attemptRef.current += 1;
        const currentAttempt = attemptRef.current;

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        try {
          const server_info = await serverRegistryAPI.getUserServer(userId);

          if (server_info.success && server_info.data) {
            const serverUrl = server_info.data.bridge_url
            const ws = new WebSocket(serverUrl);

            ws.onmessage = (event) => {
              const msg = JSON.parse(event.data);
              if (msg.status && msg.status !== 'success') {
                console.error('Authorization failed:', msg.message);
                ws.close();
                setServerStatus('error');
              } else if (msg.status && msg.status === 'success') {
                setServerStatus('connected');
              } else {
                handleSocketResult(msg);
              }
            };

            ws.onclose = () => {
              if (currentAttempt === attemptRef.current && !manualDisconnectRef.current) {
                console.error('WebSocket closed unexpectedly');
                setServerStatus('error');
              }
              setDetectedObject({ label: 'Ничего', confidence: 0 });
              setOverlayImage(null);
              manualDisconnectRef.current = false;
            };

            ws.onerror = (error) => {
              console.error('WebSocket error:', error);
              setServerStatus('error');
            };

            wsRef.current = ws;
          }
        } catch (error) {
          console.error('Error setting up WebSocket connection:', error);
          setServerStatus('error');
        }
      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
        setServerStatus('error');
      }
    };

    void connectToServer();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [serverToken, isActive]);

  useEffect(() => {
    setServerStatus('disconnected');
  }, [serverToken]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleAI = () => {
    if (!isActive) {
      if (serverToken && serverToken.trim() !== '') {
        setServerStatus('checking');
        setActive(true);
      } else {
        toggleNav()
      }
    } else {
      manualDisconnectRef.current = true;
      setDetectedObject({ label: 'Ничего', confidence: 0 });
      setOverlayImage(null);
      setActive(false);
    }
  };

  const handleServerTokenChange = async (token: string) => {
    if (!userId) {
      console.error('User not authenticated');
      setServerToken("");
      setTokenStatus('invalid');
      return;
    }

    if (!token || token.trim() === '') {
      setServerToken("");
      setTokenStatus('not_set');
      return;
    }

    try {
      const result = await serverRegistryAPI.linkServer(userId, token);
      if (result.success) {
        const serverInfo = await serverRegistryAPI.getUserServer(userId);
        if (serverInfo.success && serverInfo.data) {
          setServerToken(token);
          const settings: UserSettings = {
            serverToken: token,
            visionMode
          };
          setCookie('userSettings', JSON.stringify(settings));
          setTokenStatus('valid');
          return;
        }
      }
      console.error('Failed to link server or get server info');
      setServerToken("");
      setTokenStatus('invalid');
    } catch (error) {
      console.error('Error linking server:', error);
      setServerToken("");
      setTokenStatus('invalid');
    }
  };

  const handleDisconnect = async () => {
    manualDisconnectRef.current = true;
    setServerToken("");
    setTokenStatus('not_set');
    setDetectedObject({ label: 'Ничего', confidence: 0 });
    setOverlayImage(null);
    setActive(false);
    setServerStatus('disconnected');

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (userId && serverToken) {
      await serverRegistryAPI.unlinkServer(userId)
    }

    // Clear settings
    const settings: UserSettings = {
      serverToken: '',
      visionMode
    };
    setCookie('userSettings', JSON.stringify(settings));
  };

  // Enter fullscreen mode
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    }
  };

  // Toggle controls visibility
  const toggleControlsVisibility = () => {
    setAreControlsVisible(!areControlsVisible);
  };

  // Open navbar if connection fails
  useEffect(() => {
    if (serverStatus === 'error') {
      setIsNavOpen(true);
    }
  }, [serverStatus]);

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
    const settings: UserSettings = {
      serverToken,
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

  // Handle WebSocket result from server
  const handleSocketResult = (data: DetectionItem[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setDetectedObject({
        label: 'Ничего',
        confidence: 0
      });
      setOverlayImage(null);
      return;
    }
    try {
      const firstItem = data[0];
      const label = firstItem[5];
      const confidence = firstItem[4];
      const labelText = ['Зелёный', 'Красный', 'Жёлтый'][Math.floor(label)] || 'UNKNOWN';
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

  // Define colorblind-friendly color sets for different vision modes
  const getColorScheme = (mode: VisionMode) => {
    // Each array contains colors for [green, red, yellow] in order
    switch(mode) {
      case 'protanomaly': // Red-weak, enhance distinction between red and green
        return ['#00DDDD', '#FFAAAA', '#EEEE00'];
      case 'deuteranomaly': // Green-weak, enhance distinction
        return ['#0088FF', '#FF5555', '#EEEE00'];
      case 'tritanomaly': // Blue-yellow weakness
        return ['#00DD88', '#FF4444', '#FFFFFF'];
      case 'achromatopsia': // No color perception (monochromacy)
        return ['#FFFFFF', '#666666', '#BBBBBB'];
      case 'normal':
      default:
        return ['green', 'red', 'yellow'];
    }
  };

  // Create canvas overlay for bounding boxes
  const createOverlayImage = (data: DetectionItem[]) => {
    if (!data || data.length === 0) {
      setOverlayImage(null);
      return;
    }
    const canvas = document.createElement('canvas');
    
    // Calculate dimensions based on orientation
    const width = isLandscape
      ? Math.floor(window.innerWidth * (guideLinePosition / 100))
      : window.innerWidth;
    const height = isLandscape
      ? window.innerHeight
      : Math.floor(window.innerHeight * (guideLinePosition / 100));
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const widthCoef = width / 640;
    const heightCoef = height / 640;
    
    // Get appropriate color scheme based on current vision mode
    const colors = getColorScheme(visionMode);
    
    data.forEach(item => {
      if (Array.isArray(item) && item.length === 6) {
        const x1 = item[0] * widthCoef;
        const y1 = item[1] * heightCoef;
        const x2 = item[2] * widthCoef;
        const y2 = item[3] * heightCoef;
        const label = item[5];
        ctx.strokeStyle = colors[Math.floor(label)] || 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
    });
    const dataUrl = canvas.toDataURL('image/png');
    setOverlayImage(dataUrl);
  };

  return (
    <div className={`flex ${isLandscape ? 'flex-row' : 'flex-col'} h-screen bg-black overflow-hidden`}>
      {/* Main content section (camera/image) */}
      <div 
        className="relative flex-shrink-0 overflow-hidden"
        style={
          isLandscape
            ? { width: `${guideLinePosition}%` }
            : { height: `${guideLinePosition}%` }
        }
      >
        {/* Navigation view */}
        <NavigationView
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          onModeSelect={handleVisionModeChange}
          currentMode={visionMode}
          serverToken={serverToken}
          tokenStatus={tokenStatus}
          onServerTokenChange={handleServerTokenChange}
          onDisconnect={handleDisconnect}
        />

        {/* Camera view component */}
        <CameraView
          isActive={isActive}
          socket={wsRef.current}
          onResult={handleSocketResult}
          serverStatus={serverStatus}
        />

        {/* Clickable overlay to toggle controls visibility */}
        <div
          className="absolute inset-0 z-20"
          onClick={() => {
            if (isNavOpen) {
              toggleNav()
            } else {
              toggleControlsVisibility();
            }
          }}
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
                visionMode === 'protanomaly'
                  ? 'saturate(0.8) sepia(0.2) hue-rotate(-10deg)'
                  : visionMode === 'deuteranomaly'
                    ? 'saturate(0.8) sepia(0.2) hue-rotate(10deg)'
                    : visionMode === 'tritanomaly'
                      ? 'saturate(0.7) sepia(0.2) hue-rotate(60deg)'
                      : visionMode === 'achromatopsia'
                        ? 'grayscale(1)'
                        : 'none',
              backgroundColor:
                visionMode === 'protanomaly'
                  ? 'rgba(255, 230, 230, 0.3)'
                  : visionMode === 'deuteranomaly'
                    ? 'rgba(230, 255, 230, 0.3)'
                    : visionMode === 'tritanomaly'
                      ? 'rgba(230, 230, 255, 0.3)'
                      : visionMode === 'achromatopsia'
                        ? 'rgba(220, 220, 220, 0.2)'
                        : 'transparent'
            }}
          />
        )}

        {/* Settings button - positioned at the top left with animation */}
        <div
          className={`absolute top-2 left-2 z-40 transition-all duration-300 ${isNavOpen ? 'translate-x-64 rotate-90' : ''}`}
          style={{ opacity: areControlsVisible ? 1 : 0.1 }}
        >
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
        <div
          className="absolute top-2 right-2 z-40 transition-opacity duration-300"
          style={{ opacity: areControlsVisible ? 1 : 0.1 }}
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <UserButton />
          </div>
        </div>

        {/* Fullscreen prompt */}
        {!isFullscreen && (
          <div
            className="fixed top-2 left-1/2 transform -translate-x-1/2 z-40 bg-black bg-opacity-70 p-2 rounded transition-opacity duration-300"
            style={{ opacity: areControlsVisible ? 1 : 0.1 }}
          >
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

      {/* Guide line - spans across entire screen */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <GuideLine
          initialPosition={guideLinePosition}
          onPositionChange={setGuideLinePosition}
          orientation={orientation}
          minPosition={15}
          maxPosition={33}
        />
      </div>

      {/* Results section */}
      <div 
        className="bg-black flex-grow"
        style={
          isLandscape
            ? { width: `${100 - guideLinePosition}%` }
            : { height: `${100 - guideLinePosition}%` }
        }
      >
        <ResultPanel
          label={detectedObject.label}
          confidence={detectedObject.confidence}
          isAiActive={isActive}
          onToggleAI={toggleAI}
          serverStatus={serverStatus}
          serverToken={serverToken}
          visionMode={visionMode}
        />
      </div>
      )
    </div>
  );
}
