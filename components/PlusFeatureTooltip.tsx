import React, { useState } from 'react';
import { PlusFeatureIcon } from './icons';
import { Page } from '../types';

interface PlusFeatureTooltipProps {
  setActivePage: (page: Page) => void;
}

const PlusFeatureTooltip: React.FC<PlusFeatureTooltipProps> = ({ setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(prev => !prev);
  };

  return (
    <div 
      className="relative flex items-center" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <button onClick={handleClick} className="flex items-center justify-center p-0 bg-transparent border-none" aria-label="View Plus Feature information">
        <PlusFeatureIcon className="w-5 h-5 text-accent" />
      </button>
      
      {isOpen && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border z-10 p-4 transform animate-fade-in-up"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} 
        >
          <h4 className="font-bold text-md flex items-center gap-2">
            <PlusFeatureIcon className="w-5 h-5 text-accent"/>
            Plus Feature
          </h4>
          <p className="text-sm text-muted-foreground my-2">
            This is a premium feature. Unlock powerful AI capabilities by upgrading your plan.
          </p>
          <button 
            onClick={() => setActivePage(Page.Upgrade)}
            className="w-full mt-2 px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-md text-sm hover:bg-accent/90"
          >
            Upgrade Now
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-popover"></div>
           <style>{`
                @keyframes fade-in-up {
                0% {
                    opacity: 0;
                    transform: translateY(10px) translateX(-50%);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) translateX(-50%);
                }
                }
                .animate-fade-in-up {
                animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
      )}
    </div>
  );
};

export default PlusFeatureTooltip;
