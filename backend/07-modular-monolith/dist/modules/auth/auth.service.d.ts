import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    signup(email: string, password: string, name: string): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    signin(email: string, password: string): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    getMe(userId: string): Promise<Omit<User, 'password'>>;
    private toPublicUser;
}
