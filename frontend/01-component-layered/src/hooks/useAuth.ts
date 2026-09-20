import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        localStorage.removeItem('token');
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signup = async (email: string, name: string, password: string) => {
    try {
      setError(null);
      const { user, token } = await authService.signup(email, name, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      setError(null);
      const { user, token } = await authService.signin(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signin failed');
      throw err;
    }
  };

  const signout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, error, signup, signin, signout };
}
