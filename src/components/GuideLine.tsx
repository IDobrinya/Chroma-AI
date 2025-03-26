import React, { useState, useEffect, useRef } from 'react';

interface GuideLineProps {
  initialPosition: number;
  onPositionChange: (position: number) => void;
  minPosition?: number;
  maxPosition?: number;
}

const GuideLine: React.FC<GuideLineProps> = ({ 
  initialPosition, 
  onPositionChange,
  minPosition = 40,  // Minimum position from top (in percentage)
  maxPosition = 80   // Maximum position from top (in percentage)
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const guideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse/touch move events
  const handleMove = (clientY: number) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;
      
      // Calculate percentage position based on pointer position
      const relativeY = clientY - containerRect.top;
      let newPercentage = (relativeY / containerHeight) * 100;
      
      // Apply constraints
      newPercentage = Math.max(minPosition, Math.min(maxPosition, newPercentage));
      
      setPosition(newPercentage);
      onPositionChange(newPercentage);
    }
  };

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientY);
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
  }, [isDragging]);

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientY);
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
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full pointer-events-none">
      <div 
        ref={guideRef}
        className="absolute w-full h-1 bg-blue-500 cursor-ns-resize pointer-events-auto"
        style={{ top: `${position}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Handle for dragging - makes it easier to grab */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full" />
      </div>
    </div>
  );
};

export default GuideLine;