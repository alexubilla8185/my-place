import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { GoogleIcon, UserIcon } from './icons';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, loadDemoData } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
            <Logo />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to your workspace</h1>
        <p className="text-muted-foreground mb-10">Sign in or start as a guest to begin organizing your life.</p>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>
          
          <button
            onClick={signInAsGuest}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>
        
        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
        </div>

        <button
          onClick={loadDemoData}
          className="w-full py-3 px-4 bg-transparent text-accent font-semibold rounded-lg border-2 border-accent/30 hover:bg-accent hover:text-accent-foreground transition-all"
        >
          View Demo
        </button>
      </div>
    </div>
  );
};

export default LoginPage;