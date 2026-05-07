export class RegisterDto {
  email: string;
  password: string;
  name: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class AuthResultDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
