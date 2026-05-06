import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/ports/secondary/user.repository.interface';
import { User } from '@domain/model/user.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string, name: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: { email, password, name },
    });
    return new User(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? new User(user) : null;
  }
}
