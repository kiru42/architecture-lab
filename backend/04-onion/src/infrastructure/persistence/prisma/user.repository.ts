import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { User } from '../../../core/domain/entities/user.entity';
import { IUserRepository } from '../../../core/application/interfaces/user-repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.getPasswordHash(),
        name: user.name,
      },
    });
    return PrismaUserRepository.toDomain(raw);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? PrismaUserRepository.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? PrismaUserRepository.toDomain(raw) : null;
  }

  private static toDomain(raw: {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(raw.id, raw.email, raw.password, raw.name, raw.createdAt, raw.updatedAt);
  }
}
