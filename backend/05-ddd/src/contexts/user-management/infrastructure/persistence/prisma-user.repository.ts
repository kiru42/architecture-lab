import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';

/**
 * Maps the User aggregate onto the frozen \`User\` table: the HashedPassword value
 * object is stored in the column named \`password\`. That rename lives here and
 * nowhere else.
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const id = user.getId().getValue();
    await this.prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: user.getEmail().getValue(),
        password: user.getHashedPassword().getValue(),
        name: user.getName().getValue(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      },
      update: {
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
      },
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.getValue() } });
    return row ? PrismaUserRepository.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.getValue() } });
    return row ? PrismaUserRepository.toDomain(row) : null;
  }

  private static toDomain(row: {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstitute(
      UserId.create(row.id),
      Email.create(row.email),
      HashedPassword.fromHash(row.password),
      UserName.create(row.name),
      row.createdAt,
      row.updatedAt,
    );
  }
}
