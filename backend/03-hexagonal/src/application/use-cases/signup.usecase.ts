import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ISignupUseCase } from '../../domain/ports/primary/signup.usecase.interface';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '../../domain/ports/secondary/user.repository.interface';
import { User } from '../../domain/model/user.entity';

@Injectable()
export class SignupUseCase implements ISignupUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.create(email, hashedPassword, name);

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { user, token };
  }
}
