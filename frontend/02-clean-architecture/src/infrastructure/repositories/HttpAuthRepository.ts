import { IAuthRepository } from '@domain/ports';
import { User, AuthResponse } from '@domain/entities';
import { apiClient } from '../api/api-client';
import { TOKEN_KEY } from '../storage/tokenStorage';

export class HttpAuthRepository implements IAuthRepository {
  async signUp(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', { email, name, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    return response;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', { email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    return response;
  }

  async getProfile(token: string): Promise<User> {
    return apiClient.get<User>('/auth/me', token);
  }

  signOut(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}