import { User } from '../types';

const API_BASE = 'http://localhost:5001/api';

export const authService = {
  async signup(email: string, name: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    return response.json();
  },

  async signin(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signin failed');
    }
    return response.json();
  },

  async getProfile(): Promise<{ user: User }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },
};
