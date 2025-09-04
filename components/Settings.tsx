import React from 'react';
import { Page } from '../types';
import { ChevronRightIcon, PersonalizationIcon, DataIcon, VoiceIcon, SecurityIcon, InfoIcon, SignOutIcon, UserIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface SettingsProps {
  setActivePage: (page: Page) => void;
}

const Settings: React.FC<SettingsProps> = ({ setActivePage }) => {
    const { user, signOut } = useAuth();
    
    const settingsItems = [
        { icon: <PersonalizationIcon className="w-6 h-6"/>, label: 'Personalization', page: Page.Personalization },
        { icon: <DataIcon className="w-6 h-6"/>, label: 'Data Controls', page: Page.Dashboard }, // Placeholder
        { icon: <VoiceIcon className="w-6 h-6"/>, label: 'Voice', page: Page.Dashboard }, // Placeholder
        { icon: <SecurityIcon className="w-6 h-6"/>, label: 'Security', page: Page.Dashboard }, // Placeholder
        { icon: <InfoIcon className="w-6 h-6"/>, label: 'About', page: Page.HowItWorks },
    ];
    
    if (!user) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="hidden lg:block text-3xl font-bold">Settings</h1>
      
      <div className="space-y-4">
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 p-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-2xl">
                {user.isGuest ? <UserIcon className="w-8 h-8 text-muted-foreground"/> : user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
        </div>

        {/* Settings List */}
        <div className="border-y border-border">
            {settingsItems.map((item) => (
                 <button key={item.label} onClick={() => setActivePage(item.page)} className="w-full flex items-center text-left p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0">
                    <div className="text-muted-foreground">{item.icon}</div>
                    <span className="ml-4 flex-1">{item.label}</span>
                    <ChevronRightIcon className="w-5 h-5 text-muted-foreground"/>
                 </button>
            ))}
        </div>
        
        {/* Sign Out */}
        <div className="border-y border-border">
             <button onClick={signOut} className="w-full flex items-center text-left p-4 text-destructive hover:bg-muted transition-colors">
                <div className="text-destructive"><SignOutIcon className="w-6 h-6"/></div>
                <span className="ml-4 flex-1">Sign out</span>
             </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;