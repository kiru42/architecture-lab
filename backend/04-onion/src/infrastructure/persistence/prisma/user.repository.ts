import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { User } from '../../../core/domain/entities/user.entity';
import { IUserRepository } from '../../../core/application/interfaces/user-repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return new User(raw.id, raw.email, raw.passwordHash, raw.name, raw.createdAt);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return new User(raw.id, raw.email, raw.passwordHash, raw.name, raw.createdAt);
  }

  async create(user: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.getPasswordHash(),
        name: user.name,
        createdAt: user.createdAt,
      },
    });
    return new User(raw.id, raw.email, raw.passwordHash, raw.name, raw.createdAt);
  }
}
