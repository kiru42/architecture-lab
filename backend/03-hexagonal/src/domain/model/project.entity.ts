// Domain Entity: Project
export class Project {
  id: string;
  name: string;
  archived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    archived: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.archived = data.archived;
    this.userId = data.userId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Domain logic: archive project
  archive(): void {
    this.archived = true;
  }

  // Domain logic: unarchive project
  unarchive(): void {
    this.archived = false;
  }
}
