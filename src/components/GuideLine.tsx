import React, { useState, useEffect, useRef } from 'react';
import type { Orientation } from '@/hooks/useOrientation';

interface GuideLineProps {
  initialPosition: number;
  onPositionChange: (position: number) => void;
  orientation: Orientation;
  minPosition?: number;
  maxPosition?: number;
}

const GuideLine: React.FC<GuideLineProps> = ({ 
  initialPosition, 
  onPositionChange,
  orientation,
  minPosition = 15,
  maxPosition = 33
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const guideRef = useRef<HTMLDivElement>(null);

  // Handle mouse/touch move events
  const handleMove = (clientX: number, clientY: number) => {
    const size = orientation === 'portrait' ? window.innerHeight : window.innerWidth;
    const coord = orientation === 'portrait' ? clientY : clientX;
    let newPercentage = (coord / size) * 100;
    
    const actualMinPosition = 100 - maxPosition;
    const actualMaxPosition = 100 - minPosition;
    
    newPercentage = Math.max(actualMinPosition, Math.min(actualMaxPosition, newPercentage));
    
    setPosition(newPercentage);
    onPositionChange(newPercentage);
  };

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, orientation]);

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, orientation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const style = orientation === 'portrait'
    ? { top: `${position}%`, left: 0, right: 0, height: 2 }
    : { left: `${position}%`, top: 0, bottom: 0, width: 2 };

  const cursorClass = orientation === 'portrait' ? 'cursor-ns-resize' : 'cursor-ew-resize';

  return (
    <div 
      ref={guideRef}
      className={`absolute bg-blue-500 ${cursorClass} touch-none z-50 pointer-events-auto`}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Handle for dragging - makes it easier to grab */}
      <div className={`absolute w-8 h-8 bg-blue-600 rounded-full ${
        orientation === 'portrait' 
          ? 'left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
          : 'top-1/2 transform -translate-x-1/2 -translate-y-1/2'
      }`} />
    </div>
  );
};

export default GuideLine;