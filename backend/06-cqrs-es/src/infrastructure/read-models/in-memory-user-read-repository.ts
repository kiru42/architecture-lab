import { Injectable } from '@nestjs/common';
import { UserReadModel } from '../../read-side/projections/user-read-model';

@Injectable()
export class InMemoryUserReadRepository {
  private users: Map<string, UserReadModel> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  save(user: UserReadModel): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
  }

  findById(id: string): UserReadModel | null {
    return this.users.get(id) || null;
  }

  findByEmail(email: string): UserReadModel | null {
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  findAll(): UserReadModel[] {
    return Array.from(this.users.values());
  }

  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
  }
}
