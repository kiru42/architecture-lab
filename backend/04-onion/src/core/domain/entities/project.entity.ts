/**
 * Onion layer: Domain (the centre).
 *
 * Project owns the rules about archiving and renaming; nothing here knows that
 * Prisma or HTTP exist.
 */
export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly archived: boolean,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(name: string, userId: string, now = new Date()): Project {
    return new Project('', name, false, userId, now, now);
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  /** Domain behaviour: archiving is idempotent. */
  archive(): Project {
    return this.with({ archived: true });
  }

  unarchive(): Project {
    return this.with({ archived: false });
  }

  rename(name: string): Project {
    return this.with({ name });
  }

  private with(changes: Partial<Pick<Project, 'name' | 'archived'>>): Project {
    return new Project(
      this.id,
      changes.name ?? this.name,
      changes.archived ?? this.archived,
      this.userId,
      this.createdAt,
      new Date(),
    );
  }
}
