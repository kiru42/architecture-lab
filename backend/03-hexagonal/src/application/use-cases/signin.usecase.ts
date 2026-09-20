import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ISigninUseCase } from '../../domain/ports/primary/signin.usecase.interface';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '../../domain/ports/secondary/user.repository.interface';
import { User } from '../../domain/model/user.entity';

@Injectable()
export class SigninUseCase implements ISigninUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { user, token };
  }
}
