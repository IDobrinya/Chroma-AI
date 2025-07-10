import React, { useRef, useEffect, useState } from 'react';

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
  socket?: WebSocket | null;
  onResult?: (result: DetectionItem[]) => void;
  serverStatus?: 'connected' | 'disconnected' | 'checking' | 'error';
}

const CameraView: React.FC<CameraViewProps> = ({
  isActive,
  onImageCapture,
  socket,
  onResult,
  serverStatus = 'disconnected'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureInterval, setCaptureInterval] = useState<number>(250);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  // Function to capture current frame and send it via WebSocket
  const captureFrame = React.useCallback(() => {
    if (!videoRef.current || !isActive) return;
    if (serverStatus !== 'connected' && socket) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (socket && socket.readyState === WebSocket.OPEN && serverStatus === 'connected') {
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result instanceof ArrayBuffer) {
                socket.send(new Uint8Array(reader.result));
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

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(() => {
      captureFrame();
    }, captureInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, stream, socket, captureFrame, serverStatus, captureInterval]);

  // Listen for WebSocket responses from the server
  useEffect(() => {
    if (!socket || !onResult) return;

    const handleSocketResult = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if this is an interval control message
        if (data.type === 'set_interval' && typeof data.interval === 'number') {
          const newInterval = Math.max(50, Math.min(1000, data.interval));
          setCaptureInterval(newInterval);
          console.log(`Capture interval set to ${newInterval}ms`);
          return;
        }
        
        // Handle regular detection results
        onResult(data);
      } catch (error) {
        console.error('Error parsing socket result:', error);
      }
    };

    socket.addEventListener('message', handleSocketResult);

    return () => {
      socket.removeEventListener('message', handleSocketResult);
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
