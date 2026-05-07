export interface IJwtService {
  sign(payload: { sub: string; email: string }): string;
  verify(token: string): { sub: string; email: string };
}
