import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/ports/secondary/user.repository.interface';
import { User } from '../../../../domain/model/user.entity';
import { PrismaService } from './prisma.service';

/** Driven adapter: implements the IUserRepository port on top of Prisma. */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string, name: string): Promise<User> {
    const row = await this.prisma.user.create({ data: { email, password, name } });
    return new User(row);
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? new User(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? new User(row) : null;
  }
}
