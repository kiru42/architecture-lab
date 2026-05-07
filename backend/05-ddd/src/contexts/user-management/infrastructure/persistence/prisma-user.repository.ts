import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.getId().getValue() },
      create: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        hashedPassword: user.getHashedPassword().getValue(),
        name: user.getName().getValue(),
        createdAt: user.getCreatedAt(),
      },
      update: {
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
      },
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return User.reconstitute(
      UserId.create(row.id),
      Email.create(row.email),
      HashedPassword.fromHash(row.hashedPassword),
      UserName.create(row.name),
      row.createdAt,
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.getValue() } });
    if (!row) return null;
    return User.reconstitute(
      UserId.create(row.id),
      Email.create(row.email),
      HashedPassword.fromHash(row.hashedPassword),
      UserName.create(row.name),
      row.createdAt,
    );
  }
}
