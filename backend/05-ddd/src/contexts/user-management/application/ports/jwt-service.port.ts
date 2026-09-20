export interface IJwtService {
  sign(payload: { sub: string; email: string }): string;
}

export const IJwtService = Symbol('IJwtService');
