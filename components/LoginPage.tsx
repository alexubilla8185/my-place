import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
      else if (isSignUp && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-0">
            <div className="absolute inset-0 bg-background bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--accent)/0.1),transparent)]"></div>
        </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={loadDemoData}
          className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          View Demo
        </button>
      </div>
      
      <div className="w-full max-w-md bg-card/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-border z-10">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
                {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2">
                 {isSignUp ? "Enter your details to get started." : "Sign in to access your workspace."}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
                <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <input
                        id="name"
                        placeholder="Alejandro U"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full p-3 bg-input text-sm text-foreground placeholder:text-muted-foreground rounded-md border focus:outline-none focus:ring-2 focus:ring-ring ${errors.name ? 'border-destructive' : 'border-border'}`}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
            )}
            
            <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                    id="email"
                    placeholder="alejandro@tekguyz.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 bg-input text-sm text-foreground placeholder:text-muted-foreground rounded-md border focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? 'border-destructive' : 'border-border'}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    {!isSignUp && (
                         <button type="button" className="text-xs text-muted-foreground hover:underline font-medium focus:outline-none">
                            Forgot password?
                        </button>
                    )}
                </div>
                <input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 bg-input text-sm text-foreground placeholder:text-muted-foreground rounded-md border focus:outline-none focus:ring-2 focus:ring-ring ${errors.password ? 'border-destructive' : 'border-border'}`}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            
            <button type="submit" className="w-full mt-2 bg-primary text-primary-foreground font-semibold py-3 rounded-md shadow hover:bg-primary/90 transition-colors">
                {isSignUp ? "Create Account" : "Sign In"}
            </button>
        </form>

        <div className="flex items-center w-full my-6">
            <div className="flex-grow border-t border-dashed border-border"></div>
            <span className="mx-4 text-xs text-muted-foreground">OR</span>
            <div className="flex-grow border-t border-dashed border-border"></div>
        </div>
        
        <button onClick={signInWithGoogle} className="flex items-center justify-center w-full py-3 rounded-md border border-border bg-secondary hover:bg-muted transition-colors text-secondary-foreground font-medium text-sm">
            <GoogleIcon className="w-5 h-5 mr-3" />
            Continue with Google
        </button>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setErrors({});}} className="font-semibold text-primary hover:underline underline-offset-4 focus:outline-none">
                {isSignUp ? "Sign In" : "Sign Up"}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
