import React from 'react';
import { CheckIcon, CloseIcon } from './icons';

const Check: React.FC = () => <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />;
const Cross: React.FC = () => <CloseIcon className="w-6 h-6 text-destructive mx-auto" />;

const Upgrade: React.FC = () => {
    const features = [
        { name: 'Notes, Tasks, Recordings', free: 'Up to 50 items', plus: 'Unlimited' },
        { name: 'Projects', free: 'Up to 3 projects', plus: 'Unlimited' },
        { name: 'AI Note Summarizer', free: '10 per day', plus: 'Unlimited' },
        { name: 'AI Task Scheduler', free: '10 per day', plus: 'Unlimited' },
        { name: 'AI Document Generation', free: <Cross />, plus: <Check /> },
        { name: 'Voice Transcription', free: '1 minute per recording', plus: '30 minutes per recording' },
        { name: 'Cloud Sync Across Devices', free: <Cross />, plus: <Check /> },
        { name: 'Priority Support', free: <Cross />, plus: <Check /> },
    ];

  return (
    <div className="text-center max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-accent">
        Unlock Your Full Potential
      </h1>
      <p className="text-lg text-muted-foreground mb-12">
        Choose the plan that's right for you and supercharge your productivity.
      </p>

      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-3 font-bold text-lg p-4 bg-secondary">
            <h2 className="text-left">Features</h2>
            <h2 className="text-center">Free</h2>
            <h2 className="text-center text-accent">Plus</h2>
        </div>
        <div className="divide-y divide-border">
            {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 items-center p-4">
                    <p className="text-left font-medium">{feature.name}</p>
                    <div className="text-center text-muted-foreground">{feature.free}</div>
                    <div className="text-center font-semibold text-foreground">{feature.plus}</div>
                </div>
            ))}
        </div>
      </div>

      <div className="mt-12 bg-card p-8 rounded-lg shadow-lg border border-border">
        <h2 className="text-3xl font-bold mb-4">Get Plus Today!</h2>
        <p className="text-2xl font-semibold text-accent mb-6">
            $9.99 <span className="text-base font-normal text-muted-foreground">/ month</span>
        </p>
        <button className="w-full max-w-xs px-8 py-4 bg-accent text-accent-foreground font-bold rounded-md text-lg hover:bg-accent/90 transition-all transform hover:scale-105">
            Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default Upgrade;