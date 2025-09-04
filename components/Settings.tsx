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
      <h1 className="hidden lg:block text-3xl font-bold text-on-surface">Settings</h1>
      
      <div className="space-y-4">
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 p-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center font-bold text-2xl text-on-secondary-container">
                {user.isGuest ? <UserIcon className="w-8 h-8"/> : user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 className="text-xl font-semibold text-on-surface">{user.name}</h2>
                <p className="text-on-surface-variant">{user.email}</p>
            </div>
        </div>

        {/* Settings List */}
        <div className="rounded-xl overflow-hidden border border-outline-variant">
            {settingsItems.map((item, index) => (
                 <button key={item.label} onClick={() => setActivePage(item.page)} className={`w-full flex items-center text-left p-4 h-16 hover:bg-surface-container-high transition-colors ${index < settingsItems.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                    <div className="text-on-surface-variant">{item.icon}</div>
                    <span className="ml-4 flex-1 text-on-surface">{item.label}</span>
                    <ChevronRightIcon className="w-5 h-5 text-on-surface-variant"/>
                 </button>
            ))}
        </div>
        
        {/* Sign Out */}
        <div className="rounded-xl overflow-hidden border border-outline-variant">
             <button onClick={signOut} className="w-full flex items-center text-left p-4 h-16 text-destructive hover:bg-surface-container-high transition-colors">
                <div className="text-destructive"><SignOutIcon className="w-6 h-6"/></div>
                <span className="ml-4 flex-1">Sign out</span>
             </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;