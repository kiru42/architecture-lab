export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    name: string,
    description: string | null,
    ownerId: string,
  ): Project {
    const now = new Date();
    return new Project(id, name, description, ownerId, now, now);
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  updateInfo(name?: string, description?: string | null): Project {
    return new Project(
      this.id,
      name ?? this.name,
      description !== undefined ? description : this.description,
      this.ownerId,
      this.createdAt,
      new Date(),
    );
  }
}
