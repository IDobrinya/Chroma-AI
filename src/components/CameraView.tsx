import React, { useRef, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

// Define the type for server response data
interface DetectionItem extends Array<number> {
  0: number; // x1
  1: number; // y1
  2: number; // x2
  3: number; // y2
  4: number; // confidence
  5: number; // label (0, 1, 2)
}

interface CameraViewProps {
  isActive: boolean;
  onImageCapture?: (imageData: string) => void;
  socket?: Socket | null;
  onResult?: (result: DetectionItem[]) => void;
  serverStatus?: 'connected' | 'disconnected' | 'checking';
}

const CameraView: React.FC<CameraViewProps> = ({ isActive, onImageCapture, socket, onResult, serverStatus = 'disconnected' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Initialize camera stream once on component mount
  useEffect(() => {
    const setupCamera = async () => {
      try {
        if (videoRef.current && !stream) {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            setStream(newStream);
            setHasPermission(true);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasPermission(false);
        setError('Camera access denied or not available');
      }
    };
    
    void setupCamera();
    
    return () => {
      // Store a reference to the current video element and stream
      const currentVideo = videoRef.current;
      const currentStream = stream;
      
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
    };
  }, []);

  // Function to capture current frame
  const captureFrame = React.useCallback(() => {
    if (!videoRef.current || !isActive) return;
    if (serverStatus !== 'connected' && socket) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (socket && socket.connected && serverStatus === 'connected') {
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result instanceof ArrayBuffer) {
                socket.emit('frame', new Uint8Array(reader.result));
              }
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.6);
      } else if (onImageCapture) {
        const imageData = canvas.toDataURL('image/jpeg', 0.6);
        onImageCapture(imageData);
      }
    }
  }, [socket, onImageCapture, isActive, serverStatus]);

  // Set up capture interval when isActive changes
  useEffect(() => {
    if (!isActive || !stream) return;
    if (socket && serverStatus !== 'connected') return;
    
    const captureInterval = setInterval(() => {
      captureFrame();
    }, 250);
    
    return () => {
      clearInterval(captureInterval);
    };
  }, [isActive, stream, socket, captureFrame, serverStatus]);

  // Listen for socket responses
  useEffect(() => {
    if (!socket || !onResult) return;
    
    const handleSocketResult = (data: DetectionItem[]) => {
      onResult(data);
    };
    
    socket.on('result', handleSocketResult);
    
    return () => {
      socket.off('result', handleSocketResult);
    };
  }, [socket, onResult]);
  
  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        className="w-full h-full object-cover"
        onLoadedMetadata={() => {
          if (videoRef.current) videoRef.current.play();
        }}
      />
      
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white text-center p-4">
          <div>
            <p className="text-lg font-bold mb-2">Camera Access Required</p>
            <p>{error || 'Please allow camera access to use this feature.'}</p>
          </div>
        </div>
      )}
      
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <p>Initializing camera...</p>
        </div>
      )}
      
      {isActive && stream && (
        <div className="absolute top-4 right-4">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default CameraView;