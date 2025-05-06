import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
    const listener = Hub.listen('auth', ({ payload: { event } }) => {
      switch (event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          break;
      }
    });

    return () => listener();
  }, []);

  async function checkUser() {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;
      const groups = accessToken?.payload['cognito:groups'] || [];
      setUser(session);
      setIsAdmin(groups.includes('admin'));
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
    }
  }

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};