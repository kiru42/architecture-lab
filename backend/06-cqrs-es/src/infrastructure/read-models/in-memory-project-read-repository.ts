import { Injectable } from '@nestjs/common';
import { ProjectReadModel } from '../../read-side/projections/project-read-model';

@Injectable()
export class InMemoryProjectReadRepository {
  private projects: Map<string, ProjectReadModel> = new Map();

  save(project: ProjectReadModel): void {
    this.projects.set(project.id, project);
  }

  findById(id: string): ProjectReadModel | null {
    return this.projects.get(id) || null;
  }

  findByUserId(userId: string): ProjectReadModel[] {
    return Array.from(this.projects.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  delete(id: string): void {
    this.projects.delete(id);
  }

  clear(): void {
    this.projects.clear();
  }
}
