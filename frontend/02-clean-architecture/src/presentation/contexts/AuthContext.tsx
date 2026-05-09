import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@domain/entities';
import { container } from '@infrastructure/di/container';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticatedUseCase = container.isAuthenticatedUseCase();
  const getProfileUseCase = container.getProfileUseCase();
  const signInUseCase = container.signInUseCase();
  const signUpUseCase = container.signUpUseCase();
  const signOutUseCase = container.signOutUseCase();

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticatedUseCase.execute()) {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          try {
            const profile = await getProfileUseCase.execute(storedToken);
            setUser(profile);
            setToken(storedToken);
          } catch (error) {
            console.error('Failed to load profile:', error);
            signOutUseCase.execute();
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await signInUseCase.execute(email, password);
    setUser(response.user);
    setToken(response.accessToken);
  };

  const signUp = async (email: string, name: string, password: string) => {
    const response = await signUpUseCase.execute(email, name, password);
    setUser(response.user);
    setToken(response.accessToken);
  };

  const signOut = () => {
    signOutUseCase.execute();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
