export class Project {
  constructor(
    public readonly id: string,
    public name: string,
    public archived: boolean,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(name: string, userId: string): Project {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
    return new Project('', name, false, userId, new Date(), new Date());
  }

  archive(): void {
    this.archived = true;
    this.updatedAt = new Date();
  }

  unarchive(): void {
    this.archived = false;
    this.updatedAt = new Date();
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
