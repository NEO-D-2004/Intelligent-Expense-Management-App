import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface DraggableFABProps {
  onClick: () => void;
}

export function DraggableFAB({ onClick }: DraggableFABProps) {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('fab_position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic bounds check for saved position
        const x = Math.min(Math.max(20, parsed.x), window.innerWidth - 80);
        const y = Math.min(Math.max(20, parsed.y), window.innerHeight - 80);
        return { x, y };
      } catch (e) {
        console.error('Failed to parse fab position', e);
      }
    }
    // Default: Bottom Right
    return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setHasMoved(false);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasMoved(true);
    }

    const newX = Math.min(Math.max(10, dragRef.current.initialX + deltaX), window.innerWidth - 70);
    const newY = Math.min(Math.max(10, dragRef.current.initialY + deltaY), window.innerHeight - 70);

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('fab_position', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
      const onMouseUp = () => handleEnd();
      const onTouchEnd = () => handleEnd();

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [isDragging, position]);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasMoved) {
      onClick();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 100,
        touchAction: 'none',
      }}
      className={`transition-shadow ${isDragging ? 'scale-110 shadow-2xl' : 'scale-100 shadow-lg'}`}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
    >
      <Button
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-0 border-none flex items-center justify-center pointer-events-auto"
        onClick={handleClick}
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
}
