import { apiClient } from '../../../shared/api/client';
import { AuthResponse, SignUpDto, SignInDto, User } from '../../../shared/types';

export const authApi = {
  async signup(data: SignUpDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    localStorage.setItem('token', response.token);
    return response;
  },

  async signin(data: SignInDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', data);
    localStorage.setItem('token', response.token);
    return response;
  },

  async getProfile(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/profile');
  },
};
