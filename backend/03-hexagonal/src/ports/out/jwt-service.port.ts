export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtServicePort {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
