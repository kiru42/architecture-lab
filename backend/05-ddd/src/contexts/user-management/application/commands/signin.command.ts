export class SigninCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
