import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI, storage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    full_name?: string;
    password: string;
    confirm_password: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.getToken();
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          storage.setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        storage.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      storage.setToken(response.access_token);
      storage.setUser(response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    full_name?: string;
    password: string;
    confirm_password: string;
  }) => {
    try {
      const newUser = await authAPI.register(userData);
      setUser(newUser);
      storage.setUser(newUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateUser(userData);
      setUser(updatedUser);
      storage.setUser(updatedUser);
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 