import { Injectable } from '@nestjs/common';
import { User } from '../../../../domain';
import { UserRepositoryPort } from '../../../../ports';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(user.id, user.email, user.password, user.name, user.createdAt);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.email, user.password, user.name, user.createdAt);
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
    return new User(created.id, created.email, created.password, created.name, created.createdAt);
  }
}
