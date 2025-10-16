import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, neonDb, testConnection, createTables, updateTableSchema, createIndexes } from '../../lib/neon';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    initializeDatabase();
    const storedUser = localStorage.getItem('neon_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchProfile(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const initializeDatabase = async () => {
    console.log('Initializing database...');

    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Database connection failed');
      return;
    }

    // Create all tables (they have IF NOT EXISTS clauses)
    console.log('Creating all tables...');
    await createTables();

    // Update existing tables with any missing columns
    await updateTableSchema();

    // Create indexes for better performance
    await createIndexes();
  };

  const fetchProfile = async (userId: string) => {
    try {
      const profiles = await neonDb.getUserProfile(userId);
      if (profiles && profiles.length > 0) {
        setProfile(profiles[0] as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await neonDb.signIn(email, password);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('neon_user', JSON.stringify(result.user));
        await fetchProfile(result.user.id);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'buyer') => {
    try {
      const result = await neonDb.signUp(email, password, fullName, role);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('neon_user', JSON.stringify(result.user));
        await fetchProfile(result.user.id);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('neon_user');
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};