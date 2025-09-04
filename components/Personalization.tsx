import React from 'react';
import { Page, Theme, AccentColor } from '../types';
import { ChevronLeftIcon, PaletteIcon, SunIcon, CheckIcon, HapticIcon, LanguageIcon } from './icons';

interface PersonalizationProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  setActivePage: (page: Page) => void;
}

const colorOptions = [
    { name: AccentColor.Default, color: 'bg-gray-800 dark:bg-gray-200' },
    { name: AccentColor.Blue, color: 'bg-blue-500' },
    { name: AccentColor.Green, color: 'bg-green-500' },
    { name: AccentColor.Yellow, color: 'bg-yellow-500' },
    { name: AccentColor.Pink, color: 'bg-pink-500' },
    { name: AccentColor.Orange, color: 'bg-orange-500' },
];

const Personalization: React.FC<PersonalizationProps> = ({ theme, setTheme, accentColor, setAccentColor, setActivePage }) => {
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center">
            <button onClick={() => setActivePage(Page.Settings)} className="p-2 rounded-full hover:bg-surface-container">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-3xl font-bold ml-2">Personalization</h1>
        </div>
      
      <div className="rounded-xl overflow-hidden border border-outline-variant">
            <div className="p-4 border-b border-outline-variant">
                <div className="flex items-center">
                    <div className="text-on-surface-variant"><SunIcon className="w-6 h-6"/></div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-medium">Color Scheme</h3>
                        <p className="text-on-surface-variant text-sm capitalize">{theme} {theme === 'system' && '(Default)'}</p>
                    </div>
                </div>
                 <div className="flex items-center justify-center gap-2 mt-4 bg-surface-container p-1 rounded-full">
                    <button onClick={() => setTheme(Theme.System)} className={`flex-1 px-4 py-2 rounded-full text-sm transition-colors ${theme === Theme.System ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'hover:bg-surface-container-high'}`}>System</button>
                    <button onClick={() => setTheme(Theme.Light)} className={`flex-1 px-4 py-2 rounded-full text-sm transition-colors ${theme === Theme.Light ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'hover:bg-surface-container-high'}`}>Light</button>
                    <button onClick={() => setTheme(Theme.Dark)} className={`flex-1 px-4 py-2 rounded-full text-sm transition-colors ${theme === Theme.Dark ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'hover:bg-surface-container-high'}`}>Dark</button>
                </div>
            </div>

             <div className="p-4 border-b border-outline-variant">
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="flex items-center w-full mb-3 sm:mb-0">
                        <div className="text-on-surface-variant"><PaletteIcon className="w-6 h-6"/></div>
                        <div className="ml-4 flex-1">
                            <h3 className="font-medium">Accent Color</h3>
                            <p className="text-on-surface-variant text-sm capitalize">{accentColor}</p>
                        </div>
                    </div>
                     <div className="relative">
                        <div className="flex items-center flex-wrap gap-3">
                            {colorOptions.map(c => (
                                <button key={c.name} onClick={() => setAccentColor(c.name)} className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110`}>
                                    {accentColor === c.name && <CheckIcon className="w-5 h-5 text-white mix-blend-difference"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="p-4 border-b border-outline-variant h-16 flex items-center">
                <div className="text-on-surface-variant"><HapticIcon className="w-6 h-6"/></div>
                <div className="ml-4 flex-1">
                    <h3 className="font-medium">Haptic Feedback</h3>
                </div>
                {/* Placeholder for a toggle switch */}
            </div>

             <div className="p-4 h-16 flex items-center">
                <div className="text-on-surface-variant"><LanguageIcon className="w-6 h-6"/></div>
                <div className="ml-4 flex-1">
                    <h3 className="font-medium">Language</h3>
                     <p className="text-on-surface-variant text-sm">English</p>
                </div>
            </div>
      </div>
    </div>
  );
};

export default Personalization;