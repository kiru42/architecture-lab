export class UserReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly registeredAt: Date,
  ) {}
}
