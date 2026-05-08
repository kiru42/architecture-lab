import { PrismaService } from '../../shared/prisma/prisma.service';
import { User } from '@prisma/client';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
}
