export class ProjectReadModel {
  constructor(
    public readonly id: string,
    public name: string,
    public archived: boolean,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
