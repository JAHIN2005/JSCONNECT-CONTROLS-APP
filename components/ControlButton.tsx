
import React, { ReactNode } from 'react';

interface ControlButtonProps {
  onAction: () => void;
  onRelease: () => void;
  children: ReactNode;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onAction, onRelease, children, className = '' }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAction();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRelease();
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRelease();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAction();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRelease();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`bg-gray-700 text-white rounded-lg flex items-center justify-center 
                  select-none cursor-pointer transform transition-transform 
                  active:bg-blue-500 active:scale-95 focus:outline-none 
                  ${className}`}
    >
      {children}
    </button>
  );
};

export default ControlButton;
