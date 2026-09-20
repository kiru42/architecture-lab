export class RegisterDto {
  email: string;
  password: string;
  name: string;
}

export class LoginDto {
  email: string;
  password: string;
}

/** Shape required by shared/openapi.yaml — `token`, not `accessToken`. */
export class AuthResultDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class ProfileResultDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
