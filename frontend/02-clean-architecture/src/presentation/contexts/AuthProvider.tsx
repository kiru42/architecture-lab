import { useState, useEffect, ReactNode } from 'react';
import { User } from '@domain/entities';
import { container } from '@infrastructure/di/container';
import { TOKEN_KEY } from '@infrastructure/storage/tokenStorage';
import { AuthContext, AuthContextValue } from './auth-context';

// The container hands out a fresh instance on every call. Hoisting them here
// keeps the references stable between renders, which is what the effect below
// needs to depend on.
const isAuthenticatedUseCase = container.isAuthenticatedUseCase();
const getProfileUseCase = container.getProfileUseCase();
const signInUseCase = container.signInUseCase();
const signUpUseCase = container.signUpUseCase();
const signOutUseCase = container.signOutUseCase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticatedUseCase.execute()) {
        const storedToken = localStorage.getItem(TOKEN_KEY);
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
    setToken(response.token);
  };

  const signUp = async (email: string, name: string, password: string) => {
    const response = await signUpUseCase.execute(email, name, password);
    setUser(response.user);
    setToken(response.token);
  };

  const signOut = () => {
    signOutUseCase.execute();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextValue = { user, token, signIn, signUp, signOut, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
