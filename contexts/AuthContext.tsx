import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  email: string;
  role: 'admin' | 'patient';
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (user: User) => {
    setUserState(user);
  };

  const logout = () => {
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
