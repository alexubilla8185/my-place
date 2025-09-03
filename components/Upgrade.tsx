import React from 'react';

const FeatureCard: React.FC<{ title: string, description: string, icon: string }> = ({ title, description, icon }) => (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm transform hover:scale-105 transition-transform">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);


const Upgrade: React.FC = () => {
  return (
    <div className="text-center max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-accent">
        Unlock Your Full Potential with My Place Plus
      </h1>
      <p className="text-lg text-muted-foreground mb-12">
        Supercharge your productivity with powerful AI features, advanced tools, and priority support.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
        <FeatureCard 
            icon="✨"
            title="AI Scheduler"
            description="Simply type your plans in plain English, and our AI will create tasks and schedule them for you instantly."
        />
        <FeatureCard 
            icon="📝"
            title="AI Note Summarizer"
            description="Get the gist of long notes in seconds. Perfect for quick reviews and finding key information fast."
        />
        <FeatureCard 
            icon="🎤"
            title="Voice Transcription"
            description="Turn your voice memos into searchable, editable text. Never type out your spoken thoughts again."
        />
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
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