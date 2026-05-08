import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        user: Omit<import(".prisma/client").User, "password">;
        token: string;
    }>;
    signin(dto: SigninDto): Promise<{
        user: Omit<import(".prisma/client").User, "password">;
        token: string;
    }>;
    getMe(user: {
        id: string;
        email: string;
    }): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
}
