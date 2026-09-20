import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository, User } from '../../core/domain';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    if (!prismaUser) return null;

    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!prismaUser) return null;

    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  async save(user: User): Promise<User> {
    const data = {
      email: user.email,
      password: user.getPassword(),
      name: user.name,
      updatedAt: user.updatedAt,
    };

    let prismaUser;
    if (user.id) {
      // Update existing
      prismaUser = await this.prisma.user.update({
        where: { id: user.id },
        data,
      });
    } else {
      // Create new
      prismaUser = await this.prisma.user.create({ data });
    }

    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
