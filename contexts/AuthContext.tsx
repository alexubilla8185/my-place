import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { demoNotes, demoTasks, demoRecordings, demoProjects } from '../data/demoData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  loadDemoData: () => void;
  signUp: (name: string, email: string) => void;
  signInWithEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearAppData = () => {
    localStorage.removeItem('notes');
    localStorage.removeItem('tasks');
    localStorage.removeItem('recordings');
    localStorage.removeItem('projects');
};

// This function is now internal to the provider, used by loadDemoData
const signInAsGuest = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'Viewing Demo',
      isGuest: true,
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = () => {
    setLoading(true);
    clearAppData();
    const mockUser: User = {
      id: 'google-123',
      name: 'Alejandro U',
      email: 'alejandro@tekguyz.com',
      isGuest: false,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };
  
  const signUp = (name: string, email: string) => {
    setLoading(true);
    clearAppData();
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        isGuest: false,
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
  };
  
  const signInWithEmail = (email: string) => {
    setLoading(true);
    clearAppData();
    // In a real app, you'd fetch user data. Here, we mock it.
    const mockUser: User = {
        id: `user-${Date.now()}`,
        name: 'Alejandro U', // Mocked name
        email,
        isGuest: false,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const signOut = () => {
    setLoading(true);
    clearAppData();
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
  };

  const loadDemoData = () => {
    setLoading(true);
    clearAppData();
    localStorage.setItem('notes', JSON.stringify(demoNotes));
    localStorage.setItem('tasks', JSON.stringify(demoTasks));
    localStorage.setItem('recordings', JSON.stringify(demoRecordings));
    localStorage.setItem('projects', JSON.stringify(demoProjects));
    signInAsGuest(setUser); // Use internal function
    setLoading(false);
  };

  const value = { user, loading, signInWithGoogle, signOut, loadDemoData, signUp, signInWithEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};