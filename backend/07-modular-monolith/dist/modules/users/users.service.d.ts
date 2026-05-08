import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
}
