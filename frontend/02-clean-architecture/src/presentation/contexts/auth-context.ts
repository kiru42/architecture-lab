import { createContext, useContext } from 'react';
import { User } from '@domain/entities';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

/**
 * The context and its accessor live apart from the provider. A module that
 * exports a component next to anything else cannot be hot-reloaded, and folding
 * them together would also make every `useAuth` import drag the provider in.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
