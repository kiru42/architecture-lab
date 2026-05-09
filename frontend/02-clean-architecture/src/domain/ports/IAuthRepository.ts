import { User, AuthResponse } from '../entities';

export interface IAuthRepository {
  signUp(email: string, name: string, password: string): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  getProfile(token: string): Promise<User>;
  signOut(): void;
  isAuthenticated(): boolean;
  getToken(): string | null;
}
