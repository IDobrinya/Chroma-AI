import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  isActive: boolean;
  onImageCapture?: (imageData: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ isActive, onImageCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      try {
        if (isActive && videoRef.current) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
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
    
    if (isActive) {
      setupCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive]);
  
  // Function to capture current frame
  const captureFrame = () => {
    if (videoRef.current && onImageCapture) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        onImageCapture(imageData);
      }
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {isActive ? (
        <>
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
        </>
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center text-white">
          <p>Camera inactive</p>
        </div>
      )}
    </div>
  );
};

export default CameraView;