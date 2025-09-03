import React, { useState } from 'react';
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
    { name: AccentColor.Default, color: 'bg-gray-500' },
    { name: AccentColor.Blue, color: 'bg-blue-500' },
    { name: AccentColor.Green, color: 'bg-green-500' },
    { name: AccentColor.Yellow, color: 'bg-yellow-500' },
    { name: AccentColor.Pink, color: 'bg-pink-500' },
    { name: AccentColor.Orange, color: 'bg-orange-500' },
];

const Personalization: React.FC<PersonalizationProps> = ({ theme, setTheme, accentColor, setAccentColor, setActivePage }) => {
    const [isAccentPickerOpen, setIsAccentPickerOpen] = useState(false);

    const handleAccentSelect = (color: AccentColor) => {
        setAccentColor(color);
        setIsAccentPickerOpen(false);
    }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center">
            <button onClick={() => setActivePage(Page.Settings)} className="p-2 rounded-full hover:bg-muted">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-3xl font-bold ml-2">Personalization</h1>
        </div>
      
      <div className="border-y border-border">
            <div className="p-4 border-b border-border last:border-b-0">
                <div className="flex items-center">
                    <div className="text-muted-foreground"><SunIcon className="w-6 h-6"/></div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-medium">Color Scheme</h3>
                        <p className="text-muted-foreground text-sm capitalize">{theme} {theme === 'system' && '(Default)'}</p>
                    </div>
                </div>
                 <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={() => setTheme(Theme.System)} className={`px-4 py-2 rounded-md text-sm ${theme === Theme.System ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>System</button>
                    <button onClick={() => setTheme(Theme.Light)} className={`px-4 py-2 rounded-md text-sm ${theme === Theme.Light ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>Light</button>
                    <button onClick={() => setTheme(Theme.Dark)} className={`px-4 py-2 rounded-md text-sm ${theme === Theme.Dark ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>Dark</button>
                </div>
            </div>

             <div className="p-4 border-b border-border last:border-b-0">
                <div className="flex items-center">
                    <div className="text-muted-foreground"><PaletteIcon className="w-6 h-6"/></div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-medium">Accent Color</h3>
                        <p className="text-muted-foreground text-sm capitalize">{accentColor}</p>
                    </div>
                     <div className="relative">
                        <div className="flex items-center gap-2">
                            {colorOptions.map(c => (
                                <button key={c.name} onClick={() => handleAccentSelect(c.name)} className={`w-6 h-6 rounded-full ${c.color} flex items-center justify-center`}>
                                    {accentColor === c.name && <CheckIcon className="w-4 h-4 text-white"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="p-4 border-b border-border last:border-b-0">
                <div className="flex items-center">
                    <div className="text-muted-foreground"><HapticIcon className="w-6 h-6"/></div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-medium">Haptic Feedback</h3>
                    </div>
                    {/* Placeholder for a toggle switch */}
                </div>
            </div>

             <div className="p-4 border-b border-border last:border-b-0">
                <div className="flex items-center">
                    <div className="text-muted-foreground"><LanguageIcon className="w-6 h-6"/></div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-medium">Language</h3>
                         <p className="text-muted-foreground text-sm">English</p>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};

export default Personalization;