import React, { useEffect } from 'react';
import { authApi } from '../../entities/user/api';
import { useUserStore } from '../../entities/user/model/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading } = useUserStore();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        setUser(response.user);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [setUser, setLoading]);

  return <>{children}</>;
};
