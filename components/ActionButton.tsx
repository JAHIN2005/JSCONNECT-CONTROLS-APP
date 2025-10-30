
import React, { ReactNode } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-700 text-white rounded-lg flex items-center justify-center 
                  select-none cursor-pointer transform transition-transform 
                  active:scale-95 focus:outline-none text-sm font-semibold
                  py-2 px-1
                  ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
