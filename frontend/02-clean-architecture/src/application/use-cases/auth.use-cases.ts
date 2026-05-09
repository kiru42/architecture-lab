import { IAuthRepository } from '@domain/ports';
import { User, AuthResponse } from '@domain/entities';

export class SignUpUseCase {
  constructor(private authRepo: IAuthRepository) {}
  async execute(email: string, name: string, password: string): Promise<AuthResponse> {
    return this.authRepo.signUp(email, name, password);
  }
}

export class SignInUseCase {
  constructor(private authRepo: IAuthRepository) {}
  async execute(email: string, password: string): Promise<AuthResponse> {
    return this.authRepo.signIn(email, password);
  }
}

export class GetProfileUseCase {
  constructor(private authRepo: IAuthRepository) {}
  async execute(token: string): Promise<User> {
    return this.authRepo.getProfile(token);
  }
}

export class SignOutUseCase {
  constructor(private authRepo: IAuthRepository) {}
  execute(): void {
    this.authRepo.signOut();
  }
}

export class IsAuthenticatedUseCase {
  constructor(private authRepo: IAuthRepository) {}
  execute(): boolean {
    return this.authRepo.isAuthenticated();
  }
}
