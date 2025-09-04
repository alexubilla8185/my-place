import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Note, Task, Recording, Project } from '../types';
import { demoNotes, demoTasks, demoRecordings, demoProjects } from '../data/demoData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInAsGuest: () => void;
  signOut: () => void;
  loadDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearAppData = () => {
    localStorage.removeItem('notes');
    localStorage.removeItem('tasks');
    localStorage.removeItem('recordings');
    localStorage.removeItem('projects');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
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
    // This is a mock sign-in
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

  const signInAsGuest = () => {
    setLoading(true);
    clearAppData();
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'No email',
      isGuest: true,
    };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
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
    signInAsGuest();
    setLoading(false);
  };

  const value = { user, loading, signInWithGoogle, signInAsGuest, signOut, loadDemoData };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};