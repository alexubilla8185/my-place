import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { GoogleIcon } from './icons';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loadDemoData, signUp, signInWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string, email?: string, password?: string }>({});

  const validate = () => {
      const newErrors: { name?: string, email?: string, password?: string } = {};
      if (isSignUp && !name.trim()) newErrors.name = 'Name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
      if (!password.trim()) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validate()) {
          if (isSignUp) {
              signUp(name, email);
          } else {
              signInWithEmail(email);
          }
      }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left decorative panel */}
      <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center bg-secondary p-12 text-center border-r border-border overflow-hidden">
        {/* Decorative blobs */}
        <div 
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-pulse"
            aria-hidden="true"
        ></div>
        <div 
            className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 bg-accent/10 rounded-full filter blur-3xl opacity-40 animate-pulse"
            aria-hidden="true"
        ></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8">
              <Logo />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Your All-In-One Workspace</h1>
            <p className="text-muted-foreground text-lg max-w-md">
                Streamline your workflow, manage notes, and organize projects from a single, intuitive dashboard.
            </p>
        </div>
      </div>
      
      {/* Right form panel */}
      <div className="relative flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
          <div className="absolute top-6 right-6">
              <button 
                  onClick={loadDemoData} 
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="View Demo"
              >
                  View Demo
              </button>
          </div>

          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8">
                <Logo />
            </div>

            <h2 className="text-3xl font-bold mb-2">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
            <p className="text-muted-foreground mb-8">
                {isSignUp ? 'Get started for free.' : 'Welcome back! Please sign in.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                    <div>
                        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className={`w-full p-3 bg-input border ${errors.name ? 'border-destructive' : 'border-border'} rounded-md focus:ring-2 focus:ring-ring focus:outline-none`} />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>
                )}
                <div>
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={`w-full p-3 bg-input border ${errors.email ? 'border-destructive' : 'border-border'} rounded-md focus:ring-2 focus:ring-ring focus:outline-none`} />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-3 bg-input border ${errors.password ? 'border-destructive' : 'border-border'} rounded-md focus:ring-2 focus:ring-ring focus:outline-none`} />
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                </div>
                
                <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
            </div>
            
            <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
            >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
            </button>
            
            <div className="text-center mt-6 text-sm">
                <span className="text-muted-foreground">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                <button onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }} className="font-semibold text-accent hover:underline ml-1">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;